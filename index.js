const REELS_MOBILE_BREAKPOINT = 899;
const SNAP_DELAY = 100;
const reelsTrack = document.getElementById("reelsTrack");
const reelCards = Array.from(document.querySelectorAll(".reel-card"));
const reelDots = Array.from(document.querySelectorAll(".diamond-dot"));
let scrollSnapTimeout = null;
let mobileSliderInitialized = false;

function isMobileView() {
   return window.innerWidth <= REELS_MOBILE_BREAKPOINT;
}
function stopOtherReels(activeCard = null) {
   reelCards.forEach((card) => {
      if (card === activeCard) return;
        const video = card.querySelector(".reel-video");
      if (!video) return;
        video.pause();
        video.currentTime = 0;
        card.classList.remove("is-playing");
   });
}
function playReel(card) {
  const video = card.querySelector(".reel-video");
  const videoSource = card.dataset.video;
  if (!video || !videoSource) return;
    stopOtherReels(card);
  if (!video.getAttribute("src")) {
    video.setAttribute("src", videoSource);
  }
  card.classList.add("is-playing");
  const playPromise = video.play();
  if (playPromise && typeof playPromise.catch === "function") {
    playPromise.catch(() => {
      card.classList.remove("is-playing");
    });
  }
}
function pauseReel(card) {
  const video = card.querySelector(".reel-video");
  if (!video) return;
    video.pause();
    card.classList.remove("is-playing");
}
function bindVideoCardEvents() {
  reelCards.forEach((card) => {
  const media = card.querySelector(".reel-media");
  const playButton = card.querySelector(".reel-play-btn");
  const video = card.querySelector(".reel-video");
  if (!media || !playButton || !video) return;
    playButton.addEventListener("click", (event) => {
    event.stopPropagation();
    playReel(card);
  });

  media.addEventListener("click", () => {
    const isPlaying = card.classList.contains("is-playing");
    isPlaying ? pauseReel(card) : playReel(card);
  });
  video.addEventListener("ended", () => {
    video.currentTime = 0;
    card.classList.remove("is-playing");
    });
  });
}
function updateActiveDot(activeIndex) {
  reelDots.forEach((dot, index) => {
  dot.classList.toggle("is-active", index === activeIndex);
  });
}
function getClosestSlideIndex() {
  if (!reelsTrack) return 0;
    const slideWidth = reelsTrack.clientWidth;
    if (!slideWidth) return 0;
      const rawIndex = reelsTrack.scrollLeft / slideWidth;
      const index = Math.round(rawIndex);
      return Math.max(0, Math.min(index, reelCards.length - 1));
}
function scrollToSlide(index, useSmoothScroll = true) {
  if (!reelsTrack || !reelCards[index]) return;
    const slideWidth = reelsTrack.clientWidth;
    const targetLeft = slideWidth * index;
    reelsTrack.scrollTo({
    left: targetLeft,
    behavior: useSmoothScroll ? "smooth" : "auto"
  });
  updateActiveDot(index);
  stopOtherReels();
}
function handleTrackScroll() {
  if (!isMobileView()) return;
    updateActiveDot(getClosestSlideIndex());
    clearTimeout(scrollSnapTimeout);
    scrollSnapTimeout = setTimeout(() => {
      scrollToSlide(getClosestSlideIndex());
   }, SNAP_DELAY);
}
function bindMobileSliderEvents() {
  if (!reelsTrack || reelDots.length === 0 || mobileSliderInitialized) return;
    reelsTrack.addEventListener("scroll", handleTrackScroll);
    reelDots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      scrollToSlide(index);
    });
  });
  mobileSliderInitialized = true;
}
function syncResponsiveState() {
  if (isMobileView()) {
    updateActiveDot(getClosestSlideIndex());
    return;
  }
  stopOtherReels();
}
function initializeReelsSection() {
  if (!reelsTrack || reelCards.length === 0) return;
    bindVideoCardEvents();
    bindMobileSliderEvents();
    syncResponsiveState();
}
window.addEventListener("resize", () => {
  syncResponsiveState();
});
window.addEventListener("load", () => {
  initializeReelsSection();
  if (isMobileView()) {
    scrollToSlide(0, false);
  }
});