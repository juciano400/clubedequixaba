import express from "express";
import { createServer } from "http";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  DEFAULT_CONTENT,
  DEFAULT_SETTINGS,
  type AgendaItem,
  type AppSettings,
  type BookItem,
  type SiteContent,
} from "../shared/content";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Persistência (agenda + capas) -----------------------------------------
// DATA_DIR deve apontar para um diretório durável. No Railway, monte um Volume
// e defina DATA_DIR (ex.: /data); sem isso os dados são reiniciados a cada deploy.
const DATA_DIR = process.env.DATA_DIR || path.resolve(process.cwd(), "data");
const UPLOADS_DIR = path.join(DATA_DIR, "uploads");
const CONTENT_FILE = path.join(DATA_DIR, "content.json");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");

// --- Autenticação (apenas e-mail, por escolha do usuário) ------------------
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "profjuciano").trim().toLowerCase();
const ADMIN_SECRET = process.env.ADMIN_SECRET || "clube-de-leitura-de-quixaba";
const ADMIN_TOKEN = crypto.createHmac("sha256", ADMIN_SECRET).update(ADMIN_EMAIL).digest("hex");

function ensureStorage() {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  if (!fs.existsSync(CONTENT_FILE)) {
    fs.writeFileSync(CONTENT_FILE, JSON.stringify(DEFAULT_CONTENT, null, 2), "utf-8");
  }
}

function loadContent(): SiteContent {
  try {
    const raw = JSON.parse(fs.readFileSync(CONTENT_FILE, "utf-8"));
    return {
      agenda: Array.isArray(raw.agenda) ? raw.agenda : [],
      books: Array.isArray(raw.books) ? raw.books : [],
    };
  } catch {
    return { agenda: [...DEFAULT_CONTENT.agenda], books: [...DEFAULT_CONTENT.books] };
  }
}

function saveContent(content: SiteContent) {
  fs.writeFileSync(CONTENT_FILE, JSON.stringify(content, null, 2), "utf-8");
}

function loadSettings(): AppSettings {
  try {
    const raw = JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf-8"));
    return {
      cloudinary: {
        cloudName: typeof raw?.cloudinary?.cloudName === "string" ? raw.cloudinary.cloudName : "",
        uploadPreset: typeof raw?.cloudinary?.uploadPreset === "string" ? raw.cloudinary.uploadPreset : "",
      },
    };
  } catch {
    return { cloudinary: { ...DEFAULT_SETTINGS.cloudinary } };
  }
}

function saveSettings(settings: AppSettings) {
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), "utf-8");
}

const str = (v: unknown, max = 600) => (typeof v === "string" ? v.trim().slice(0, max) : "");

function sanitizeAgenda(input: unknown): AgendaItem[] {
  if (!Array.isArray(input)) return [];
  return input.slice(0, 50).map((raw: any) => ({
    id: str(raw?.id, 64) || crypto.randomUUID(),
    title: str(raw?.title, 140),
    date: str(raw?.date, 10),
    time: str(raw?.time, 40),
    type: str(raw?.type, 60),
    location: str(raw?.location, 300),
  }));
}

const EXT_BY_MIME: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

// Grava uma imagem enviada como data URL e devolve o caminho público /uploads/...
function writeCover(id: string, dataUrl: string): string | undefined {
  const match = /^data:([^;]+);base64,([\s\S]+)$/.exec(dataUrl);
  if (!match) return undefined;
  const ext = EXT_BY_MIME[match[1].toLowerCase()];
  if (!ext) return undefined;
  const buffer = Buffer.from(match[2], "base64");
  if (buffer.length > 8 * 1024 * 1024) return undefined; // 8MB por capa
  const safeId = id.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64) || crypto.randomUUID();
  const filename = `${safeId}.${ext}`;
  fs.writeFileSync(path.join(UPLOADS_DIR, filename), buffer);
  return `/uploads/${filename}`;
}

function sanitizeBooks(input: unknown): BookItem[] {
  if (!Array.isArray(input)) return [];
  return input.slice(0, 60).map((raw: any) => {
    const id = str(raw?.id, 64) || crypto.randomUUID();
    const book: BookItem = {
      id,
      title: str(raw?.title, 140),
      author: str(raw?.author, 140),
    };
    if (typeof raw?.coverData === "string" && raw.coverData.startsWith("data:")) {
      const url = writeCover(id, raw.coverData);
      if (url) book.coverUrl = url;
    } else if (
      typeof raw?.coverUrl === "string" &&
      (raw.coverUrl.startsWith("/uploads/") ||
        raw.coverUrl.startsWith("https://") ||
        raw.coverUrl.startsWith("http://"))
    ) {
      book.coverUrl = str(raw.coverUrl, 400);
    }
    if (!book.coverUrl) {
      // capa "desenhada" (fallback)
      if (raw?.color) book.color = str(raw.color, 40);
      if (raw?.eyebrow) book.eyebrow = str(raw.eyebrow, 40);
      if (raw?.mark) book.mark = str(raw.mark, 8);
    }
    return book;
  });
}

async function startServer() {
  ensureStorage();

  const app = express();
  const server = createServer(app);
  app.use(express.json({ limit: "12mb" }));

  const requireAuth: express.RequestHandler = (req, res, next) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";
    const ok =
      token.length === ADMIN_TOKEN.length &&
      crypto.timingSafeEqual(Buffer.from(token), Buffer.from(ADMIN_TOKEN));
    if (!ok) return res.status(401).json({ error: "Não autorizado" });
    next();
  };

  // Conteúdo público
  app.get("/api/content", (_req, res) => {
    res.setHeader("Cache-Control", "no-store");
    res.json(loadContent());
  });

  // Login apenas por e-mail
  app.post("/api/login", (req, res) => {
    const email = str(req.body?.email, 120).toLowerCase();
    if (email !== ADMIN_EMAIL) {
      return res.status(401).json({ error: "E-mail não reconhecido." });
    }
    res.json({ token: ADMIN_TOKEN, email: ADMIN_EMAIL });
  });

  // Salvar agenda
  app.put("/api/agenda", requireAuth, (req, res) => {
    const content = loadContent();
    content.agenda = sanitizeAgenda(req.body?.agenda);
    saveContent(content);
    res.json(content);
  });

  // Salvar obras (com upload de capas via data URL)
  app.put("/api/books", requireAuth, (req, res) => {
    const content = loadContent();
    content.books = sanitizeBooks(req.body?.books);
    saveContent(content);
    res.json(content);
  });

  // Configurações do painel (Cloudinary) — só o admin lê/escreve
  app.get("/api/settings", requireAuth, (_req, res) => {
    res.json(loadSettings());
  });

  app.put("/api/settings", requireAuth, (req, res) => {
    const settings: AppSettings = {
      cloudinary: {
        cloudName: str(req.body?.cloudinary?.cloudName, 120),
        uploadPreset: str(req.body?.cloudinary?.uploadPreset, 120),
      },
    };
    saveSettings(settings);
    res.json(settings);
  });

  // Capas enviadas (diretório durável)
  app.use(
    "/uploads",
    express.static(UPLOADS_DIR, {
      setHeaders: (res) => res.setHeader("Cache-Control", "public, max-age=86400"),
    }),
  );

  // Arquivos estáticos do build
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(
    express.static(staticPath, {
      index: false,
      setHeaders: (res, filePath) => {
        if (filePath.includes(`${path.sep}assets${path.sep}`)) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        } else {
          res.setHeader("Cache-Control", "public, max-age=3600");
        }
      },
    }),
  );

  // Client-side routing: entrega index.html para rotas que não são arquivos
  app.get("*", (_req, res) => {
    res.setHeader("Cache-Control", "no-cache");
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = Number(process.env.PORT) || 3000;
  const host = process.env.HOST || "0.0.0.0";

  server.listen(port, host, () => {
    console.log(`Server running on http://${host}:${port}/  (data: ${DATA_DIR})`);
  });
}

startServer().catch(console.error);
