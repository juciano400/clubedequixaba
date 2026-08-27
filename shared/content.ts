// Tipos e dados padrão do conteúdo editável do site (agenda + capas das obras).
// Usado tanto pelo servidor (seed inicial) quanto pelo cliente (fallback).

export interface AgendaItem {
  id: string;
  title: string; // ex.: "Roda de leitura na escola"
  date: string; // "YYYY-MM-DD"
  time: string; // ex.: "16h"
  type: string; // ex.: "Encontro presencial"
  location: string; // endereço
}

export interface BookItem {
  id: string;
  title: string;
  author: string;
  coverUrl?: string; // capa enviada pelo admin (/uploads/xxx)
  coverData?: string; // data URL temporária no envio (o servidor converte em coverUrl)
  // Estilo da capa "desenhada" (usado quando não há imagem de capa)
  color?: string;
  eyebrow?: string;
  mark?: string;
}

export interface SiteContent {
  agenda: AgendaItem[];
  books: BookItem[];
}

export const DEFAULT_AGENDA: AgendaItem[] = [
  {
    id: "seed-encontro-1",
    title: "Roda de leitura na escola",
    date: "2026-05-25",
    time: "16h",
    type: "Encontro presencial",
    location:
      "Escola Estadual de Ensino Médio Herculano Pereira — Manoel Candeia, S/N, 58733-000, Quixaba/PB",
  },
];

export const DEFAULT_BOOKS: BookItem[] = [
  { id: "seed-1", title: "O Alquimista", author: "Paulo Coelho", color: "book-orange", eyebrow: "Travessia", mark: "☼" },
  { id: "seed-2", title: "Quarto de Despejo", author: "Carolina Maria de Jesus", color: "book-sand", eyebrow: "Memória", mark: "✦" },
  { id: "seed-3", title: "1984", author: "George Orwell", color: "book-red", eyebrow: "Futuro", mark: "◉" },
  { id: "seed-4", title: "A Hora da Estrela", author: "Clarice Lispector", color: "book-blue", eyebrow: "Existência", mark: "✳" },
  { id: "seed-5", title: "Ensaio sobre a Cegueira", author: "José Saramago", color: "book-cream", eyebrow: "Cidade", mark: "—" },
];

export const DEFAULT_CONTENT: SiteContent = {
  agenda: DEFAULT_AGENDA,
  books: DEFAULT_BOOKS,
};

export const BOOK_COLORS = ["book-orange", "book-sand", "book-red", "book-blue", "book-cream"];

// Configurações do painel (armazenadas no servidor, acessíveis só ao admin).
export interface CloudinarySettings {
  cloudName: string;
  uploadPreset: string; // preset "unsigned" criado no painel do Cloudinary
}

export interface AppSettings {
  cloudinary: CloudinarySettings;
}

export const DEFAULT_SETTINGS: AppSettings = {
  cloudinary: { cloudName: "", uploadPreset: "" },
};
