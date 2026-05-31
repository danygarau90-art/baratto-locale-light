export function cleanTelegramUsername(value?: FormDataEntryValue | string | null) {
  return String(value || "")
    .trim()
    .replace(/^@+/, "")
    .replace(/^https?:\/\/t\.me\//i, "")
    .replace(/^t\.me\//i, "")
    .replace(/\/+$/, "");
}

export function isRealTelegramUsername(value?: FormDataEntryValue | string | null) {
  const username = cleanTelegramUsername(value).toLowerCase();

  return (
    username.length >= 5 &&
    username !== "username_demo" &&
    username !== "demo" &&
    !username.includes("demo")
  );
}

export function getTelegramUrl(value?: FormDataEntryValue | string | null) {
  if (!isRealTelegramUsername(value)) {
    return "";
  }

  return `https://t.me/${cleanTelegramUsername(value)}`;
}
