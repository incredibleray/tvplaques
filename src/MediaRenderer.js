import React from 'react';

export const MediaRenderer = ({ url }) => {
  // Determine the media type based on the URL
  const mediaType = (() => {
    if (url.match(/\.(jpeg|jpg|gif|png)$/) !== null) {
      return 'photo';
    } else if (url.match(/\.(mp4|webm|ogg)$/) !== null) {
      return 'video';
    } else if (url.match(/youtube\.com\/watch\?v=/) !== null) {
      return 'youtube';
    } else {
      return null;
    }
  })();

  // Render the appropriate media based on the type
  if (mediaType === 'photo') {
    return <img src={url} alt="Media" />;
  } else if (mediaType === 'video') {
    return <video src={url} controls />;
  } else if (mediaType === 'youtube') {
    const videoId = url.split('v=')[1];
    return (
      <div className="youtube-video">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    );
  } else {
    return null;
  }
};


