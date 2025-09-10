import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import { WeatherStation } from '../types/weather';
import L from 'leaflet';

interface WeatherStationMapProps {
  stations: WeatherStation[];
  onStationClick?: (station: WeatherStation) => void;
}

// Create weather station marker
const createWeatherStationMarker = (status: 'active' | 'inactive' | 'maintenance') => {
  const colors = {
    active: '#10B981',
    inactive: '#EF4444',
    maintenance: '#F59E0B'
  };
  
  const icons = {
    active: '🌡️',
    inactive: '❌',
    maintenance: '🔧'
  };

  return L.divIcon({
    html: `
      <div style="
        background: linear-gradient(135deg, ${colors[status]}, ${colors[status]}dd);
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
      ">
        ${icons[status]}
      </div>
    `,
    className: 'weather-station-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

export const WeatherStationMap: React.FC<WeatherStationMapProps> = ({ 
  stations, 
  onStationClick 
}) => {
  return (
    <>
      {stations.map((station) => (
        <Marker
          key={station.id}
          position={[station.coordinates.lat, station.coordinates.lng]}
          icon={createWeatherStationMarker(station.status)}
          eventHandlers={{
            click: () => onStationClick?.(station)
          }}
        >
          <Popup>
            <div className="p-2 min-w-48">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-gray-800">{station.name}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  station.status === 'active' ? 'bg-green-100 text-green-800' :
                  station.status === 'inactive' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {station.status}
                </span>
              </div>
              
              <div className="text-sm text-gray-600 mb-3">
                📍 {station.coordinates.lat.toFixed(4)}, {station.coordinates.lng.toFixed(4)}
              </div>
              
              <div className="mb-3">
                <h5 className="font-medium text-gray-700 mb-1">Available Sensors:</h5>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  {Object.entries(station.sensors).map(([sensor, available]) => (
                    <div key={sensor} className={`flex items-center space-x-1 ${
                      available ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      <span>{available ? '✓' : '✗'}</span>
                      <span className="capitalize">{sensor.replace('_', ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="text-xs text-gray-500">
                Last update: {new Date(station.lastUpdate).toLocaleString()}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
};