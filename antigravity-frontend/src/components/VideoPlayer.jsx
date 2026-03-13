import React from 'react';

const VideoPlayer = ({ youtubeUrl }) => {
    let videoId = youtubeUrl;
    try {
        if (youtubeUrl.includes('youtube.com') || youtubeUrl.includes('youtu.be')) {
            const url = new URL(youtubeUrl);
            if (url.hostname === 'youtu.be') {
                videoId = url.pathname.slice(1);
            } else if (url.searchParams.has('v')) {
                videoId = url.searchParams.get('v');
            }
        }
    } catch (e) { }

    return (
        <div className="relative w-full pt-[56.25%] bg-black rounded-xl overflow-hidden shadow-lg border border-slate-700">
            <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
                title="Course Video"
            />
        </div>
    );
};

export default VideoPlayer;
