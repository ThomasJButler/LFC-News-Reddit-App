import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { cn } from '@/lib/utils';

/**
 * VideoPlayer — Reddit video playback with HLS support for audio.
 * Reddit separates video and audio streams; HLS recombines them.
 * Falls back to silent video for browsers without HLS support.
 */
const VideoPlayer = ({ videoData, className = '', title = 'Video' }) => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);

  useEffect(() => {
    if (!videoRef.current || !videoData) return;

    const video = videoRef.current;
    const hasAudio = videoData.has_audio;
    const hlsUrl = videoData.hls_url;
    const fallbackUrl = videoData.fallback_url;

    if (hasAudio && hlsUrl) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          debug: process.env.NODE_ENV === 'development',
          enableWorker: true,
          lowLatencyMode: false,
          maxBufferLength: 30,
          maxMaxBufferLength: 60,
          maxBufferSize: 60 * 1000 * 1000,
        });

        hlsRef.current = hls;
        hls.loadSource(hlsUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.error('HLS network error, attempting recovery:', data);
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.error('HLS media error, attempting recovery:', data);
                hls.recoverMediaError();
                break;
              default:
                console.error('Fatal HLS error, destroying player:', data);
                hls.destroy();
                video.src = fallbackUrl;
                break;
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = hlsUrl;
      } else {
        video.src = fallbackUrl;
      }
    } else {
      video.src = fallbackUrl;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [videoData]);

  if (!videoData) return null;

  return (
    <video
      ref={videoRef}
      className={cn(
        'w-full rounded-lg bg-card',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        className
      )}
      controls
      playsInline
      preload="metadata"
      aria-label={title}
      data-testid="video-player"
    >
      <track kind="captions" src="" label="Captions" />
      <p>Your browser does not support the video element.</p>
    </video>
  );
};

export default React.memo(VideoPlayer);
