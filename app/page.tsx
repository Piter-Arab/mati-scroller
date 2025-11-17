/** biome-ignore-all lint/a11y/noSvgWithoutTitle: <explanation> */

"use client";

import { VideoCard } from "@/components/VideoCard";
import { fetchVideos, VideoContent } from "@/constants/videoContent";
import { useState, useRef, useCallback, useEffect } from "react";

const App: React.FC = () => {
  const [videos, setVideos] = useState<VideoContent[]>(() => fetchVideos(3, 1));
  const [isLoading, setIsLoading] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);

  // --- A. INFINITE SCROLL / LOAD MORE LOGIC ---

  const handleVideoVisible = useCallback(
    (videoId: number) => {
      // Determine the index of the last currently loaded video
      const lastVideoId = videos[videos.length - 1]?.id;

      // If the user is viewing the second-to-last or last video, load more.
      if (
        !isLoading &&
        lastVideoId &&
        (videoId === lastVideoId || videoId === lastVideoId - 1)
      ) {
        setIsLoading(true);
        // Simulate API delay
        setTimeout(() => {
          const newVideos = fetchVideos(3, lastVideoId + 1);
          setVideos((prev) => [...prev, ...newVideos]);
          setIsLoading(false);
        }, 500);
      }
    },
    [videos, isLoading],
  );

  // --- B. SCROLL BUTTON LOGIC ---

  const scrollByAmount = (direction: "up" | "down") => {
    if (feedRef.current) {
      // 1. Find all snapped video elements
      const videoElements = Array.from(
        feedRef.current.children,
      ) as HTMLElement[];

      const containerTop = feedRef.current.getBoundingClientRect().top;

      // Find the index of the video element currently snapped to the top of the container.
      const currentSnapIndex = videoElements.findIndex((el) => {
        const rect = el.getBoundingClientRect();
        // Calculate position relative to the container's top edge.
        const relativeTop = rect.top - containerTop;
        // Check if the relative position is near zero (this is the snapped element)
        return relativeTop >= -10 && relativeTop <= 10;
      });

      let targetIndex = -1;

      if (direction === "down") {
        // Ensure we don't go past the last video
        targetIndex =
          currentSnapIndex < videoElements.length - 1
            ? currentSnapIndex + 1
            : -1;
      } else {
        // 'up' - Ensure we don't go past the first video
        targetIndex = currentSnapIndex > 0 ? currentSnapIndex - 1 : -1;
      }

      // 3. Scroll the target element into view using native browser smoothing
      if (targetIndex !== -1 && videoElements[targetIndex]) {
        videoElements[targetIndex].scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const REDIRECT_TIME_MS = 300000; // 5 minutes
  const REDIRECT_URL = "https://www.google.com";

  useEffect(() => {
    const timer = setTimeout(() => {
      console.log(
        `Redirecting user to ${REDIRECT_URL} after ${REDIRECT_TIME_MS / 60000} minutes.`,
      );
      // window.location.href = REDIRECT_URL; // Uncomment this in a real application
      alert(`Simulation: Redirecting to ${REDIRECT_URL} now!`);
    }, REDIRECT_TIME_MS);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col md:flex-row items-center justify-center min-h-screen bg-gray-100 font-sans">
      <style>{`
        /* Custom CSS for vertical scroll snapping */
        .reels-feed {
          scroll-snap-type: y mandatory;
          -webkit-overflow-scrolling: touch; /* For smoother scrolling on iOS */
        }
        .scroll-snap-start {
            scroll-snap-align: start;
        }
        /* Hide scrollbar but allow scrolling */
        .reels-feed::-webkit-scrollbar {
            display: none;
        }
        .reels-feed {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
        }
      `}</style>

      {/* Scrollable Feed Container */}
      <div
        ref={feedRef}
        className="reels-feed w-full md:max-w-md h-screen md:h-[90vh] overflow-y-scroll snap-ybg-black"
      >
        {videos.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            onVisible={handleVideoVisible}
          />
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center justify-center h-full text-white text-lg p-8">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Loading more content...
          </div>
        )}
      </div>

      {/* Navigation Buttons (Hidden on small screens) */}
      <div className="hidden md:flex flex-col ml-6 space-y-4">
        <button
          type="button"
          onClick={() => scrollByAmount("up")}
          className="p-4 bg-neutral-900 text-white hover:bg-neutral-950 cursor-pointer transition-all duration-300 rounded-full shadow-lg backdrop-blur-sm group"
          title="Previous Reel"
        >
          <svg
            className="w-6 h-6 group-hover:-translate-y-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            ></path>
          </svg>
        </button>
        <button
          type="button"
          onClick={() => scrollByAmount("down")}
          className="p-4 bg-neutral-900 text-white hover:bg-neutral-950 cursor-pointer transition-all duration-300 rounded-full shadow-lg backdrop-blur-sm group"
          title="Next Reel"
        >
          <svg
            className="w-6 h-6 group-hover:translate-y-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            ></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default App;
