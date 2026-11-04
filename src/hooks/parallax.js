export function setupParallax(hero) {
  const cleanups = [];
  function listen(target, type, handler, options) {
    target.addEventListener(type, handler, options);
    cleanups.push(() => target.removeEventListener(type, handler, options));
  }
  const layerImages = [...hero.querySelectorAll(".hero-layer img")];

  const motionButton = document.getElementById("motionPermissionButton");

  const motionStatus = document.getElementById("motionStatus");

  const desktopMedia = window.matchMedia("(hover: hover) and (pointer: fine)");

  const phoneMedia = window.matchMedia("(max-width: 768px)");

  const reducedMotionMedia = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  );

  if (hero && layerImages.length > 0) {
    const layers = layerImages.map((image) => {
      const styles = getComputedStyle(image);

      return {
        image,

        speed: Number.parseFloat(styles.getPropertyValue("--speed")) || 0,

        currentX: 0,
        currentY: 0,

        targetX: 0,
        targetY: 0,
      };
    });

    const MAX_TILT = 20;
    const PHONE_STRENGTH = 1.5;
    const VERTICAL_STRENGTH = 0.65;
    const SMOOTHING = 0.12;

    let animationFrameId = null;
    let orientationStarted = false;

    let calibrated = false;
    let centerX = 0;
    let centerY = 0;

    let sensorEventReceived = false;
    let sensorTimeoutId = null;

    function clamp(value, minimum, maximum) {
      return Math.min(Math.max(value, minimum), maximum);
    }

    function showStatus(message) {
      if (!motionStatus) {
        return;
      }

      motionStatus.hidden = false;
      motionStatus.textContent = message;
    }

    function hideStatus() {
      if (motionStatus) {
        motionStatus.hidden = true;
      }
    }

    function startAnimation() {
      if (animationFrameId !== null) {
        return;
      }

      animationFrameId = requestAnimationFrame(animate);
    }

    function animate() {
      let shouldContinue = false;

      layers.forEach((layer) => {
        const differenceX = layer.targetX - layer.currentX;
        const differenceY = layer.targetY - layer.currentY;

        layer.currentX += differenceX * SMOOTHING;
        layer.currentY += differenceY * SMOOTHING;

        if (Math.abs(differenceX) > 0.02 || Math.abs(differenceY) > 0.02) {
          shouldContinue = true;
        }

        layer.image.style.setProperty(
          "--parallax-x",
          `${layer.currentX.toFixed(2)}px`,
        );

        layer.image.style.setProperty(
          "--parallax-y",
          `${layer.currentY.toFixed(2)}px`,
        );
      });

      if (shouldContinue) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        animationFrameId = null;
      }
    }

    function setTarget(normalizedX, normalizedY, strength = 1) {
      layers.forEach((layer) => {
        layer.targetX = normalizedX * layer.speed * strength;

        layer.targetY =
          normalizedY * layer.speed * strength * VERTICAL_STRENGTH;
      });

      startAnimation();
    }

    function resetParallax() {
      setTarget(0, 0);
    }

    /* ===================================================
     DESKTOP
  =================================================== */

    function handlePointerMove(event) {
      const rect = hero.getBoundingClientRect();

      const normalizedX = clamp(
        ((event.clientX - rect.left) / rect.width - 0.5) * 2,
        -1,
        1,
      );

      const normalizedY = clamp(
        ((event.clientY - rect.top) / rect.height - 0.5) * 2,
        -1,
        1,
      );

      setTarget(normalizedX, normalizedY);
    }

    function enableDesktopParallax() {
      listen(hero, "pointermove", handlePointerMove);
      listen(hero, "pointerleave", resetParallax);
    }

    /* ===================================================
     PHONE
  =================================================== */

    function getScreenAngle() {
      if (screen.orientation) {
        return screen.orientation.angle || 0;
      }

      if (typeof window.orientation === "number") {
        return window.orientation;
      }

      return 0;
    }

    function convertAxes(beta, gamma) {
      const angle = ((getScreenAngle() % 360) + 360) % 360;

      if (angle === 90) {
        return {
          x: beta,
          y: -gamma,
        };
      }

      if (angle === 180) {
        return {
          x: -gamma,
          y: -beta,
        };
      }

      if (angle === 270) {
        return {
          x: -beta,
          y: gamma,
        };
      }

      return {
        x: gamma,
        y: beta,
      };
    }

    function handleOrientation(event) {
      if (
        event.beta === null ||
        event.gamma === null ||
        !Number.isFinite(event.beta) ||
        !Number.isFinite(event.gamma)
      ) {
        return;
      }

      if (!sensorEventReceived) {
        sensorEventReceived = true;

        clearTimeout(sensorTimeoutId);

        hideStatus();

        if (motionButton) {
          motionButton.hidden = true;
        }
      }

      const axes = convertAxes(event.beta, event.gamma);

      if (!calibrated) {
        centerX = axes.x;
        centerY = axes.y;

        calibrated = true;

        return;
      }

      const differenceX = axes.x - centerX;
      const differenceY = axes.y - centerY;

      const normalizedX = clamp(differenceX / MAX_TILT, -1, 1);

      const normalizedY = clamp(differenceY / MAX_TILT, -1, 1);

      setTarget(normalizedX, normalizedY, PHONE_STRENGTH);
    }

    function startOrientationListener() {
      if (orientationStarted) {
        window.removeEventListener("deviceorientation", handleOrientation);
      }

      orientationStarted = true;
      calibrated = false;
      sensorEventReceived = false;

      listen(window, "deviceorientation", handleOrientation, {
        passive: true,
      });

      showStatus("Проверяем датчики телефона…");

      clearTimeout(sensorTimeoutId);

      sensorTimeoutId = window.setTimeout(() => {
        if (!sensorEventReceived) {
          showStatus(
            "Браузер не передаёт данные датчиков. Откройте сайт напрямую в Safari или Chrome.",
          );

          if (motionButton) {
            motionButton.hidden = false;
            motionButton.textContent = "Попробовать ещё раз";
          }
        }
      }, 2500);
    }

    async function requestMotionPermission() {
      if (!window.isSecureContext) {
        showStatus("Гироскоп доступен только через HTTPS.");

        return;
      }

      if (reducedMotionMedia.matches) {
        showStatus("В системе включено уменьшение движения.");

        return;
      }

      if (typeof DeviceOrientationEvent === "undefined") {
        showStatus("Этот браузер не поддерживает ориентацию устройства.");

        return;
      }

      motionButton.disabled = true;
      motionButton.textContent = "Подключаем датчики…";

      try {
        const permissionRequests = [];

        if (typeof DeviceOrientationEvent.requestPermission === "function") {
          permissionRequests.push(DeviceOrientationEvent.requestPermission());
        }

        if (
          typeof DeviceMotionEvent !== "undefined" &&
          typeof DeviceMotionEvent.requestPermission === "function"
        ) {
          permissionRequests.push(DeviceMotionEvent.requestPermission());
        }

        if (permissionRequests.length > 0) {
          const results = await Promise.all(permissionRequests);

          const denied = results.some((result) => result !== "granted");

          if (denied) {
            showStatus("Доступ к движению и ориентации запрещён.");

            motionButton.textContent = "Доступ запрещён";

            return;
          }
        }

        startOrientationListener();
      } catch (error) {
        console.error("Ошибка доступа к датчикам:", error);

        showStatus("Не удалось получить доступ к датчикам.");

        motionButton.textContent = "Попробовать ещё раз";
      } finally {
        motionButton.disabled = false;
      }
    }

    /* ===================================================
     INITIALIZATION
  =================================================== */

    if (desktopMedia.matches && !reducedMotionMedia.matches) {
      enableDesktopParallax();
    }

    if (phoneMedia.matches && !reducedMotionMedia.matches) {
      if (motionButton) {
        motionButton.hidden = false;
      }

      /*
       * На Android пробуем запустить датчики автоматически.
       * Кнопка при этом остаётся резервным вариантом.
       */
      if (
        window.isSecureContext &&
        typeof DeviceOrientationEvent !== "undefined" &&
        typeof DeviceOrientationEvent.requestPermission !== "function"
      ) {
        startOrientationListener();
      }
    }

    listen(motionButton, "click", requestMotionPermission);

    listen(window, "orientationchange", () => {
      calibrated = false;
      resetParallax();
    });

    listen(document, "visibilitychange", () => {
      if (document.hidden) {
        resetParallax();
      } else {
        calibrated = false;
      }
    });
    return () => {
      cleanups.forEach((cleanup) => cleanup());
      cancelAnimationFrame(animationFrameId);
      clearTimeout(sensorTimeoutId);
    };
  }
}
