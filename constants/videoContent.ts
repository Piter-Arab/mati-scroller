import { CATEGORY_VIDEOS } from "./data";

export type VideoContent = {
  id: number;
  videoUrl: string;
  caption: string;
  isViewed: boolean;
};

// Shuffle an array in place (Fisher-Yates)
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export function getShuffledPlaylist(selectedCategories: string[]): string[] {
  let allVideos: string[] = [];

  for (const category of selectedCategories) {
    if (CATEGORY_VIDEOS[category]) {
      allVideos = allVideos.concat(CATEGORY_VIDEOS[category]);
    }
  }

  // Shuffle the combined list of videos from selected categories
  return shuffleArray(allVideos);
}

export function getNextVideos(
  playlist: string[],
  count: number,
  currentCount: number, // How many videos have been generated so far (to calculate ID)
): VideoContent[] {
  if (playlist.length === 0) return [];

  const newVideos: VideoContent[] = [];
  for (let i = 0; i < count; i++) {
    const id = currentCount + i + 1; // 1-based ID
    // Use modulo to loop through the playlist
    const playlistIndex = (currentCount + i) % playlist.length;

    newVideos.push({
      id: id,
      videoUrl: playlist[playlistIndex],
      caption: `Reel #${id}`,
      isViewed: false,
    });
  }
  return newVideos;
}
