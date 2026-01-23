/**
 * @author Tom Butler
 * @date 2026-01-21
 * @description Tests for VideoPlayer component.
 *              WHY: VideoPlayer handles HLS video streaming for Reddit videos with audio.
 *              These tests verify correct rendering, HLS initialization, fallback behaviour,
 *              and proper cleanup on unmount.
 */

import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';

// Mock Hls.js before importing VideoPlayer
const mockHlsInstance = {
  loadSource: jest.fn(),
  attachMedia: jest.fn(),
  on: jest.fn(),
  destroy: jest.fn(),
  startLoad: jest.fn(),
  recoverMediaError: jest.fn()
};

const mockHlsConstructor = jest.fn(() => mockHlsInstance);

jest.mock('hls.js', () => {
  const mock = function() {
    return mockHlsInstance;
  };
  mock.isSupported = jest.fn(() => true);
  mock.Events = {
    ERROR: 'hlsError'
  };
  mock.ErrorTypes = {
    NETWORK_ERROR: 'networkError',
    MEDIA_ERROR: 'mediaError'
  };
  return mock;
});

import VideoPlayer from '../VideoPlayer';
import Hls from 'hls.js';

// Sample video data for tests
const createVideoData = (overrides = {}) => ({
  hls_url: 'https://v.redd.it/test123/HLSPlaylist.m3u8',
  fallback_url: 'https://v.redd.it/test123/DASH_480.mp4',
  has_audio: true,
  width: 1920,
  height: 1080,
  ...overrides
});

describe('VideoPlayer Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock implementations
    Hls.isSupported.mockReturnValue(true);
    // Reset instance mocks
    mockHlsInstance.loadSource.mockClear();
    mockHlsInstance.attachMedia.mockClear();
    mockHlsInstance.on.mockClear();
    mockHlsInstance.destroy.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Rendering', () => {
    it('renders video element when videoData is provided', () => {
      render(<VideoPlayer videoData={createVideoData()} title="Test Video" />);

      const video = screen.getByLabelText('Test Video');
      expect(video).toBeInTheDocument();
      expect(video.tagName).toBe('VIDEO');
    });

    it('returns null when videoData is not provided', () => {
      const { container } = render(<VideoPlayer videoData={null} />);

      expect(container.firstChild).toBeNull();
    });

    it('returns null when videoData is undefined', () => {
      const { container } = render(<VideoPlayer />);

      expect(container.firstChild).toBeNull();
    });

    it('renders video with controls attribute', () => {
      render(<VideoPlayer videoData={createVideoData()} />);

      const video = screen.getByLabelText('Video');
      expect(video).toHaveAttribute('controls');
    });

    it('renders video with playsInline attribute', () => {
      render(<VideoPlayer videoData={createVideoData()} />);

      const video = screen.getByLabelText('Video');
      expect(video).toHaveAttribute('playsinline');
    });

    it('renders video with preload metadata attribute', () => {
      render(<VideoPlayer videoData={createVideoData()} />);

      const video = screen.getByLabelText('Video');
      expect(video).toHaveAttribute('preload', 'metadata');
    });

    it('applies custom className when provided', () => {
      render(<VideoPlayer videoData={createVideoData()} className="custom-video" />);

      const video = screen.getByLabelText('Video');
      expect(video.className).toContain('custom-video');
    });

    it('uses default title when not provided', () => {
      render(<VideoPlayer videoData={createVideoData()} />);

      expect(screen.getByLabelText('Video')).toBeInTheDocument();
    });

    it('uses custom title for aria-label', () => {
      render(<VideoPlayer videoData={createVideoData()} title="Match Highlights" />);

      expect(screen.getByLabelText('Match Highlights')).toBeInTheDocument();
    });
  });

  describe('HLS Support', () => {
    it('initializes HLS when browser supports it and video has audio', () => {
      render(<VideoPlayer videoData={createVideoData()} />);

      expect(mockHlsInstance.loadSource).toHaveBeenCalledWith('https://v.redd.it/test123/HLSPlaylist.m3u8');
      expect(mockHlsInstance.attachMedia).toHaveBeenCalled();
    });

    it('sets up error handler on HLS instance', () => {
      render(<VideoPlayer videoData={createVideoData()} />);

      expect(mockHlsInstance.on).toHaveBeenCalledWith('hlsError', expect.any(Function));
    });

    it('uses fallback URL when HLS is not supported', () => {
      Hls.isSupported.mockReturnValue(false);

      // Mock video element canPlayType
      const originalCanPlayType = HTMLVideoElement.prototype.canPlayType;
      HTMLVideoElement.prototype.canPlayType = jest.fn(() => '');

      render(<VideoPlayer videoData={createVideoData()} />);

      const video = screen.getByLabelText('Video');
      expect(video.src).toContain('DASH_480.mp4');

      HTMLVideoElement.prototype.canPlayType = originalCanPlayType;
    });

    it('uses native HLS when Safari supports it', () => {
      Hls.isSupported.mockReturnValue(false);

      // Mock Safari's native HLS support
      const originalCanPlayType = HTMLVideoElement.prototype.canPlayType;
      HTMLVideoElement.prototype.canPlayType = jest.fn((type) =>
        type === 'application/vnd.apple.mpegurl' ? 'maybe' : ''
      );

      render(<VideoPlayer videoData={createVideoData()} />);

      const video = screen.getByLabelText('Video');
      expect(video.src).toContain('HLSPlaylist.m3u8');

      HTMLVideoElement.prototype.canPlayType = originalCanPlayType;
    });
  });

  describe('Fallback Behaviour', () => {
    it('uses fallback URL when video has no audio', () => {
      render(<VideoPlayer videoData={createVideoData({ has_audio: false })} />);

      const video = screen.getByLabelText('Video');
      expect(video.src).toContain('DASH_480.mp4');
      // HLS should not be initialized for videos without audio
      expect(mockHlsInstance.loadSource).not.toHaveBeenCalled();
    });

    it('uses fallback URL when hls_url is not provided', () => {
      render(<VideoPlayer videoData={createVideoData({ hls_url: null })} />);

      const video = screen.getByLabelText('Video');
      expect(video.src).toContain('DASH_480.mp4');
    });

    it('uses fallback URL when hls_url is empty string', () => {
      render(<VideoPlayer videoData={createVideoData({ hls_url: '' })} />);

      const video = screen.getByLabelText('Video');
      expect(video.src).toContain('DASH_480.mp4');
    });
  });

  describe('Error Handling', () => {
    it('calls startLoad on network error', () => {
      render(<VideoPlayer videoData={createVideoData()} />);

      // Get the error handler that was registered
      const errorHandler = mockHlsInstance.on.mock.calls.find(
        call => call[0] === 'hlsError'
      )[1];

      // Simulate network error
      errorHandler('hlsError', {
        fatal: true,
        type: 'networkError'
      });

      expect(mockHlsInstance.startLoad).toHaveBeenCalled();
    });

    it('calls recoverMediaError on media error', () => {
      render(<VideoPlayer videoData={createVideoData()} />);

      const errorHandler = mockHlsInstance.on.mock.calls.find(
        call => call[0] === 'hlsError'
      )[1];

      // Simulate media error
      errorHandler('hlsError', {
        fatal: true,
        type: 'mediaError'
      });

      expect(mockHlsInstance.recoverMediaError).toHaveBeenCalled();
    });

    it('destroys HLS and falls back on unrecoverable error', () => {
      render(<VideoPlayer videoData={createVideoData()} />);

      const errorHandler = mockHlsInstance.on.mock.calls.find(
        call => call[0] === 'hlsError'
      )[1];

      // Simulate unrecoverable error
      errorHandler('hlsError', {
        fatal: true,
        type: 'otherError'
      });

      expect(mockHlsInstance.destroy).toHaveBeenCalled();

      const video = screen.getByLabelText('Video');
      expect(video.src).toContain('DASH_480.mp4');
    });

    it('ignores non-fatal errors', () => {
      render(<VideoPlayer videoData={createVideoData()} />);

      const errorHandler = mockHlsInstance.on.mock.calls.find(
        call => call[0] === 'hlsError'
      )[1];

      // Simulate non-fatal error
      errorHandler('hlsError', {
        fatal: false,
        type: 'networkError'
      });

      // Should not call any recovery methods for non-fatal errors
      expect(mockHlsInstance.startLoad).not.toHaveBeenCalled();
      expect(mockHlsInstance.recoverMediaError).not.toHaveBeenCalled();
      expect(mockHlsInstance.destroy).not.toHaveBeenCalled();
    });
  });

  describe('Cleanup', () => {
    it('destroys HLS instance on unmount', () => {
      const { unmount } = render(<VideoPlayer videoData={createVideoData()} />);

      unmount();

      expect(mockHlsInstance.destroy).toHaveBeenCalled();
    });

    it('handles cleanup when HLS was not initialized', () => {
      // Video without audio doesn't initialize HLS
      const { unmount } = render(<VideoPlayer videoData={createVideoData({ has_audio: false })} />);

      // Should not throw when unmounting
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('renders caption track for accessibility', () => {
      const { container } = render(<VideoPlayer videoData={createVideoData()} />);

      const track = container.querySelector('track[kind="captions"]');
      expect(track).toBeInTheDocument();
      expect(track).toHaveAttribute('label', 'Captions');
    });

    it('renders fallback text for browsers without video support', () => {
      render(<VideoPlayer videoData={createVideoData()} />);

      expect(screen.getByText('Your browser does not support the video element.')).toBeInTheDocument();
    });
  });

  describe('HLS Configuration', () => {
    it('initializes HLS with video data containing audio', () => {
      render(<VideoPlayer videoData={createVideoData()} />);

      // HLS is initialized when video has audio
      expect(mockHlsInstance.loadSource).toHaveBeenCalled();
      expect(mockHlsInstance.attachMedia).toHaveBeenCalled();
    });
  });

  describe('Video Data Changes', () => {
    it('handles rerender with new videoData', () => {
      const { rerender } = render(<VideoPlayer videoData={createVideoData()} />);

      // Rerender with new video data - component should handle cleanup and reinit
      rerender(<VideoPlayer videoData={createVideoData({ hls_url: 'https://v.redd.it/new123/HLSPlaylist.m3u8' })} />);

      // The component should have destroyed the old instance
      expect(mockHlsInstance.destroy).toHaveBeenCalled();
    });
  });

  describe('PropTypes', () => {
    it('accepts videoData prop with correct shape', () => {
      // This test verifies the component doesn't throw with valid props
      expect(() => render(
        <VideoPlayer
          videoData={{
            hls_url: 'https://example.com/video.m3u8',
            fallback_url: 'https://example.com/video.mp4',
            has_audio: true,
            width: 1280,
            height: 720
          }}
        />
      )).not.toThrow();
    });

    it('accepts optional className prop', () => {
      expect(() => render(
        <VideoPlayer
          videoData={createVideoData()}
          className="test-class"
        />
      )).not.toThrow();
    });

    it('accepts optional title prop', () => {
      expect(() => render(
        <VideoPlayer
          videoData={createVideoData()}
          title="Custom Title"
        />
      )).not.toThrow();
    });
  });
});
