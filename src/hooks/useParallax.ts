import { useEffect, useRef } from "react";

export function useParallax() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const hero = ref.current;
    if (!hero) return;
    const media = matchMedia(
      "(min-width: 769px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    const images = [
      ...hero.querySelectorAll<HTMLImageElement>(".hero-layer img"),
    ];
    let frame = 0;
    let x = 0,
      y = 0,
      targetX = 0,
      targetY = 0;
    function animate() {
      x += (targetX - x) * 0.12;
      y += (targetY - y) * 0.12;
      images.forEach((image) => {
        const speed =
          parseFloat(getComputedStyle(image).getPropertyValue("--speed")) || 0;
        image.style.setProperty("--parallax-x", `${x * speed}px`);
        image.style.setProperty("--parallax-y", `${y * speed * 0.65}px`);
      });
      frame =
        Math.abs(targetX - x) + Math.abs(targetY - y) > 0.001
          ? requestAnimationFrame(animate)
          : 0;
    }
    function move(event: PointerEvent) {
      if (!media.matches || event.pointerType === "touch") return;
      const rect = hero!.getBoundingClientRect();
      targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      if (!frame) frame = requestAnimationFrame(animate);
    }
    function reset() {
      cancelAnimationFrame(frame);
      frame = x = y = targetX = targetY = 0;
      images.forEach((image) => {
        image.style.removeProperty("--parallax-x");
        image.style.removeProperty("--parallax-y");
      });
    }
    hero.addEventListener("pointermove", move);
    hero.addEventListener("pointerleave", reset);
    media.addEventListener("change", reset);
    return () => {
      reset();
      hero.removeEventListener("pointermove", move);
      hero.removeEventListener("pointerleave", reset);
      media.removeEventListener("change", reset);
    };
  }, []);
  return ref;
}
