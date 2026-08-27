import { type FormEvent, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  BookMarked,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Facebook,
  Flower2,
  Heart,
  Instagram,
  Lightbulb,
  Mail,
  MapPin,
  Menu,
  Quote,
  Sparkles,
  SunMedium,
  UsersRound,
  X,
} from "lucide-react";
import { toast } from "sonner";

/**
 * Direção visual desta página: colagem editorial sertaneja.
 * Use papel marfim texturizado, azul Quixaba, amarelo-sol e coral;
 * preserve a assimetria acolhedora e a sensação de caderno cultural manual.
 */

const heroImage = "/assets/quixaba-hero-transparent-user.png";
const logoImage = "/assets/quixaba-wordmark-transparent-tight.png";
const sunCloudImage = "/assets/quixaba-sun-cloud.png";
const benchImage = "/assets/quixaba-bench.png";
const openBookImage = "/assets/quixaba-open-book.png";
const booksCoffeeImage = "/assets/quixaba-books-coffee.png";
const bookshelfImage = "/assets/quixaba-bookshelf.png";
const signpostImage = "/assets/quixaba-signpost.png";
const landmarkImage = "/assets/quixaba-landmark.png";
const schoolLogo = "/assets/escola-herculano-pereira.png";

const navItems = [
  { label: "Início", href: "#inicio" },
  { label: "O clube", href: "#clube" },
  { label: "Leituras", href: "#leituras" },
  { label: "Encontros", href: "#encontros" },
  { label: "Recomendações", href: "#recomendacoes" },
  { label: "Contato", href: "#contato" },
];

const discoveryItems = [
  {
    label: "Leituras",
    copy: "Descubra livros incríveis e compartilhe suas impressões.",
    icon: BookOpen,
    tone: "yellow",
  },
  {
    label: "Encontros",
    copy: "Participe de rodas presenciais e online cheias de boas conversas.",
    icon: UsersRound,
    tone: "coral",
  },
  {
    label: "Debates",
    copy: "Troque ideias, apresente pontos de vista e enriqueça discussões.",
    icon: Lightbulb,
    tone: "blue",
  },
  {
    label: "Recomendações",
    copy: "Dicas de livros, filmes e tudo que inspira leitores.",
    icon: Sparkles,
    tone: "mustard",
  },
  {
    label: "Comunidade",
    copy: "Faça parte de uma rede de leitores apaixonados como você.",
    icon: Heart,
    tone: "red",
  },
];

const books = [
  {
    title: "O Alquimista",
    author: "Paulo Coelho",
    color: "book-orange",
    eyebrow: "Travessia",
    mark: "☼",
  },
  {
    title: "Quarto de Despejo",
    author: "Carolina Maria de Jesus",
    color: "book-sand",
    eyebrow: "Memória",
    mark: "✦",
  },
  {
    title: "1984",
    author: "George Orwell",
    color: "book-red",
    eyebrow: "Futuro",
    mark: "◉",
  },
  {
    title: "A Hora da Estrela",
    author: "Clarice Lispector",
    color: "book-blue",
    eyebrow: "Existência",
    mark: "✳",
  },
  {
    title: "Ensaio sobre a Cegueira",
    author: "José Saramago",
    color: "book-cream",
    eyebrow: "Cidade",
    mark: "—",
  },
];

function scrollTo(id: string) {
  document.querySelector(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [participationOpen, setParticipationOpen] = useState(false);
  const [sent, setSent] = useState(false);

  function handleParticipationSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
    toast.success("Seu interesse foi anotado! Em breve a gente conversa.");
  }

  function closeParticipation() {
    setParticipationOpen(false);
    window.setTimeout(() => setSent(false), 250);
  }

  return (
    <div className="site-shell paper-texture" id="inicio">
      <header className="site-header">
        <div className="header-inner">
          <a className="brand-lockup" href="#inicio" aria-label="Clube de Leitura de Quixaba — início">
            <img className="brand-logo" src={logoImage} alt="Clube de Leitura de Quixaba" />
          </a>

          <nav className={`desktop-nav ${menuOpen ? "is-open" : ""}`} aria-label="Navegação principal">
            {navItems.map((item, index) => (
              <a
                key={item.href}
                className={index === 0 ? "active" : ""}
                href={item.href}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <button className="header-cta" onClick={() => setParticipationOpen(true)}>
            <BookOpen size={17} strokeWidth={1.8} />
            <span>Participe</span>
          </button>
          <button
            className="menu-toggle"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      <main>
        <section className="hero-section section-pad" aria-labelledby="hero-title">
          <div className="hero-copy reveal-up">
            <div className="eyebrow"><span className="eyebrow-dot" /> Um espaço para leitores de Quixaba</div>
            <h1 id="hero-title">
              Leituras<br />
              <span>que conectam.</span><br />
              <em>Ideias</em><br />
              <span className="hero-last-line">que transformam.</span>
            </h1>
            <p className="hero-lead">
              Um clube para encontrar pessoas, descobrir novos mundos e dar vida às palavras — do jeitinho que uma boa conversa começa.
            </p>
            <div className="hero-actions">
              <button className="button button-primary" onClick={() => setParticipationOpen(true)}>
                Participar do clube <ArrowRight size={17} />
              </button>
              <button className="text-link" onClick={() => scrollTo("#clube")}>
                Saiba mais <ArrowUpRight size={15} />
              </button>
            </div>
            <div className="hero-note"><span>↗</span> histórias daqui, ideias para levar</div>
          </div>
          <div className="hero-art reveal-up delay-1">
            <span className="doodle-star doodle-star-one">✧</span>
            <div className="hero-art-frame">
              <img src={heroImage} alt="Composição ilustrada do Clube de Leitura de Quixaba com livro aberto e paisagem local" />
            </div>
          </div>
        </section>

        <section className="manifesto-band" id="clube" aria-labelledby="manifesto-title">
          <img className="manifesto-weather" src={sunCloudImage} alt="" aria-hidden="true" />
          <div className="manifesto-inner section-pad">
            <div className="photo-note reveal-up">
              <div className="photo-note-image"><img src={benchImage} alt="Banco de praça iluminado e cercado por flores" /></div>
              <div className="photo-note-label">uma roda, muitos mundos <span>✦</span></div>
            </div>
            <div className="manifesto-copy reveal-up delay-1">
              <div className="eyebrow eyebrow-light"><span className="eyebrow-dot" /> nosso ponto de encontro</div>
              <h2 id="manifesto-title">Olá! Somos o<br /><span>Clube de Leitura<br />de Quixaba.</span></h2>
              <div className="yellow-rule" />
              <p>Acreditamos que a leitura aproxima, inspira, transforma e cria pontes entre pessoas e ideias.</p>
              <p className="manifesto-small">Seja bem-vindo ao nosso espaço! Aqui, todo leitor tem voz.</p>
              <button className="button button-light" onClick={() => scrollTo("#encontros")}>Conheça mais <ArrowRight size={16} /></button>
            </div>
            <div className="manifesto-list reveal-up delay-2">
              <div className="paperclip">⌇</div>
              <p className="list-title">Aqui a gente...</p>
              {[
                [BookOpen, "Compartilha leituras"],
                [Quote, "Troca ideias"],
                [Sparkles, "Descobre novos mundos"],
                [UsersRound, "Faz amizades"],
                [Heart, "Transforma palavras em ação"],
              ].map(([Icon, label]) => (
                <div className="manifesto-item" key={label as string}>
                  <Icon size={19} strokeWidth={1.6} />
                  <span>{label as string}</span>
                </div>
              ))}
              <div className="paper-heart">♡</div>
            </div>
          </div>
        </section>

        <section className="institution-section section-pad" id="projeto" aria-labelledby="institution-title">
          <div className="institution-logo reveal-up">
            <img
              src={schoolLogo}
              alt="Escola Estadual de Ensino Médio Herculano Pereira"
              onError={(event) => {
                event.currentTarget.style.display = "none";
                const fallback = event.currentTarget.nextElementSibling as HTMLElement | null;
                if (fallback) fallback.style.display = "flex";
              }}
            />
            <span className="institution-logo-fallback">Escola Estadual de Ensino Médio<strong>Herculano Pereira</strong></span>
          </div>
          <div className="institution-copy reveal-up delay-1">
            <div className="section-kicker">a iniciativa <span>✦</span></div>
            <h2 id="institution-title">Um projeto da <em>Escola Herculano Pereira</em></h2>
            <p>O Clube de Leitura de Quixaba-PB é uma iniciativa da disciplina de Literatura da Escola Estadual de Ensino Médio Herculano Pereira, criada para aproximar os estudantes da leitura, da literatura e da escrita.</p>
            <p>Por meio de encontros, rodas de conversa, debates, produções autorais e ações de circulação literária, o Clube busca transformar a leitura em uma experiência de formação, diálogo, criatividade e protagonismo juvenil, valorizando também a cultura, a memória e as vozes do território paraibano.</p>
          </div>
        </section>

        <section className="discover-section section-pad" aria-labelledby="discover-title">
          <div className="section-intro discover-intro reveal-up">
            <span className="section-number">01</span>
            <h2 id="discover-title">O que você<br /><em>encontra</em> por aqui</h2>
            <span className="hand-arrow">↳</span>
            <img className="signpost-doodle" src={signpostImage} alt="" aria-hidden="true" />
          </div>
          <div className="discover-grid">
            {discoveryItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  className={`discovery-card tone-${item.tone} reveal-up delay-${Math.min(index + 1, 3)}`}
                  key={item.label}
                  onClick={() => toast.info(`${item.label}: em breve teremos novidades por aqui.`)}
                >
                  <Icon size={30} strokeWidth={1.35} />
                  <span className="discovery-label">{item.label}</span>
                  <span className="discovery-copy">{item.copy}</span>
                  <span className="card-arrow"><ArrowRight size={15} /></span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="events-feature section-pad" id="encontros" aria-labelledby="events-title">
            <div className="events-column reveal-up">
            <img className="event-landmark" src={landmarkImage} alt="" aria-hidden="true" />
            <div className="section-kicker">próximos encontros <span>✦</span></div>
            <h2 id="events-title">Puxe uma cadeira.<br /><em>A conversa começa aqui.</em></h2>
            <article className="event-card">
              <div className="calendar-card">
                <span className="calendar-month">MAIO</span>
                <strong>25</strong>
                <span className="calendar-day">SÁBADO • 16H</span>
              </div>
              <div className="event-details">
                <span className="event-type">Encontro presencial</span>
                <h3>Roda de leitura<br />na escola</h3>
                <span className="event-meta"><MapPin size={14} /> Escola Estadual de Ensino Médio Herculano Pereira — Manoel Candeia, S/N, 58733-000, Quixaba/PB</span>
                <span className="event-meta"><Clock3 size={14} /> 25 de maio, às 16h</span>
                <button className="mini-link" onClick={() => toast.info("A agenda completa será divulgada em breve.")}>Ver agenda completa <ArrowRight size={14} /></button>
              </div>
            </article>
            <div className="event-handnote">Esperamos<br />por você! <span>♡</span></div>
          </div>

          <article className="featured-book reveal-up delay-1" id="leituras">
            <div className="section-kicker">leitura em destaque <span>✦</span></div>
            <div className="featured-book-body">
              <div className="book-cover featured-cover">
                <span className="cover-top">CLUBE DE LEITURA</span>
                <strong>VIDAS<br /><i>SECAS</i></strong>
                <span className="cover-bottom">Graciliano Ramos</span>
                <span className="cover-sun">☼</span>
              </div>
              <div className="featured-copy">
                <span className="book-category">um livro para ficar</span>
                <h3>Vidas Secas</h3>
                <p>Uma obra poderosa sobre vida, resistência e humanidade no sertão nordestino. Prepare-se para um debate inesquecível.</p>
                <button className="mini-link dark-link" onClick={() => toast.info("A ficha de leitura será publicada em breve.")}>Saiba mais <ArrowRight size={14} /></button>
              </div>
            </div>
          </article>
        </section>

        <section className="recommendations-section section-pad" id="recomendacoes" aria-labelledby="recommendations-title">
          <div className="recommendation-heading reveal-up">
            <div>
              <div className="section-kicker">para sua próxima leitura <span>✦</span></div>
              <h2 id="recommendations-title">Recomendados<br /><em>do mês</em></h2>
            </div>
            <img className="bookshelf-doodle" src={bookshelfImage} alt="" aria-hidden="true" />
            <button className="mini-link" onClick={() => toast.info("A biblioteca de recomendações está chegando.")}>Ver todos <ArrowRight size={14} /></button>
          </div>
          <div className="bookshelf reveal-up delay-1">
            {books.map((book, index) => (
              <button className="book-item" key={book.title} onClick={() => toast.info(`${book.title}, de ${book.author}. Em breve: uma ficha de conversa.`)}>
                <div className={`book-cover ${book.color}`} style={{ transform: `rotate(${index % 2 === 0 ? -2 : 2}deg)` }}>
                  <span className="cover-top">{book.eyebrow}</span>
                  <strong>{book.title}</strong>
                  <span className="cover-mark">{book.mark}</span>
                  <span className="cover-bottom">{book.author}</span>
                </div>
                <span className="book-caption">{book.title}</span>
              </button>
            ))}
          </div>
          <div className="shelf-line" />
        </section>

        <section className="reading-note-section section-pad" aria-labelledby="note-title">
          <div className="reading-note-intro reveal-up">
            <div className="section-kicker">anote aí <span>✦</span></div>
            <h2 id="note-title">Palavras que<br /><em>abrem caminhos</em></h2>
            <p>Uma leitura compartilhada nunca termina na última página. Ela continua nas perguntas que a gente leva para casa.</p>
          </div>
          <div className="quote-grid reveal-up delay-1">
            <article className="quote-card quote-blue">
              <Quote size={26} />
              <p>“Toda história é uma janela. A conversa é o que acontece quando a gente abre.”</p>
              <span className="quote-sign">para levar na próxima roda</span>
            </article>
            <article className="quote-card quote-yellow">
              <Quote size={26} />
              <p>“Ler junto é encontrar novas perguntas para velhas certezas.”</p>
              <span className="quote-sign">uma ideia do nosso caderno</span>
            </article>
            <div className="note-image">
              <img src={booksCoffeeImage} alt="Pilha de livros coloridos ao lado de uma xícara de café" />
            </div>
          </div>
        </section>

        <section className="final-cta section-pad" id="contato" aria-labelledby="final-title">
          <div className="final-cta-art reveal-up">
            <img src={openBookImage} alt="Ilustração de um livro aberto com páginas artesanais" />
          </div>
          <div className="final-cta-copy reveal-up delay-1">
            <div className="eyebrow eyebrow-light"><span className="eyebrow-dot" /> vem com a gente</div>
            <h2 id="final-title">Faça parte do clube<br />que transforma leitores<br /><em>em protagonistas.</em></h2>
            <p>Vamos juntos construir histórias, ideias e um futuro melhor — uma página, uma conversa e uma pessoa de cada vez.</p>
            <button className="button button-yellow" onClick={() => setParticipationOpen(true)}>Quero participar <ArrowRight size={17} /></button>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          <a className="brand-lockup footer-brand" href="#inicio" aria-label="Voltar ao início">
            <img className="brand-logo" src={logoImage} alt="Clube de Leitura de Quixaba" />
          </a>
          <div className="footer-column"><span className="footer-label">Navegue</span>{navItems.slice(0, 3).map((item) => <a href={item.href} key={item.href}>{item.label}</a>)}</div>
          <div className="footer-column"><span className="footer-label">Encontre a gente</span><a href="#encontros">Encontros</a><a href="#recomendacoes">Recomendações</a><a href="#contato">Contato</a></div>
          <div className="footer-social"><span className="footer-label">Conecte-se</span><div className="social-links"><a href="#contato" aria-label="Instagram"><Instagram size={17} /></a><a href="#contato" aria-label="Facebook"><Facebook size={17} /></a><a href="#contato" aria-label="Enviar e-mail"><Mail size={17} /></a></div></div>
        </div>
        <div className="footer-bottom"><span>© 2026 Clube de Leitura de Quixaba</span><span>Feito com histórias e afeto no sertão paraibano.</span></div>
      </footer>

      {participationOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeParticipation(); }}>
          <div className="participation-modal" role="dialog" aria-modal="true" aria-labelledby="participation-title">
            <button className="modal-close" aria-label="Fechar" onClick={closeParticipation}><X size={20} /></button>
            {!sent ? (
              <>
                <div className="modal-icon"><BookMarked size={25} /></div>
                <span className="section-kicker">uma cadeira está esperando</span>
                <h2 id="participation-title">Bora ler<br /><em>junto?</em></h2>
                <p>Deixe seu nome e um contato. A gente avisa quando sair o próximo encontro.</p>
                <form onSubmit={handleParticipationSubmit}>
                  <label htmlFor="name">Seu nome</label>
                  <input id="name" name="name" placeholder="Como podemos te chamar?" required />
                  <label htmlFor="contact">E-mail ou WhatsApp</label>
                  <input id="contact" name="contact" placeholder="Para a gente te encontrar" required />
                  <button className="button button-primary full-width" type="submit">Quero participar <ArrowRight size={17} /></button>
                </form>
              </>
            ) : (
              <div className="success-state">
                <div className="success-icon"><Check size={27} /></div>
                <span className="section-kicker">anotado no caderno</span>
                <h2>Até já,<br /><em>leitor!</em></h2>
                <p>Seu interesse chegou até a gente. Em breve você recebe as próximas páginas.</p>
                <button className="button button-primary full-width" onClick={closeParticipation}>Fechar <ArrowRight size={17} /></button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
