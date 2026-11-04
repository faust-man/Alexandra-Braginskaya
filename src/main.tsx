import { registerImageCache } from "./image-cache";
import { useEffect, useState, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { Editorial } from "./components/Editorial";
import { Hero } from "./components/Hero";
import { Carousel } from "./components/Carousel";
import { PaintingPage } from "./components/PaintingPage";
import { paintings, news, formatDate } from "./content";
import "./styles/style.css";
import "./styles/hero.css";
import "./styles/mobile.css";
import "./styles/refresh.css";

export function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id}>
      <div className="container">
        <h2>{title}</h2>
        {children}
      </div>
    </section>
  );
}
function Expandable({
  kind,
  count,
  children,
}: {
  kind: "gallery" | "news";
  count: number;
  children: ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <>
      <div
        id={`${kind}-items`}
        className={`${kind} ${expanded ? "expanded" : "collapsed"}`}
      >
        {children}
      </div>
      {count > (kind === "gallery" ? 4 : 2) && (
        <button
          className="show-more-button"
          aria-expanded={expanded}
          aria-controls={`${kind}-items`}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Скрыть" : "Показать ещё"}
        </button>
      )}
    </>
  );
}
function Home() {
  return (
    <>
      <Hero />
      <nav aria-label="Основная навигация">
        <ul>
          {[
            ["about", "О художнице"],
            ["projects", "Выставки"],
            ["works", "Работы"],
            ["news", "Новости"],
            ["contacts", "Контакты"],
          ].map(([id, title]) => (
            <li key={id}>
              <a href={`#${id}`}>{title}</a>
            </li>
          ))}
        </ul>
      </nav>
      <main>
        <Editorial section="about" />
        <Section id="projects" title="Выставки и достижения">
          <Carousel />
        </Section>
        <Section id="works" title="Избранные работы">
          <p className="section-intro">
            Истории, рассказанные цветом. Нажмите на картину, чтобы узнать её
            ближе.
          </p>
          <Expandable kind="gallery" count={paintings.length}>
            {paintings.map((work, index) => (
              <article className="work" key={work.id}>
                <a href={`painting.html?id=${encodeURIComponent(work.id)}`}>
                  <img
                    src={`img/preview/${work.id}-480.webp`}
                    srcSet={`img/preview/${work.id}-480.webp 480w, img/preview/${work.id}-900.webp 900w`}
                    sizes="(max-width: 768px) 90vw, (max-width: 1200px) 45vw, 420px"
                    alt={work.title}
                    loading={index < 2 ? "eager" : "lazy"}
                    decoding="async"
                    draggable={false}
                    onError={(e) => {
                      const img = e.currentTarget;
                      if (img.srcset) {
                        img.removeAttribute("srcset");
                        img.src = `img/${work.id}.jpg`;
                      }
                    }}
                  />
                  <span className="work-number">
                    {String(index + 1).padStart(2, "0")} / Живопись
                  </span>
                  <h3>{work.title}</h3>
                  <span className="work-details">Смотреть работу ↗</span>
                </a>
              </article>
            ))}
          </Expandable>
        </Section>
        <Section id="news" title="Новости">
          <div className="channel-intro">
            <img
              src="img/channel-avatar.jpg"
              alt="Александра Брагинская — автор канала Искусство&Торшер"
              width="160"
              height="160"
              loading="lazy"
            />
            <div>
              <h3>Искусство&amp;Торшер</h3>
              <p>
                В своем блоге «Искусство&amp;Торшер» я соединяю взгляд
                искусствоведа и живой опыт художника. Здесь я делюсь рецензиями
                на самые яркие выставки, помогая зрителю увидеть то, что скрыто
                от беглого взгляда. А в рубрике о моём творчестве — показываю,
                как рождаются картины: от первого эскиза до финального мазка.
                Моя цель — влюбить вас в искусство так же сильно, как в него
                влюблена я.
              </p>
              <a
                href="https://t.me/artalexatorsher"
                target="_blank"
                rel="noopener noreferrer"
              >
                Читать канал в Telegram ↗
              </a>
            </div>
          </div>
          <Expandable kind="news" count={news.length}>
            {news.map((item) => (
              <article className="news-card" key={item.id}>
                <img
                  src={`img/news/${item.id}.jpg`}
                  alt={item.title}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    e.currentTarget.hidden = true;
                  }}
                />
                <div className="news-card-content">
                  {formatDate(item.date) && (
                    <time dateTime={item.date}>{formatDate(item.date)}</time>
                  )}
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Подробнее →
                    </a>
                  )}
                </div>
              </article>
            ))}
          </Expandable>
        </Section>
        <Editorial section="contacts" />
      </main>
      <footer>
        <p>© 2026 Александра Брагинская</p>
        <p className="footer-note">Искусство видеть необычное</p>
      </footer>
    </>
  );
}
function App() {
  const painting = location.pathname.endsWith("/painting.html");
  useEffect(() => {
    const handler = (e: MouseEvent) => e.preventDefault();
    document.addEventListener("contextmenu", handler);
    return () => document.removeEventListener("contextmenu", handler);
  }, []);
  return painting ? <PaintingPage /> : <Home />;
}
createRoot(document.getElementById("root")!).render(<App />);

registerImageCache();
