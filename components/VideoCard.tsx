/** biome-ignore-all lint/a11y/noSvgWithoutTitle: <explanation> */
"use client";
import React, { useEffect, useRef } from "react";
import type { VideoContent } from "@/constants/videoContent";

interface VideoCardProps {
  video: VideoContent;
  onVisible: (id: number) => void;
  isMuted: boolean;
  toggleMute: () => void;
}

export const VideoCard: React.FC<VideoCardProps> = React.memo(
  ({ video, onVisible, isMuted, toggleMute }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const elementRef = useRef<HTMLDivElement>(null);

    // Sync muted state prop with video element
    useEffect(() => {
      if (videoRef.current) {
        videoRef.current.muted = isMuted;
      }
    }, [isMuted]);

    useEffect(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // Video is at least partially visible

              // 1. Ensure src is loaded (if it was unloaded)
              if (videoRef.current && !videoRef.current.src) {
                videoRef.current.src = video.videoUrl;
                videoRef.current.load();
              }

              // 2. Play if sufficient visibility
              if (entry.intersectionRatio >= 0.2) {
                onVisible(video.id);
                if (videoRef.current) {
                  // Always attempt to play with current muted state.
                  // Note: If isMuted is false (sound ON) and user hasn't interacted,
                  // this promise might reject on iOS.
                  // However, if we start Muted (default), it works.
                  // If user toggles sound, isMuted becomes false.

                  // Ensure sync before play
                  videoRef.current.muted = isMuted;

                  const playPromise = videoRef.current.play();
                  if (playPromise !== undefined) {
                    playPromise.catch((e) => {
                      console.log("Autoplay failed", e);
                      // Fallback: If failed and we were trying to play unmuted,
                      // force mute and try again.
                      if (videoRef.current && !videoRef.current.muted) {
                        videoRef.current.muted = true;
                        videoRef.current
                          .play()
                          .catch((err) => console.error("Retry failed", err));
                      }
                    });
                  }
                }
              }
            } else {
              // Video is completely off-screen
              if (videoRef.current) {
                videoRef.current.pause();
                // aggressive memory cleanup for Safari
                videoRef.current.removeAttribute("src");
                videoRef.current.load();
              }
            }
          });
        },
        {
          threshold: [0, 0.2], // 0 for load/unload, 0.2 for play
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
    }, [video.id, video.videoUrl, onVisible, isMuted]);

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
          loop
          muted={isMuted} // Controlled by prop
          playsInline
          preload="metadata"
        >
          Your browser does not support the video tag.
        </video>

        {/* Mute/Unmute Button Overlay */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleMute();
          }}
          className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors z-10"
        >
          {isMuted ? (
            // Muted Icon
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"
              />
            </svg>
          ) : (
            // Unmuted Icon
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"
              />
            </svg>
          )}
        </button>

        <div className="absolute bottom-0 left-0 w-full p-6 text-white bg-gradient-to-t from-black/70 to-transparent pointer-events-none">
          <p className="font-bold text-lg">{video.caption}</p>
        </div>
      </div>
    );
  },
);

VideoCard.displayName = "VideoCard";
