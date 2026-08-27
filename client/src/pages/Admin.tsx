import { type FormEvent, useEffect, useState } from "react";
import { ArrowLeft, BookOpen, CalendarDays, Cloud, LogOut, Plus, Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";
import type { AgendaItem, AppSettings, BookItem, SiteContent } from "@shared/content";
import { DEFAULT_SETTINGS } from "@shared/content";
import {
  fetchContent,
  fileToDataUrl,
  getSettings,
  getToken,
  login as apiLogin,
  saveAgenda,
  saveBooks,
  saveSettings,
  setToken,
  uploadToCloudinary,
} from "@/lib/api";

const uid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random());

const emptyAgendaForm = { title: "", date: "", time: "", type: "Encontro presencial", location: "" };

function formatDatePt(date: string): string {
  const parts = date.split("-");
  if (parts.length !== 3) return date;
  const [y, m, d] = parts.map(Number);
  if (!y || !m || !d) return date;
  return `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
}

export default function Admin() {
  const [token, setTok] = useState<string | null>(() => getToken());
  const [email, setEmail] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const [content, setContent] = useState<SiteContent | null>(null);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [busy, setBusy] = useState(false);

  const [agendaForm, setAgendaForm] = useState(emptyAgendaForm);
  const [bookForm, setBookForm] = useState({ title: "", author: "" });
  const [bookFile, setBookFile] = useState<File | null>(null);

  useEffect(() => {
    if (!token) return;
    fetchContent()
      .then(setContent)
      .catch(() => toast.error("Não foi possível carregar o conteúdo."));
    getSettings(token)
      .then(setSettings)
      .catch(() => {
        /* mantém o padrão vazio */
      });
  }, [token]);

  const cloudinaryReady = Boolean(settings.cloudinary.cloudName && settings.cloudinary.uploadPreset);

  async function persistSettings(event: FormEvent) {
    event.preventDefault();
    if (!token) return;
    setBusy(true);
    try {
      const updated = await saveSettings(settings, token);
      setSettings(updated);
      toast.success("Configurações salvas.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar as configurações.");
    } finally {
      setBusy(false);
    }
  }

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    setLoggingIn(true);
    try {
      const t = await apiLogin(email.trim());
      setToken(t);
      setTok(t);
      toast.success("Bem-vindo(a)! Você está no painel.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível entrar.");
    } finally {
      setLoggingIn(false);
    }
  }

  function logout() {
    setToken(null);
    setTok(null);
    setContent(null);
  }

  async function persistAgenda(agenda: AgendaItem[]) {
    if (!token) return;
    setBusy(true);
    try {
      const updated = await saveAgenda(agenda, token);
      setContent(updated);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar.");
      if (err instanceof Error && err.message.includes("Sessão")) logout();
    } finally {
      setBusy(false);
    }
  }

  async function persistBooks(books: BookItem[]) {
    if (!token) return;
    setBusy(true);
    try {
      const updated = await saveBooks(books, token);
      setContent(updated);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar.");
      if (err instanceof Error && err.message.includes("Sessão")) logout();
    } finally {
      setBusy(false);
    }
  }

  async function addAgenda(event: FormEvent) {
    event.preventDefault();
    if (!content) return;
    if (!agendaForm.title.trim() || !agendaForm.date) {
      toast.error("Preencha ao menos o título e a data.");
      return;
    }
    const item: AgendaItem = {
      id: uid(),
      title: agendaForm.title.trim(),
      date: agendaForm.date,
      time: agendaForm.time.trim() || "16h",
      type: agendaForm.type.trim() || "Encontro",
      location: agendaForm.location.trim(),
    };
    await persistAgenda([...content.agenda, item]);
    setAgendaForm(emptyAgendaForm);
    toast.success("Encontro adicionado à agenda.");
  }

  async function removeAgenda(id: string) {
    if (!content) return;
    await persistAgenda(content.agenda.filter((a) => a.id !== id));
  }

  async function addBook(event: FormEvent) {
    event.preventDefault();
    if (!content) return;
    if (!bookForm.title.trim() || !bookForm.author.trim()) {
      toast.error("Preencha o título e o autor da obra.");
      return;
    }
    if (!bookFile) {
      toast.error("Selecione a imagem da capa.");
      return;
    }
    setBusy(true);
    try {
      const base = { id: uid(), title: bookForm.title.trim(), author: bookForm.author.trim() };
      let item: BookItem;
      if (cloudinaryReady) {
        const coverUrl = await uploadToCloudinary(bookFile, settings.cloudinary.cloudName, settings.cloudinary.uploadPreset);
        item = { ...base, coverUrl };
      } else {
        // Sem Cloudinary configurado: guarda a capa no servidor (requer Volume no Railway).
        const coverData = await fileToDataUrl(bookFile);
        item = { ...base, coverData };
      }
      const updated = await saveBooks([...content.books, item], token!);
      setContent(updated);
      setBookForm({ title: "", author: "" });
      setBookFile(null);
      toast.success("Obra adicionada à estante.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar a obra.");
    } finally {
      setBusy(false);
    }
  }

  async function removeBook(id: string) {
    if (!content) return;
    await persistBooks(content.books.filter((b) => b.id !== id));
  }

  if (!token) {
    return (
      <div className="admin-shell">
        <div className="admin-login">
          <div className="admin-badge">
            <BookOpen size={22} />
          </div>
          <h1>Painel do Clube</h1>
          <p>Entre com seu e-mail para gerenciar a agenda e as capas das obras.</p>
          <form onSubmit={handleLogin}>
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="profjuciano"
              autoComplete="username"
              autoFocus
            />
            <button className="admin-btn admin-btn-primary" type="submit" disabled={loggingIn}>
              {loggingIn ? "Entrando…" : "Entrar"}
            </button>
          </form>
          <Link href="/" className="admin-back">
            <ArrowLeft size={15} /> Voltar ao site
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div>
          <span className="admin-eyebrow">Clube de Leitura de Quixaba</span>
          <h1>Painel de conteúdo</h1>
        </div>
        <div className="admin-header-actions">
          <Link href="/" className="admin-btn admin-btn-ghost">
            <ArrowLeft size={15} /> Ver o site
          </Link>
          <button className="admin-btn admin-btn-ghost" onClick={logout}>
            <LogOut size={15} /> Sair
          </button>
        </div>
      </header>

      {!content ? (
        <p className="admin-loading">Carregando…</p>
      ) : (
        <>
        {/* CONFIGURAÇÕES: CLOUDINARY */}
        <section className="admin-card admin-card-wide">
          <div className="admin-card-title">
            <Cloud size={19} /> <h2>Cloudinary (capas)</h2>
            <span className={`admin-tag ${cloudinaryReady ? "is-on" : "is-off"}`}>
              {cloudinaryReady ? "ativo" : "não configurado"}
            </span>
          </div>
          <p className="admin-hint">
            Configure o Cloudinary para hospedar as capas das obras. No painel do Cloudinary, crie um
            <strong> Upload preset</strong> do tipo <strong>Unsigned</strong> e informe abaixo o
            <strong> Cloud name</strong> e o nome do preset. Enquanto não configurar, as capas ficam salvas no servidor.
          </p>
          <form className="admin-form admin-form-inline" onSubmit={persistSettings}>
            <div className="admin-form-row">
              <div>
                <label>Cloud name</label>
                <input
                  value={settings.cloudinary.cloudName}
                  onChange={(e) => setSettings({ cloudinary: { ...settings.cloudinary, cloudName: e.target.value } })}
                  placeholder="ex.: dxxxxxx"
                  autoComplete="off"
                />
              </div>
              <div>
                <label>Upload preset (unsigned)</label>
                <input
                  value={settings.cloudinary.uploadPreset}
                  onChange={(e) => setSettings({ cloudinary: { ...settings.cloudinary, uploadPreset: e.target.value } })}
                  placeholder="ex.: clube_quixaba"
                  autoComplete="off"
                />
              </div>
            </div>
            <button className="admin-btn admin-btn-primary" type="submit" disabled={busy}>
              Salvar chave
            </button>
          </form>
        </section>

        <div className="admin-grid">
          {/* AGENDA */}
          <section className="admin-card">
            <div className="admin-card-title">
              <CalendarDays size={19} /> <h2>Agenda de encontros</h2>
            </div>

            <ul className="admin-list">
              {content.agenda.length === 0 && <li className="admin-empty">Nenhum encontro cadastrado ainda.</li>}
              {content.agenda.map((item) => (
                <li key={item.id} className="admin-item">
                  <div>
                    <strong>{item.title}</strong>
                    <span>
                      {formatDatePt(item.date)} · {item.time} · {item.type}
                    </span>
                    {item.location && <span className="admin-item-sub">{item.location}</span>}
                  </div>
                  <button className="admin-icon-btn" onClick={() => removeAgenda(item.id)} aria-label="Remover" disabled={busy}>
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>

            <form className="admin-form" onSubmit={addAgenda}>
              <label>Título</label>
              <input
                value={agendaForm.title}
                onChange={(e) => setAgendaForm({ ...agendaForm, title: e.target.value })}
                placeholder="Roda de leitura na escola"
              />
              <div className="admin-form-row">
                <div>
                  <label>Data</label>
                  <input type="date" value={agendaForm.date} onChange={(e) => setAgendaForm({ ...agendaForm, date: e.target.value })} />
                </div>
                <div>
                  <label>Horário</label>
                  <input value={agendaForm.time} onChange={(e) => setAgendaForm({ ...agendaForm, time: e.target.value })} placeholder="16h" />
                </div>
              </div>
              <label>Tipo</label>
              <input value={agendaForm.type} onChange={(e) => setAgendaForm({ ...agendaForm, type: e.target.value })} placeholder="Encontro presencial" />
              <label>Local</label>
              <textarea
                rows={2}
                value={agendaForm.location}
                onChange={(e) => setAgendaForm({ ...agendaForm, location: e.target.value })}
                placeholder="Escola Estadual de Ensino Médio Herculano Pereira — …"
              />
              <button className="admin-btn admin-btn-primary" type="submit" disabled={busy}>
                <Plus size={16} /> Adicionar encontro
              </button>
            </form>
          </section>

          {/* OBRAS */}
          <section className="admin-card">
            <div className="admin-card-title">
              <BookOpen size={19} /> <h2>Capas das obras</h2>
            </div>

            <ul className="admin-books">
              {content.books.length === 0 && <li className="admin-empty">Nenhuma obra cadastrada ainda.</li>}
              {content.books.map((book) => (
                <li key={book.id} className="admin-book">
                  <div className="admin-book-cover">
                    {book.coverUrl ? <img src={book.coverUrl} alt={book.title} /> : <span>{book.title}</span>}
                  </div>
                  <div className="admin-book-info">
                    <strong>{book.title}</strong>
                    <span>{book.author}</span>
                  </div>
                  <button className="admin-icon-btn" onClick={() => removeBook(book.id)} aria-label="Remover" disabled={busy}>
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>

            <form className="admin-form" onSubmit={addBook}>
              <label>Título da obra</label>
              <input value={bookForm.title} onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })} placeholder="Vidas Secas" />
              <label>Autor(a)</label>
              <input value={bookForm.author} onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })} placeholder="Graciliano Ramos" />
              <label>Capa (imagem)</label>
              <label className="admin-file">
                <UploadCloud size={17} />
                <span>{bookFile ? bookFile.name : "Escolher imagem da capa"}</span>
                <input type="file" accept="image/*" onChange={(e) => setBookFile(e.target.files?.[0] ?? null)} />
              </label>
              <button className="admin-btn admin-btn-primary" type="submit" disabled={busy}>
                <Plus size={16} /> Adicionar obra
              </button>
            </form>
          </section>
        </div>
        </>
      )}
    </div>
  );
}
