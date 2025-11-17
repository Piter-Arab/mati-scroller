"use client";
import { useEffect, useRef } from "react";
import type { VideoContent } from "@/constants/videoContent";

interface VideoCardProps {
  video: VideoContent;
  onVisible: (id: number) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, onVisible }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.9) {
            onVisible(video.id);

            if (videoRef.current) {
              videoRef.current
                .play()
                .catch((e) => console.log("Video play failed:", e));
            }
          } else {
            if (videoRef.current) {
              videoRef.current.pause();
            }
          }
        });
      },
      {
        threshold: 0.9,
        root: elementRef.current?.parentElement,
      },
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [video.id, onVisible]);

  return (
    <div
      ref={elementRef}
      id={`video-${video.id}`}
      className="relative shrink-0 w-full h-full bg-black scroll-snap-start snap-center overflow-hidden"
    >
      <video
        ref={videoRef}
        src={video.videoUrl}
        className="w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        onLoadedData={(e) => {
          e.currentTarget.play().catch(() => {});
        }}
      >
        Your browser does not support the video tag.
      </video>

      <div className="absolute bottom-0 left-0 w-full p-6 text-white bg-gradient-to-t from-black/70 to-transparent">
        <p className="font-bold text-lg">{video.caption}</p>
      </div>
    </div>
  );
};
