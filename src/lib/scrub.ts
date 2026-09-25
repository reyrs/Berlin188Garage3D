/**
 * Drives a paused <video> from scroll progress. One controller per slot lives
 * as long as the page and always knows the latest progress; the <video> is
 * attached when its clip is loaded and picks up that progress straight away,
 * even if the scroll has already stopped.
 *
 * The playhead eases toward the target instead of jumping, and a new seek is
 * only issued once the previous one has landed, so fast scrolling never
 * queues up a backlog of seeks. Clips are encoded with short keyframe
 * intervals (scripts/build-videos.mjs), which keeps each seek cheap.
 */
export class ScrubController {
  private video: HTMLVideoElement | null = null;
  private progress = 0;
  private target = 0;
  private current = 0;
  private frame = 0;
  /** Last time written to the video (a decoder may report a snapped time back). */
  private written = -1;

  /** 0-1 across the clip. */
  setProgress(progress: number) {
    this.progress = Math.min(Math.max(progress, 0), 1);
    this.kick();
  }

  attach(video: HTMLVideoElement) {
    this.detach();
    this.video = video;
    this.current = video.currentTime;
    // Progress set before the metadata arrived is applied once it does.
    video.addEventListener('loadedmetadata', this.kick);
    this.kick();
  }

  detach() {
    this.video?.removeEventListener('loadedmetadata', this.kick);
    this.video = null;
    cancelAnimationFrame(this.frame);
    this.frame = 0;
  }

  private kick = () => {
    const duration = this.video?.duration ?? NaN;
    if (!Number.isFinite(duration) || duration <= 0) return;
    // Stop just short of the end: seeking to the exact end blanks some decoders.
    this.target = this.progress * Math.max(duration - 0.05, 0);
    if (!this.frame) this.frame = requestAnimationFrame(this.tick);
  };

  private tick = () => {
    const video = this.video;
    if (!video) {
      this.frame = 0;
      return;
    }
    const diff = this.target - this.current;
    this.current = Math.abs(diff) < 0.01 ? this.target : this.current + diff * 0.25;
    if (!video.seeking && video.readyState >= 1 && Math.abs(video.currentTime - this.current) > 0.008) {
      video.currentTime = this.written = this.current;
    }
    const landed = Math.abs(video.currentTime - this.current) <= 0.008 || this.written === this.current;
    const settled = this.current === this.target && !video.seeking && landed;
    this.frame = settled ? 0 : requestAnimationFrame(this.tick);
  };
}

/**
 * iOS Safari only decodes seeks on a muted inline video after it has been
 * played once from a user gesture. One play()/pause() on the first touch.
 */
export function unlockOnFirstTouch(video: HTMLVideoElement): () => void {
  const unlock = () => {
    video
      .play()
      .then(() => video.pause())
      .catch(() => {});
  };
  window.addEventListener('touchstart', unlock, { once: true, passive: true });
  return () => window.removeEventListener('touchstart', unlock);
}
