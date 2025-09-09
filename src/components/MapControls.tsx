import React from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Maximize, Navigation } from 'lucide-react';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onFullscreen: () => void;
  onRecenter: () => void;
}

export const MapControls: React.FC<MapControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onReset,
  onFullscreen,
  onRecenter
}) => {
  return (
    <div className="absolute right-4 top-20 z-[1000] flex flex-col space-y-2">
      {/* Zoom In */}
      <button
        onClick={onZoomIn}
        className="p-3 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200 hover:border-blue-300 group"
        title="Zoom In"
      >
        <ZoomIn className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
      </button>

      {/* Zoom Out */}
      <button
        onClick={onZoomOut}
        className="p-3 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200 hover:border-blue-300 group"
        title="Zoom Out"
      >
        <ZoomOut className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
      </button>

      {/* Reset View */}
      <button
        onClick={onReset}
        className="p-3 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200 hover:border-blue-300 group"
        title="Reset View"
      >
        <RotateCcw className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
      </button>

      {/* Fullscreen */}
      <button
        onClick={onFullscreen}
        className="p-3 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200 hover:border-blue-300 group"
        title="Fullscreen"
      >
        <Maximize className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
      </button>

      {/* Recenter */}
      <button
        onClick={onRecenter}
        className="p-3 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200 hover:border-blue-300 group"
        title="Recenter Map"
      >
        <Navigation className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
      </button>
    </div>
  );
};