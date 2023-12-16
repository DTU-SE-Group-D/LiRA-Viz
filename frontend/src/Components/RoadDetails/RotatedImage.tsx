import React, { useEffect, useRef, useState } from 'react';

interface Props {
  /** The path of the image to display */
  src: string;
  onLoad?: () => void;
}

/**
 * Display an image rotated by 90 degrees
 *
 * @param src The path of the image to display
 * @author Kerbourc'h
 */
const RotatedImage: React.FC<Props> = ({ src, onLoad }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [width, setWidth] = useState<number>(0);

  useEffect(() => {
    if (canvasRef.current === null) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (ctx === null) return;

    const image = new Image();
    image.src = src;

    image.onload = () => {
      canvas.width = image.height;
      canvas.height = image.width;
      setWidth(canvas.width);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((Math.PI / 180) * 90);
      ctx.drawImage(image, -image.width / 2, -image.height / 2);

      if (onLoad) onLoad();
    };
  }, [canvasRef, src]);

  return <canvas ref={canvasRef} style={{ width: width + 'px' }} />;
};

export default RotatedImage;
