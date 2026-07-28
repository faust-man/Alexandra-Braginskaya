const gallery = document.getElementById("gallery");
const showMoreBtn = document.getElementById("showMoreBtn");

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");

      observer.unobserve(entry.target);
    }
  });
});

/**
 * Создаёт карточку картины.
 */
function createWorkCard(id, work, index) {
  const card = document.createElement("div");
  card.className = "work";

  const link = document.createElement("a");
  link.href = `painting.html?id=${encodeURIComponent(id)}`;

  const image = document.createElement("img");

  /*
   * На главной странице сначала загружается уменьшенное WebP-превью.
   */
  image.src = `img/preview/${id}-480.webp`;

  image.srcset = `
    img/preview/${id}-480.webp 480w,
    img/preview/${id}-900.webp 900w
  `;

  image.sizes = `
    (max-width: 768px) calc(100vw - 30px),
    (max-width: 1200px) 50vw,
    420px
  `;

  image.alt = work.title;
  image.decoding = "async";
  image.draggable = false;

  /*
   * Первые две картины получают немного больший приоритет.
   * Остальные загружаются только при приближении к экрану.
   */
  if (index < 2) {
    image.loading = "eager";
    image.fetchPriority = "auto";
  } else {
    image.loading = "lazy";
    image.fetchPriority = "low";
  }

  /*
   * Если WebP-превью ещё не создано,
   * загружается обычная полная JPG-картина.
   */
  image.addEventListener("error", () => {
    if (image.dataset.fallbackLoaded === "true") {
      return;
    }

    image.dataset.fallbackLoaded = "true";

    image.removeAttribute("srcset");
    image.removeAttribute("sizes");

    image.src = `img/${id}.jpg`;
  });

  const title = document.createElement("h3");
  title.textContent = work.title;

  link.appendChild(image);
  card.append(link, title);

  return card;
}

/**
 * Загружает галерею.
 */
async function loadGallery() {
  if (!gallery) {
    return;
  }

  try {
    const listResponse = await fetch("gallery.json");

    if (!listResponse.ok) {
      throw new Error("Не удалось загрузить gallery.json");
    }

    const ids = await listResponse.json();

    for (const [index, id] of ids.entries()) {
      try {
        const response = await fetch(`data/${id}.json`);

        if (!response.ok) {
          throw new Error(`Не удалось загрузить data/${id}.json`);
        }

        const work = await response.json();
        const card = createWorkCard(id, work, index);

        gallery.appendChild(card);

        observer.observe(card);
      } catch (error) {
        console.error(`Ошибка загрузки картины "${id}":`, error);
      }
    }

    setupMobileGallery();
  } catch (error) {
    console.error("Ошибка загрузки галереи:", error);

    gallery.innerHTML = "<p>Не удалось загрузить картины.</p>";
  }
}

/**
 * Настраивает кнопку «Показать ещё» на телефонах.
 */
function setupMobileGallery() {
  if (!showMoreBtn || window.innerWidth > 768) {
    return;
  }

  const works = [...gallery.querySelectorAll(".work")];

  if (works.length <= 4) {
    showMoreBtn.hidden = true;

    return;
  }

  const hiddenWorks = works.slice(4);

  hiddenWorks.forEach((work) => {
    work.classList.add("hidden-mobile");
  });

  showMoreBtn.hidden = false;

  let opened = false;

  showMoreBtn.addEventListener("click", () => {
    opened = !opened;

    hiddenWorks.forEach((work) => {
      work.classList.toggle("show-work", opened);
    });

    showMoreBtn.textContent = opened ? "Скрыть ▲" : "Показать ещё ▼";
  });
}

loadGallery();
