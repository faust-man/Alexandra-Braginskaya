import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from "react";
import { paintings } from "../content";
import "../styles/paint-style.css";
export function PaintingPage() {
  const id = new URLSearchParams(location.search).get("id");
  const work = paintings.find((w) => w.id === id);
  const pricePrefix = /^цена(?=\s|:|$)\s*:?\s*/iu;
  const hasPrice = work ? pricePrefix.test(work.price) : false;
  const image = useRef<HTMLImageElement>(null);
  const [lens, setLens] = useState<CSSProperties>({ display: "none" });
  useEffect(() => {
    document.body.classList.add("painting-page");
    document.title = work
      ? `${work.title} | Александра Брагинская`
      : "Картина не найдена";
    return () => document.body.classList.remove("painting-page");
  }, [work]);
  function magnify(e: PointerEvent<HTMLImageElement>) {
    if (e.pointerType === "touch" || window.innerWidth <= 900) return;
    const img = image.current!;
    const r = img.getBoundingClientRect();
    const size = Math.min(220, r.width, r.height);
    const half = size / 2;
    const x = e.clientX - r.left,
      y = e.clientY - r.top;
    const cx = Math.max(half, Math.min(x, r.width - half)),
      cy = Math.max(half, Math.min(y, r.height - half));
    setLens({
      display: "block",
      width: size,
      height: size,
      left: img.offsetLeft + cx - half,
      top: img.offsetTop + cy - half,
      backgroundImage: `url("${img.src}")`,
      backgroundSize: `${r.width * 2}px ${r.height * 2}px`,
      backgroundPosition: `-${Math.max(0, Math.min(x * 2 - half, r.width * 2 - size))}px -${Math.max(0, Math.min(y * 2 - half, r.height * 2 - size))}px`,
    });
  }
  return (
    <>
      <a href="index.html#works" className="back">
        ← Назад к галерее
      </a>
      {!work ? (
        <main className="not-found">
          <h1>Картина не найдена</h1>
          <p>Выберите работу в галерее — возможно, ссылка устарела.</p>
        </main>
      ) : (
        <main className="painting">
          <div className="painting-image">
            <a
              href={`img/${work.id}.jpg`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Открыть оригинал: ${work.title}`}
            >
              <img
                ref={image}
                src={`img/${work.id}.jpg`}
                alt={work.title}
                draggable={false}
                onPointerMove={magnify}
                onPointerLeave={() => setLens({ display: "none" })}
              />
            </a>
            <div className="lens" style={lens} aria-hidden="true" />
          </div>
          <div className="painting-info">
            <span className="eyebrow">Из авторской коллекции</span>
            <h1>{work.title}</h1>
            <div className="info">
              {[
                ["Год", work.year ?? "Не указан"],
                ["Материал", work.materials],
                ["Размер", work.size],
                [
                  hasPrice ? "Цена" : "Статус",
                  hasPrice ? work.price.replace(pricePrefix, "") : work.price,
                ],
              ].map(([label, value]) => (
                <p key={label}>
                  <strong>{label}:</strong> <span>{value}</span>
                </p>
              ))}
            </div>
            <div className="description">
              <h2>Описание</h2>
              <p>{work.description}</p>
            </div>
            <a className="painting-contact" href="index.html#contacts">
              Связаться с художницей
            </a>
          </div>
        </main>
      )}
    </>
  );
}
