import { useLayoutEffect, useRef, useState } from "react";

const links = [
  ["about", "О художнице"],
  ["projects", "Выставки"],
  ["works", "Работы"],
  ["news", "Новости"],
  ["contacts", "Контакты"],
];

export function Navigation() {
  const list = useRef<HTMLUListElement>(null);
  const [visibleCount, setVisibleCount] = useState(links.length);
  useLayoutEffect(() => {
    const element = list.current!;
    function measure() {
      if (innerWidth > 768) {
        setVisibleCount(links.length);
        return;
      }
      const styles = getComputedStyle(element);
      const edge =
        element.getBoundingClientRect().right - parseFloat(styles.paddingRight);
      const count = [...element.children].filter(
        (item) => item.getBoundingClientRect().right <= edge + 0.5,
      ).length;
      setVisibleCount(count);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    measure();
    document.fonts.ready.then(measure);
    return () => observer.disconnect();
  }, []);
  return (
    <nav id="site-navigation" aria-label="Основная навигация" tabIndex={-1}>
      <ul ref={list}>
        {links.map(([id, title], index) => (
          <li
            key={id}
            style={index >= visibleCount ? { visibility: "hidden" } : undefined}
            aria-hidden={index >= visibleCount || undefined}
          >
            <a
              href={`#${id}`}
              tabIndex={index >= visibleCount ? -1 : undefined}
            >
              {title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
