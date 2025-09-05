import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { Icon } from 'leaflet';
import { MapPin, Navigation, Search, Plus, Minus } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MarkerData {
  id: number;
  position: [number, number];
  title: string;
  description: string;
}

function MapEvents({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function App() {
  const [markers, setMarkers] = useState<MarkerData[]>([
    {
      id: 1,
      position: [40.7128, -74.0060],
      title: "New York City",
      description: "The Big Apple - A bustling metropolis"
    },
    {
      id: 2,
      position: [34.0522, -118.2437],
      title: "Los Angeles",
      description: "City of Angels - Entertainment capital"
    },
    {
      id: 3,
      position: [41.8781, -87.6298],
      title: "Chicago",
      description: "The Windy City - Architecture and deep dish"
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [mapCenter, setMapCenter] = useState<[number, number]>([39.8283, -98.5795]);
  const [mapZoom, setMapZoom] = useState(4);

  const handleMapClick = (lat: number, lng: number) => {
    const newMarker: MarkerData = {
      id: Date.now(),
      position: [lat, lng],
      title: `Location ${markers.length + 1}`,
      description: `Custom marker at ${lat.toFixed(4)}, ${lng.toFixed(4)}`
    };
    setMarkers([...markers, newMarker]);
  };

  const handleSearch = () => {
    const foundMarker = markers.find(marker => 
      marker.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    if (foundMarker) {
      setMapCenter(foundMarker.position);
      setMapZoom(10);
    }
  };

  const handleDeleteMarker = (id: number) => {
    setMarkers(markers.filter(marker => marker.id !== id));
  };

  const handleCenterMap = () => {
    setMapCenter([39.8283, -98.5795]);
    setMapZoom(4);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <MapPin className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800">Interactive Map</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Search locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <button
                onClick={handleSearch}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
            
            <button
              onClick={handleCenterMap}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Navigation className="w-5 h-5" />
              <span>Center Map</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-80 bg-white shadow-lg border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Locations ({markers.length})</h2>
            <p className="text-sm text-gray-600 mb-4">Click on the map to add new markers</p>
            
            <div className="space-y-3">
              {markers.map((marker) => (
                <div key={marker.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800">{marker.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{marker.description}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {marker.position[0].toFixed(4)}, {marker.position[1].toFixed(4)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteMarker(marker.id)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      setMapCenter(marker.position);
                      setMapZoom(12);
                    }}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Go to location →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            className="h-full w-full"
            key={`${mapCenter[0]}-${mapCenter[1]}-${mapZoom}`}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <MapEvents onMapClick={handleMapClick} />
            
            {markers.map((marker) => (
              <Marker key={marker.id} position={marker.position}>
                <Popup>
                  <div className="p-2">
                    <h3 className="font-semibold text-gray-800">{marker.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{marker.description}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Coordinates: {marker.position[0].toFixed(4)}, {marker.position[1].toFixed(4)}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
          
          {/* Map Instructions */}
          <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-lg border border-gray-200 max-w-xs">
            <h3 className="font-medium text-gray-800 mb-2">How to use:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Click anywhere on the map to add markers</li>
              <li>• Use the search bar to find locations</li>
              <li>• Click on markers to see details</li>
              <li>• Use sidebar to navigate to locations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;