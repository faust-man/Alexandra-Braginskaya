const newsContainer = document.getElementById("newsContainer");
const newsShowMoreButton = document.getElementById("newsShowMore");

const newsMobileMedia = window.matchMedia("(max-width: 768px)");

const visibleNewsCount = 2;

let newsCards = [];
let newsExpanded = false;

/**
 * Загружает JSON и проверяет ответ сервера.
 */
async function loadNewsJson(path) {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Не удалось загрузить файл: ${path}`);
  }

  return response.json();
}

/**
 * Преобразует дату 2026-07-28 в 28 июля 2026 г.
 */
function formatNewsDate(dateString) {
  const date = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Создаёт карточку новости.
 */
function createNewsCard(id, newsItem) {
  const article = document.createElement("article");
  article.className = "news-card";

  const image = document.createElement("img");

  image.src = `img/news/${id}.jpg`;
  image.alt = newsItem.title;

  image.loading = "lazy";
  image.decoding = "async";
  image.fetchPriority = "low";
  image.draggable = false;

  image.addEventListener("error", () => {
    image.remove();
  });

  const content = document.createElement("div");
  content.className = "news-card-content";

  const date = document.createElement("time");
  date.dateTime = newsItem.date;
  date.textContent = formatNewsDate(newsItem.date);

  const title = document.createElement("h3");
  title.textContent = newsItem.title;

  const description = document.createElement("p");
  description.textContent = newsItem.description;

  content.append(date, title, description);

  if (newsItem.link) {
    const link = document.createElement("a");

    link.href = newsItem.link;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Подробнее →";

    content.appendChild(link);
  }

  article.append(image, content);

  return article;
}

/**
 * Управляет видимостью новостей и кнопки.
 */
function updateNewsVisibility() {
  const isMobile = newsMobileMedia.matches;
  const hasHiddenNews = newsCards.length > visibleNewsCount;

  newsCards.forEach((card, index) => {
    const shouldHide = isMobile && !newsExpanded && index >= visibleNewsCount;

    card.classList.toggle("news-card-hidden", shouldHide);
  });

  if (!newsShowMoreButton) {
    return;
  }

  newsShowMoreButton.hidden = !isMobile || !hasHiddenNews;

  newsShowMoreButton.textContent = newsExpanded ? "Скрыть" : "Показать ещё";
}

/**
 * Загружает и выводит все новости.
 */
async function loadNews() {
  if (!newsContainer) {
    return;
  }

  try {
    const ids = await loadNewsJson("news.json");

    newsContainer.innerHTML = "";

    for (const id of ids) {
      try {
        const newsItem = await loadNewsJson(`data/news/${id}.json`);
        const card = createNewsCard(id, newsItem);

        newsContainer.appendChild(card);
      } catch (error) {
        console.error(`Ошибка загрузки новости "${id}":`, error);
      }
    }

    newsCards = [...newsContainer.querySelectorAll(".news-card")];

    if (!newsCards.length) {
      newsContainer.innerHTML = "<p>Новостей пока нет.</p>";

      if (newsShowMoreButton) {
        newsShowMoreButton.hidden = true;
      }

      return;
    }

    updateNewsVisibility();
  } catch (error) {
    console.error("Ошибка загрузки новостей:", error);

    newsContainer.innerHTML =
      "<p>Не удалось загрузить новости. Попробуйте обновить страницу.</p>";

    if (newsShowMoreButton) {
      newsShowMoreButton.hidden = true;
    }
  }
}

newsShowMoreButton?.addEventListener("click", () => {
  newsExpanded = !newsExpanded;

  updateNewsVisibility();
});

newsMobileMedia.addEventListener("change", () => {
  newsExpanded = false;

  updateNewsVisibility();
});

loadNews();
