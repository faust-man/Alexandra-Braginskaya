document.querySelectorAll("[data-carousel]").forEach((carousel) => {
  const viewport = carousel.querySelector("[data-carousel-viewport]");
  const track = carousel.querySelector("[data-carousel-track]");

  const previousButton = carousel.querySelector("[data-carousel-prev]");
  const nextButton = carousel.querySelector("[data-carousel-next]");

  if (!viewport || !track || !previousButton || !nextButton) {
    return;
  }

  let isAnimating = false;
  let pointerStartX = 0;
  let pointerEndX = 0;

  /**
   * Возвращает ширину одной карточки вместе с промежутком.
   */
  function getSlideStep() {
    const firstSlide = track.firstElementChild;

    if (!firstSlide) {
      return 0;
    }

    const trackStyles = window.getComputedStyle(track);
    const gap = Number.parseFloat(trackStyles.columnGap) || 0;

    return firstSlide.getBoundingClientRect().width + gap;
  }

  /**
   * Возвращает карусель в исходную позицию без анимации.
   */
  function resetTrackPosition() {
    track.style.transition = "none";
    track.style.transform = "translate3d(0, 0, 0)";

    track.offsetHeight;

    track.style.transition = "";
  }

  /**
   * Прокрутка вправо.
   */
  function showNextSlide() {
    if (isAnimating || track.children.length < 2) {
      return;
    }

    isAnimating = true;

    const step = getSlideStep();

    track.style.transform = `translate3d(-${step}px, 0, 0)`;

    function finishAnimation(event) {
      if (event.propertyName !== "transform") {
        return;
      }

      track.removeEventListener("transitionend", finishAnimation);

      track.appendChild(track.firstElementChild);

      resetTrackPosition();

      isAnimating = false;
    }

    track.addEventListener("transitionend", finishAnimation);
  }

  /**
   * Прокрутка влево.
   */
  function showPreviousSlide() {
    if (isAnimating || track.children.length < 2) {
      return;
    }

    isAnimating = true;

    const step = getSlideStep();
    const lastSlide = track.lastElementChild;

    track.style.transition = "none";
    track.prepend(lastSlide);
    track.style.transform = `translate3d(-${step}px, 0, 0)`;

    track.offsetHeight;

    track.style.transition = "";
    track.style.transform = "translate3d(0, 0, 0)";

    function finishAnimation(event) {
      if (event.propertyName !== "transform") {
        return;
      }

      track.removeEventListener("transitionend", finishAnimation);

      isAnimating = false;
    }

    track.addEventListener("transitionend", finishAnimation);
  }

  previousButton.addEventListener("click", showPreviousSlide);
  nextButton.addEventListener("click", showNextSlide);

  /**
   * Свайпы на телефонах.
   */
  viewport.addEventListener("pointerdown", (event) => {
    pointerStartX = event.clientX;
    pointerEndX = event.clientX;

    viewport.setPointerCapture(event.pointerId);
  });

  viewport.addEventListener("pointermove", (event) => {
    pointerEndX = event.clientX;
  });

  viewport.addEventListener("pointerup", (event) => {
    pointerEndX = event.clientX;

    const swipeDistance = pointerEndX - pointerStartX;
    const minimumSwipeDistance = 50;

    if (swipeDistance > minimumSwipeDistance) {
      showPreviousSlide();
    }

    if (swipeDistance < -minimumSwipeDistance) {
      showNextSlide();
    }
  });

  /**
   * После изменения размера окна убираем возможное смещение.
   */
  window.addEventListener("resize", () => {
    isAnimating = false;

    resetTrackPosition();
  });
});
