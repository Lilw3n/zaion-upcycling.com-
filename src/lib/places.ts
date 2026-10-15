function fold(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]/g, "");
}

export function googleServiceAddress() {
  return (process.env.GOOGLE_SERVICE_ADDRESS ?? "").trim();
}

export function suggestedAtelierAddress() {
  return (process.env.ATELIER_ADDRESS ?? "").trim();
}

export function isPersonalHome(value: string) {
  const home = fold(googleServiceAddress());
  const current = fold(value);
  if (!home || current.length < 12) return false;
  return current.includes(home) || home.includes(current);
}
