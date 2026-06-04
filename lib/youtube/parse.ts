export const parseYoutubeVideoId = (url: string): string | null => {
  if (!url) {
    return null;
  }

  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      const value = parsed.pathname.replace("/", "").trim();
      return value || null;
    }

    if (parsed.hostname.includes("youtube.com")) {
      const value = parsed.searchParams.get("v");
      return value || null;
    }

    return null;
  } catch {
    return null;
  }
};
