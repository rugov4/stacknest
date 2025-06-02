'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface ImageEditorProps {
  imageUrl: string;
  onSave: (editedImageUrl: string) => void;
}

interface TextOverlay {
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  isDragging: boolean;
}

interface DrawingPoint {
  x: number;
  y: number;
}

export default function ImageEditor({ imageUrl, onSave }: ImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [selectedOverlay, setSelectedOverlay] = useState<number | null>(null);
  const [newText, setNewText] = useState('');
  const [fontSize, setFontSize] = useState(48);
  const [textColor, setTextColor] = useState('#ffffff');
  const [scale, setScale] = useState(1);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingColor, setDrawingColor] = useState('#ff0000');
  const [drawingWidth, setDrawingWidth] = useState(5);
  const [mode, setMode] = useState<'text' | 'draw'>('text');
  const lastPoint = useRef<DrawingPoint | null>(null);

  const drawTextOverlays = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;

    img.onload = () => {
      // Clear canvas and draw image
      ctx.drawImage(img, 0, 0);

      // Draw all text overlays
      textOverlays.forEach((overlay, index) => {
        ctx.font = `${overlay.fontSize}px Arial`;
        ctx.fillStyle = overlay.color;
        ctx.fillText(overlay.text, overlay.x, overlay.y);

        // Draw selection box if selected
        if (index === selectedOverlay) {
          const metrics = ctx.measureText(overlay.text);
          ctx.strokeStyle = '#00ff00';
          ctx.lineWidth = 2;
          ctx.strokeRect(
            overlay.x - 5,
            overlay.y - overlay.fontSize,
            metrics.width + 10,
            overlay.fontSize + 10
          );
        }
      });
    };
  }, [imageUrl, textOverlays, selectedOverlay]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;

    img.onload = () => {
      // Calculate scale to fit the canvas in the container
      const containerWidth = canvas.parentElement?.clientWidth || img.width;
      const scale = containerWidth / img.width;
      setScale(scale);

      // Set canvas size to original image dimensions
      canvas.width = img.width;
      canvas.height = img.height;

      // Set display size
      canvas.style.width = `${img.width * scale}px`;
      canvas.style.height = `${img.height * scale}px`;

      // Draw image
      ctx.drawImage(img, 0, 0);
      
      // Draw text overlays
      drawTextOverlays();
    };
  }, [imageUrl, drawTextOverlays]);

  const getCanvasCoordinates = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) / scale;
    const y = (clientY - rect.top) / scale;
    return { x, y };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (mode !== 'draw') return;
    
    const { x, y } = getCanvasCoordinates(e.clientX, e.clientY);
    setIsDrawing(true);
    lastPoint.current = { x, y };

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = drawingColor;
    ctx.lineWidth = drawingWidth;
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || mode !== 'draw' || !lastPoint.current) return;

    const { x, y } = getCanvasCoordinates(e.clientX, e.clientY);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.lineTo(x, y);
    ctx.strokeStyle = drawingColor;
    ctx.lineWidth = drawingWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    lastPoint.current = { x, y };
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    lastPoint.current = null;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (mode === 'draw') {
      startDrawing(e);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const { x, y } = getCanvasCoordinates(e.clientX, e.clientY);

    // Check if click is on any text overlay
    textOverlays.forEach((overlay, index) => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.font = `${overlay.fontSize}px Arial`;
      const metrics = ctx.measureText(overlay.text);
      
      if (
        x >= overlay.x - 5 &&
        x <= overlay.x + metrics.width + 5 &&
        y >= overlay.y - overlay.fontSize - 5 &&
        y <= overlay.y + 5
      ) {
        setSelectedOverlay(index);
        const newOverlays = [...textOverlays];
        newOverlays[index].isDragging = true;
        setTextOverlays(newOverlays);
      }
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (mode === 'draw') {
      draw(e);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const { x, y } = getCanvasCoordinates(e.clientX, e.clientY);

    const draggingIndex = textOverlays.findIndex(overlay => overlay.isDragging);
    if (draggingIndex !== -1) {
      const newOverlays = [...textOverlays];
      newOverlays[draggingIndex].x = x;
      newOverlays[draggingIndex].y = y;
      setTextOverlays(newOverlays);
      drawTextOverlays();
    }
  };

  const handleMouseUp = () => {
    if (mode === 'draw') {
      stopDrawing();
      return;
    }

    const newOverlays = textOverlays.map(overlay => ({
      ...overlay,
      isDragging: false,
    }));
    setTextOverlays(newOverlays);
  };

  const addTextOverlay = () => {
    if (!newText) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const newOverlay: TextOverlay = {
      text: newText,
      x: canvas.width / 2,
      y: canvas.height / 2,
      fontSize,
      color: textColor,
      isDragging: false,
    };

    setTextOverlays([...textOverlays, newOverlay]);
    setNewText('');
    drawTextOverlays();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      addTextOverlay();
    }
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Convert canvas to data URL
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-4 mb-4">
        <button
          onClick={() => setMode('text')}
          className={`px-4 py-2 rounded ${
            mode === 'text' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Text Mode
        </button>
        <button
          onClick={() => setMode('draw')}
          className={`px-4 py-2 rounded ${
            mode === 'draw' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Draw Mode
        </button>
      </div>

      <div className="relative border rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="max-w-full cursor-crosshair"
        />
      </div>

      {mode === 'text' ? (
        <div className="space-y-4">
          <div className="flex space-x-4">
            <input
              type="text"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter text and press Enter or click Add Text..."
              className="flex-1 p-2 border rounded"
            />
            <input
              type="number"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              min="12"
              max="120"
              className="w-20 p-2 border rounded"
            />
            <input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="p-1 border rounded"
            />
            <button
              onClick={addTextOverlay}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add Text
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex space-x-4">
            <input
              type="color"
              value={drawingColor}
              onChange={(e) => setDrawingColor(e.target.value)}
              className="p-1 border rounded"
            />
            <input
              type="range"
              min="1"
              max="20"
              value={drawingWidth}
              onChange={(e) => setDrawingWidth(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm text-gray-600">
              Brush Size: {drawingWidth}
            </span>
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={() => {
            setTextOverlays([]);
            drawTextOverlays();
          }}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Clear All
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
} 