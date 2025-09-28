/**
 * Video Lazy Loading Module
 * Provides lazy loading functionality for YouTube and Vimeo videos
 */
(function () {
  "use strict";

  // Video provider configurations
  const PROVIDERS = {
    youtube: {
      embedPattern: /(?:youtube\.com\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
      thumbnailUrl: (id) => `https://img.youtube.com/vi/${id}/sddefault.jpg`,
      embedUrl: (id) => `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`,
    },
    vimeo: {
      embedPattern: /(?:vimeo\.com\/video\/|player\.vimeo\.com\/video\/)(\d+)/,
      thumbnailUrl: (id) => `https://vumbnail.com/${id}.jpg`,
      embedUrl: (id) => `https://player.vimeo.com/video/${id}?autoplay=1`,
    },
  };

  /**
   * Extracts video ID and determines provider from embed URL
   */
  function parseVideoUrl(url) {
    for (const [provider, config] of Object.entries(PROVIDERS)) {
      const match = url.match(config.embedPattern);
      if (match) {
        return { provider, id: match[1], config };
      }
    }
    return null;
  }

  /**
   * Creates and loads thumbnail image
   */
  function createThumbnail(videoInfo, container) {
    const thumbnailUrl = videoInfo.config.thumbnailUrl(videoInfo.id);
    const image = new Image();

    image.onload = function () {
      container.appendChild(image);
      container.classList.add("video-loaded");
    };

    image.onerror = function () {
      // Fallback: show play button without thumbnail
      container.classList.add("video-loaded");
    };

    image.src = thumbnailUrl;
    image.alt = "Video thumbnail";
  }

  /**
   * Creates play button element
   */
  function createPlayButton() {
    const playButton = document.createElement("div");
    playButton.className = "video-play-button";
    playButton.setAttribute("aria-label", "Play video");

    const playIcon = document.createElement("div");
    playIcon.className = "video-play-icon";
    playButton.appendChild(playIcon);

    return playButton;
  }

  /**
   * Loads the actual video iframe
   */
  function loadVideo(videoInfo, container) {
    const embedUrl = videoInfo.config.embedUrl(videoInfo.id);
    const iframe = document.createElement("iframe");

    iframe.src = embedUrl;
    iframe.frameBorder = "0";
    iframe.allowFullscreen = true;
    iframe.setAttribute("allow", "autoplay; fullscreen");

    // Clear container and add iframe
    container.innerHTML = "";
    container.appendChild(iframe);
    container.classList.add("video-playing");
  }

  /**
   * Sets up click handler for video container
   */
  function setupVideoContainer(container) {
    const videoUrl = container.dataset.videoUrl;

    if (!videoUrl) {
      console.warn("Video container missing data-video-url attribute");
      return;
    }

    const videoInfo = parseVideoUrl(videoUrl);

    if (!videoInfo) {
      console.warn("Unsupported video URL:", videoUrl);
      return;
    }

    // Create and add play button
    const playButton = createPlayButton();
    container.appendChild(playButton);

    // Load thumbnail
    createThumbnail(videoInfo, container);

    // Add click handler
    container.addEventListener("click", function () {
      loadVideo(videoInfo, container);
    });
  }

  /**
   * Initialize lazy loading for all video containers
   */
  function initializeLazyVideos() {
    const videoContainers = document.querySelectorAll(".video-lazy-container");

    videoContainers.forEach(setupVideoContainer);
  }

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeLazyVideos);
  } else {
    initializeLazyVideos();
  }

  // Export for manual initialization if needed
  window.VideoLazyLoad = {
    init: initializeLazyVideos,
    setupContainer: setupVideoContainer,
  };
})();
