import { useEffect, useRef } from "react";
import { setupParallax } from "../hooks/parallax";
export function Hero() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    if (ref.current) return setupParallax(ref.current);
  }, []);
  return (
    <header className="hero" ref={ref}>
      {[1, 2, 3, 4].map((n) => (
        <div className={`hero-layer layer-${n}`} key={n}>
          <img
            src={`img/layer-${n}.png`}
            alt=""
            loading="eager"
            decoding="async"
            fetchPriority={n === 1 ? "high" : "auto"}
          />
        </div>
      ))}
      <div className="hero-overlay" />
      <div className="hero-content">
        <span className="eyebrow">Современная живопись · Авторский взгляд</span>
        <h1>
          Александра
          <br />
          Брагинская
        </h1>
        <p>Художник • Искусствовед • Участник международных выставок</p>
        <a href="#works" className="btn hero-cta">
          Открыть галерею ↗
        </a>
        <button
          className="btn motion-permission-button"
          id="motionPermissionButton"
          type="button"
          hidden
        >
          Включить движение фона
        </button>
        <p className="motion-status" id="motionStatus" role="status" hidden />
      </div>
    </header>
  );
}
