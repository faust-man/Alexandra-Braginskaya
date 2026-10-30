const params = new URLSearchParams(window.location.search);

const id = params.get("id");

async function loadPainting() {
  const response = await fetch(`data/${id}.json`);
  const work = await response.json();

  document.title = work.title;

  document.getElementById("title").textContent = work.title;

  document.getElementById("price").textContent = work.price;

  document.getElementById("year").textContent = work.year ?? "Не указан";

  document.getElementById("materials").textContent = work.materials;

  document.getElementById("size").textContent = work.size;

  document.getElementById("description").textContent = work.description;

  const image = `img/${id}.jpg`;

  document.getElementById("paintingImage").src = image;

  document.getElementById("paintingImage").alt = work.title;

  document.getElementById("imageLink").href = image;
}

loadPainting();
