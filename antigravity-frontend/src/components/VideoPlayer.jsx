import React, { useEffect, useRef } from 'react';
import YouTube from 'react-youtube';

const VideoPlayer = ({ youtubeUrl, startPositionSeconds, onProgress, onCompleted, isLocked }) => {
    const playerRef = useRef(null);
    const intervalRef = useRef(null);

    let videoId = youtubeUrl;
    try {
        if (youtubeUrl && (youtubeUrl.includes('youtube.com') || youtubeUrl.includes('youtu.be'))) {
            const url = new URL(youtubeUrl);
            if (url.hostname === 'youtu.be') {
                videoId = url.pathname.slice(1);
            } else if (url.searchParams.has('v')) {
                videoId = url.searchParams.get('v');
            }
        }
    } catch (e) { }

    const onReady = (event) => {
        playerRef.current = event.target;
        if (startPositionSeconds) {
            event.target.seekTo(startPositionSeconds);
        }
    };

    const startTracking = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(async () => {
            if (playerRef.current && onProgress) {
                const currentTime = await playerRef.current.getCurrentTime();
                onProgress(Math.floor(currentTime));
            }
        }, 5000); // 5 seconds debounce
    };

    const stopTracking = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    const onStateChange = async (event) => {
        if (event.data === 1) { // 1 = PLAYING
            startTracking();
        } else {
            stopTracking();
        }

        if (event.data === 0) { // 0 = ENDED
            if (onCompleted) {
                const currentTime = await playerRef.current.getCurrentTime();
                onCompleted(Math.floor(currentTime));
            }
        }
    };

    useEffect(() => {
        return () => stopTracking();
    }, []);

    if (isLocked) {
        return (
            <div className="relative w-full pt-[56.25%] bg-slate-900 rounded-xl flex items-center justify-center border border-slate-700">
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                    <svg className="w-12 h-12 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <p className="font-medium">Complete previous video to unlock</p>
                </div>
            </div>
        );
    }

    if (!videoId) return null;

    const opts = {
        height: '100%',
        width: '100%',
        playerVars: {
            autoplay: 1,
            modestbranding: 1,
            rel: 0
        },
    };

    return (
        <div className="relative w-full pt-[56.25%] bg-black rounded-xl overflow-hidden shadow-lg border border-slate-700 pointer-events-auto">
            <YouTube
                videoId={videoId}
                opts={opts}
                onReady={onReady}
                onStateChange={onStateChange}
                className="absolute top-0 left-0 w-full h-full"
                iframeClassName="w-full h-full"
            />
        </div>
    );
};

export default VideoPlayer;
