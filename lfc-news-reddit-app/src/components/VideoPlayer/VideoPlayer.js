/**
 * @author Tom Butler
 * @date 2026-01-19
 * @description Video player component with HLS support for Reddit videos with audio.
 *              Falls back to standard video element when HLS is not available.
 *
 * WHY: Reddit separates video and audio streams. HLS (HTTP Live Streaming) is required
 *      to play videos with audio. The fallback_url only provides silent video.
 */

import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Hls from 'hls.js';
import styles from './VideoPlayer.module.css';

/**
 * VideoPlayer component that handles Reddit video playback with audio
 *
 * @param {Object} props
 * @param {Object} props.videoData - Reddit video data object containing hls_url, fallback_url, has_audio
 * @param {string} props.className - Optional CSS class for styling
 * @param {string} props.title - Video title for accessibility
 * @return {JSX.Element}
 * @constructor
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

    // WHY: Only use HLS if the video has audio, otherwise use fallback (simpler, better performance)
    if (hasAudio && hlsUrl) {
      // Check if HLS is supported by the browser
      if (Hls.isSupported()) {
        // Initialize HLS.js
        const hls = new Hls({
          // WHY: Enable debug logging in development for troubleshooting
          debug: process.env.NODE_ENV === 'development',
          // WHY: Optimize for low latency playback
          enableWorker: true,
          lowLatencyMode: false,
          // WHY: Start playback quickly with smaller initial buffer
          maxBufferLength: 30,
          maxMaxBufferLength: 60,
          maxBufferSize: 60 * 1000 * 1000, // 60MB
        });

        // Store HLS instance in ref for cleanup
        hlsRef.current = hls;

        // Load the HLS stream
        hls.loadSource(hlsUrl);
        hls.attachMedia(video);

        // Handle HLS errors
        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                // WHY: Network errors are often transient, try to recover
                console.error('HLS network error, attempting recovery:', data);
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                // WHY: Media errors can sometimes be recovered by reconfiguring the codec
                console.error('HLS media error, attempting recovery:', data);
                hls.recoverMediaError();
                break;
              default:
                // WHY: Fatal errors that can't be recovered, destroy HLS and fall back to standard video
                console.error('Fatal HLS error, destroying player:', data);
                hls.destroy();
                // Fall back to fallback_url
                video.src = fallbackUrl;
                break;
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // WHY: Safari has native HLS support, no need for HLS.js
        video.src = hlsUrl;
      } else {
        // WHY: Browser doesn't support HLS, use fallback (silent video)
        video.src = fallbackUrl;
      }
    } else {
      // WHY: No audio or no HLS URL, use fallback
      video.src = fallbackUrl;
    }

    // Cleanup function
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
      className={`${styles.video} ${className}`}
      controls
      playsInline
      preload="metadata"
      aria-label={title}
    >
      {/* WHY: Caption track for accessibility - currently empty but allows future caption support */}
      <track kind="captions" src="" label="Captions" />
      <p>Your browser does not support the video element.</p>
    </video>
  );
};

VideoPlayer.propTypes = {
  // Reddit video data object containing hls_url, fallback_url, has_audio
  videoData: PropTypes.shape({
    hls_url: PropTypes.string,
    fallback_url: PropTypes.string,
    has_audio: PropTypes.bool,
    width: PropTypes.number,
    height: PropTypes.number
  }),
  // Optional CSS class for styling
  className: PropTypes.string,
  // Video title for accessibility
  title: PropTypes.string
};

// WHY: Default values are set via ES6 default parameters in the function signature
// instead of defaultProps, which is deprecated in React 18.3+

export default React.memo(VideoPlayer);
