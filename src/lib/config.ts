export const siteConfig = {
  name: import.meta.env.VITE_SITE_NAME || "Baratto Locale",
  defaultCitySlug: import.meta.env.VITE_DEFAULT_CITY_SLUG || "sardegna",
  defaultCityName: import.meta.env.VITE_DEFAULT_CITY_NAME || "Sardegna",
  telegramBotUsername: import.meta.env.VITE_TELEGRAM_BOT_USERNAME || "",
};

export const cities = [
  { slug: "sardegna", name: "Sardegna" },
  { slug: "lombardia", name: "Lombardia" },
  { slug: "lazio", name: "Lazio" },
  { slug: "campania", name: "Campania" },
  { slug: "sicilia", name: "Sicilia" },
  { slug: "piemonte", name: "Piemonte" },
  { slug: "veneto", name: "Veneto" },
  { slug: "emilia-romagna", name: "Emilia-Romagna" },
  { slug: "toscana", name: "Toscana" },
  { slug: "puglia", name: "Puglia" },
];

export const categories = [
  "Libri",
  "Casa",
  "Elettronica",
  "Giochi",
  "Abbigliamento",
  "Sport",
  "Bambini",
  "Altro",
];

export function getCityName(slug: string) {
  const city = cities.find((item) => item.slug === slug);

  if (city) {
    return city.name;
  }

  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
