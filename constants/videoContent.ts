import { VIDEO_PATHS } from "./data";

export type VideoContent = {
  id: number;
  videoUrl: string;
  caption: string;
  isViewed: boolean;
};

export function fetchVideos(count: number, startId: number): VideoContent[] {
  const newVideos: VideoContent[] = [];
  for (let i = 0; i < count; i++) {
    const id = startId + i;
    newVideos.push({
      id: id,
      videoUrl: VIDEO_PATHS[id % VIDEO_PATHS.length],
      caption: `Reel #${id}: This is a sample caption.`,
      isViewed: false,
    });
  }
  return newVideos;
}
