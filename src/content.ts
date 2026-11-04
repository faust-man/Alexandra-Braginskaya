import ids from "../public/gallery.json";
import newsIds from "../public/news.json";
export interface Painting {
  id: string;
  title: string;
  year?: number;
  materials: string;
  size: string;
  price: string;
  description: string;
}
interface News {
  id: string;
  title: string;
  date: string;
  description: string;
  link?: string;
}
const works = import.meta.glob<Omit<Painting, "id">>("../public/data/*.json", {
  eager: true,
  import: "default",
});
const articles = import.meta.glob<Omit<News, "id">>(
  "../public/data/news/*.json",
  { eager: true, import: "default" },
);
export const paintings: Painting[] = ids.map((id) => ({
  ...works[`../public/data/${id}.json`],
  id,
}));
export const news: News[] = newsIds.map((id) => ({
  ...articles[`../public/data/news/${id}.json`],
  id,
}));
export { formatDate } from "./dates";
