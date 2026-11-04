import { useParallax } from "../hooks/useParallax";
export function Hero() {
  const ref = useParallax();
  return (
    <header className="hero" ref={ref}>
      {[1, 2, 3, 4].map((n) => (
        <div className={`hero-layer layer-${n}`} key={n}>
          <picture>
            {n < 4 && (
              <source
                media="(min-width: 901px)"
                srcSet={`img/hero-object-${n}.webp`}
              />
            )}
            <img
              src={`img/layer-${n}.png`}
              alt=""
              loading="eager"
              decoding="async"
              fetchPriority={n === 1 ? "high" : "auto"}
            />
          </picture>
        </div>
      ))}
      <div className="hero-overlay" />
      <div className="hero-content">
        <h1>
          Александра
          <br />
          Брагинская
        </h1>
        <p>Художник • Искусствовед • Участник международных выставок</p>
        <a href="#works" className="btn hero-cta">
          Открыть галерею ↗
        </a>
      </div>
    </header>
  );
}
