import React, { useEffect } from 'react';

interface ImageZoom {
  /** The URL of the image to display in the zoomed view. */
  imageUrl: string;
  /** A callback function to close the zoomed view. */
  onClose: () => void;
  /** A callback function for navigating to the previous or next image. */
  onNavigate: (direction: number) => void;
  /** The index of the currently displayed image. */
  currentImageIndex: number;
  /** The total number of images in the gallery. */
  totalImages: number;
}

/**
 * ImageZoom make images clickable and open a popup to see image closer
 *
 * @author Chen
 */
const ImageZoom: React.FC<ImageZoom> = ({
  imageUrl,
  onClose,
  onNavigate,
  currentImageIndex,
  totalImages,
}) => {
  // Check if the left/right navigation arrow should be disabled
  const isLeftDisabled = currentImageIndex === 0;
  const isRightDisabled = currentImageIndex === totalImages - 1;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' && !isLeftDisabled) {
        onNavigate(-1);
      } else if (event.key === 'ArrowRight' && !isRightDisabled) {
        onNavigate(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    currentImageIndex,
    totalImages,
    onNavigate,
    isLeftDisabled,
    isRightDisabled,
  ]);

  const handleClickOutside = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="image-click-modal" onClick={handleClickOutside}>
      <div className="image-modal-content">
        <button
          className={`nav-button left ${isLeftDisabled ? 'disabled' : ''}`}
          onClick={() => onNavigate(-1)}
          disabled={isLeftDisabled}
        >
          &lt; {/* Left arrow symbol */}
        </button>
        <img src={imageUrl} draggable="false" alt="Zoomed Image" />
        <button
          className={`nav-button right ${isRightDisabled ? 'disabled' : ''}`}
          onClick={() => onNavigate(1)}
          disabled={isRightDisabled}
        >
          &gt; {/* Right arrow symbol */}
        </button>
        <span className="close-icon" onClick={onClose}>
          {/* Close button code */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="currentColor"
            className="bi bi-x-circle"
            viewBox="0 0 16 16"
          >
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
          </svg>
        </span>
      </div>
    </div>
  );
};

export default ImageZoom;
