/** biome-ignore-all lint/a11y/noSvgWithoutTitle: SVGs without titles are used for decoration */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { VideoCard } from "@/components/VideoCard";
import { CATEGORY_VIDEOS } from "@/constants/data";
import {
  getNextVideos,
  getShuffledPlaylist,
  type VideoContent,
} from "@/constants/videoContent";

const App: React.FC = () => {
  // State for session start and categories
  const [hasStarted, setHasStarted] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [playlist, setPlaylist] = useState<string[]>([]);

  // State for video feed
  const [videos, setVideos] = useState<VideoContent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  // Ref to track loading state synchronously
  const isLoadingRef = useRef(false);

  const feedRef = useRef<HTMLDivElement>(null);

  // --- CATEGORY SELECTION LOGIC ---

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  const handleContinue = () => {
    if (selectedCategories.length === 0) return;

    const newPlaylist = getShuffledPlaylist(selectedCategories);
    setPlaylist(newPlaylist);

    // Initialize first batch of videos
    const initialVideos = getNextVideos(newPlaylist, 3, 0);
    setVideos(initialVideos);

    setHasStarted(true);
  };

  // --- A. INFINITE SCROLL / LOAD MORE LOGIC ---

  const handleVideoVisible = useCallback(
    (videoId: number) => {
      // Determine the index of the last currently loaded video
      const lastVideoId = videos[videos.length - 1]?.id;

      // If the user is viewing the second-to-last or last video, load more.
      if (
        !isLoadingRef.current &&
        lastVideoId &&
        (videoId === lastVideoId || videoId === lastVideoId - 1)
      ) {
        setIsLoading(true);
        isLoadingRef.current = true;

        // Simulate API delay
        setTimeout(() => {
          setVideos((prev) => {
            // Calculate startId based on current length of the updated state
            const currentCount = prev.length;
            const newVideos = getNextVideos(playlist, 3, currentCount);
            return [...prev, ...newVideos];
          });
          setIsLoading(false);
          isLoadingRef.current = false;
        }, 500);
      }
    },
    [videos, playlist], // Removed isLoading from dependency since we use ref
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
    if (!hasStarted) return;

    const timer = setTimeout(() => {
      console.log(
        `Redirecting user to ${REDIRECT_URL} after ${REDIRECT_TIME_MS / 60000} minutes.`,
      );
      // window.location.href = REDIRECT_URL; // Uncomment this in a real application
      alert(`Simulation: Redirecting to ${REDIRECT_URL} now!`);
    }, REDIRECT_TIME_MS);

    return () => clearTimeout(timer);
  }, [hasStarted]);

  if (!hasStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 font-sans p-4">
        <h1 className="text-3xl font-bold mb-8">Select Categories</h1>
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
          <ul className="space-y-4">
            {Object.keys(CATEGORY_VIDEOS).map((category) => (
              <li key={category} className="flex items-center">
                <label className="flex items-center space-x-3 cursor-pointer w-full p-2 hover:bg-gray-50 rounded">
                  <input
                    type="checkbox" // Using checkbox as multiple selection is allowed
                    className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300 transition duration-150 ease-in-out"
                    checked={selectedCategories.includes(category)}
                    onChange={() => toggleCategory(category)}
                  />
                  <span className="text-gray-900 font-medium">{category}</span>
                </label>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <button
              type="button"
              onClick={handleContinue}
              disabled={selectedCategories.length === 0}
              className={`w-full py-3 px-4 rounded-full font-bold text-white transition-colors duration-200 ${
                selectedCategories.length === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 shadow-lg"
              }`}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

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
        className="reels-feed w-full md:max-w-md h-screen md:h-[90vh] overflow-y-scroll snap-y bg-black"
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
