import { useRef, useState } from "react";
const slides = [
  ["АРТ РОССИЯ", "2023 и 2025, Гостиный Двор", "01"],
  [
    "МОРЕ ВНУТРИ",
    "Приглашённый художник фестиваля современного искусства",
    "02",
  ],
  ["Expo in China", "Международная выставка", "03"],
  ["Международные проекты", "Саудовская Аравия, Цюрих, Париж, Беларусь", "04"],
];
export function Carousel() {
  const [index, setIndex] = useState(0);
  const start = useRef<number | null>(null);
  const move = (step: number) =>
    setIndex((i) => (i + step + slides.length) % slides.length);
  return (
    <div
      className="achievements-carousel"
      aria-roledescription="карусель"
      aria-label="Выставки"
    >
      <button
        className="carousel-button"
        aria-label="Предыдущая выставка"
        onClick={() => move(-1)}
      >
        ←
      </button>
      <div
        className="achievements-viewport"
        onPointerDown={(e) => {
          start.current = e.clientX;
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerCancel={() => {
          start.current = null;
        }}
        onPointerUp={(e) => {
          if (
            start.current !== null &&
            Math.abs(e.clientX - start.current) > 50
          )
            move(e.clientX < start.current ? 1 : -1);
          start.current = null;
        }}
      >
        <div className="achievements-track" aria-live="polite">
          {slides.map((_, offset) => {
            const s = slides[(index + offset) % slides.length];
            return (
              <article className="achievement-card" key={s[2]}>
                <span className="achievement-index" aria-hidden="true">
                  {s[2]} ↗
                </span>
                <h3>{s[0]}</h3>
                <p>{s[1]}</p>
              </article>
            );
          })}
        </div>
      </div>
      <button
        className="carousel-button"
        aria-label="Следующая выставка"
        onClick={() => move(1)}
      >
        →
      </button>
    </div>
  );
}
