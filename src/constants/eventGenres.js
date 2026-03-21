export const DEFAULT_EVENT_GENRES = [
  "Âm nhạc",
  "EDM",
  "Hội thảo",
  "Nghệ thuật",
  "Thể thao",
  "Giáo dục",
  "Triển lãm",
  "eSports"
];

export function getEventGenreOptions(events = []) {
  const genreSet = new Set(
    events
      .map((event) => event?.genre)
      .filter((genre) => typeof genre === "string" && genre.trim())
      .map((genre) => genre.trim())
  );

  DEFAULT_EVENT_GENRES.forEach((genre) => {
    genreSet.add(genre);
  });

  return Array.from(genreSet);
}
