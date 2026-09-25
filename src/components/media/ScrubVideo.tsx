import { useEffect, useRef, useState } from 'react';
import type { VideoSlot } from '../../data/media';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { unlockOnFirstTouch, type ScrubController } from '../../lib/scrub';

interface ScrubVideoProps {
  slot: VideoSlot;
  /** The parent drives playback through it: scrubber.setProgress(0-1). */
  scrubber: ScrubController;
  /** Attach the source only when the clip is about to be seen. */
  load: boolean;
  className?: string;
}

/**
 * A scroll-scrubbed clip layered over its photo. The photo underneath stays
 * the poster: the video fades in only once its first frame is decoded, so a
 * slow or failed download simply leaves the photo showing.
 */
export function ScrubVideo({ slot, scrubber, load, className = '' }: ScrubVideoProps) {
  const portrait = useMediaQuery('(orientation: portrait)');
  const clip = portrait ? (slot.tall ?? slot.wide) : (slot.wide ?? slot.tall);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !load || !clip) return;
    scrubber.attach(video);
    const release = unlockOnFirstTouch(video);
    return () => {
      release();
      scrubber.detach();
      setReady(false);
    };
  }, [clip, load, scrubber]);

  if (!clip) return null;

  return (
    <video
      ref={videoRef}
      src={load ? clip.src : undefined}
      width={clip.width}
      height={clip.height}
      muted
      playsInline
      preload={load ? 'auto' : 'none'}
      disablePictureInPicture
      disableRemotePlayback
      aria-hidden="true"
      tabIndex={-1}
      onLoadedData={() => setReady(true)}
      className={`transition-opacity duration-500 ${ready ? 'opacity-100' : 'opacity-0'} ${className}`}
    />
  );
}
