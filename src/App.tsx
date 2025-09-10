import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl, useMap } from 'react-leaflet';
import { MapPin, Layers, Cloud } from 'lucide-react';
import { LocationSearch } from './components/LocationSearch';
import { WeatherPanel } from './components/WeatherPanel';
import { WeatherStationMap } from './components/WeatherStationMap';
import { locationMarkers, createPulsingMarker } from './components/CustomMarkers';
import { MapControls } from './components/MapControls';
import { WeatherStation } from './types/weather';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function App() {
  const [mapCenter, setMapCenter] = useState<[number, number]>([20.5937, 78.9629]); // Center of India
  const [mapZoom, setMapZoom] = useState(5);
  const [mapRef, setMapRef] = useState<L.Map | null>(null);
  const [showLayerControl, setShowLayerControl] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    name: string;
    display_name?: string;
  } | null>(null);
  const [showWeatherPanel, setShowWeatherPanel] = useState(false);
  const [weatherStations] = useState<WeatherStation[]>([
    {
      id: 'ws_001',
      name: 'Mumbai Weather Station',
      coordinates: { lat: 19.0760, lng: 72.8777 },
      status: 'active',
      lastUpdate: new Date().toISOString(),
      sensors: {
        temperature: true,
        humidity: true,
        pressure: true,
        wind: true,
        precipitation: true,
        seismic: true
      }
    },
    {
      id: 'ws_002',
      name: 'Delhi Weather Observatory',
      coordinates: { lat: 28.7041, lng: 77.1025 },
      status: 'active',
      lastUpdate: new Date().toISOString(),
      sensors: {
        temperature: true,
        humidity: true,
        pressure: true,
        wind: true,
        precipitation: true,
        seismic: true
      }
    },
    {
      id: 'ws_003',
      name: 'Chennai Coastal Monitor',
      coordinates: { lat: 13.0827, lng: 80.2707 },
      status: 'maintenance',
      lastUpdate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      sensors: {
        temperature: true,
        humidity: true,
        pressure: false,
        wind: true,
        precipitation: true,
        seismic: false
      }
    },
    {
      id: 'ws_004',
      name: 'Shimla Hill Station Monitor',
      coordinates: { lat: 31.1048, lng: 77.1734 },
      status: 'active',
      lastUpdate: new Date().toISOString(),
      sensors: {
        temperature: true,
        humidity: true,
        pressure: true,
        wind: true,
        precipitation: true,
        seismic: true
      }
    },
    {
      id: 'ws_005',
      name: 'Kolkata Eastern Monitor',
      coordinates: { lat: 22.5726, lng: 88.3639 },
      status: 'active',
      lastUpdate: new Date().toISOString(),
      sensors: {
        temperature: true,
        humidity: true,
        pressure: true,
        wind: true,
        precipitation: true,
        seismic: false
      }
    },
    {
      id: 'ws_006',
      name: 'Bangalore Tech Hub Station',
      coordinates: { lat: 12.9716, lng: 77.5946 },
      status: 'active',
      lastUpdate: new Date().toISOString(),
      sensors: {
        temperature: true,
        humidity: true,
        pressure: true,
        wind: true,
        precipitation: true,
        seismic: false
      }
    }
  ]);

  const handleLocationSelect = (lat: number, lng: number, name: string) => {
    setMapCenter([lat, lng]);
    setMapZoom(13);
    setSelectedLocation({ lat, lng, name });
    setShowWeatherPanel(true);
  };

  const handleMarkerClick = (location: { lat: number; lng: number; name: string; display_name?: string }) => {
    setSelectedLocation(location);
    setShowWeatherPanel(true);
  };

  const handleStationClick = (station: WeatherStation) => {
    setSelectedLocation({
      lat: station.coordinates.lat,
      lng: station.coordinates.lng,
      name: station.name
    });
    setMapCenter([station.coordinates.lat, station.coordinates.lng]);
    setMapZoom(12);
    setShowWeatherPanel(true);
  };

  // Map control handlers
  const handleZoomIn = () => {
    if (mapRef) {
      mapRef.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapRef) {
      mapRef.zoomOut();
    }
  };

  const handleReset = () => {
    setMapCenter([20.5937, 78.9629]); // Center of India
    setMapZoom(5);
    setSelectedLocation(null);
  };

  const handleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  };

  const handleRecenter = () => {
    if (selectedLocation && mapRef) {
      mapRef.setView([selectedLocation.lat, selectedLocation.lng], 15);
    }
  };

  // Component to handle map reference
  const MapHandler = () => {
    const map = useMap();
    React.useEffect(() => {
      setMapRef(map);
    }, [map]);
    return null;
  };

  return (
    <div className="h-screen flex bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 bg-white/90 backdrop-blur-sm shadow-lg border-b border-gray-200 p-4 transition-all duration-300 z-[1000]">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-600 rounded-lg shadow-md">
              <Cloud className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              WeatherGuard
            </h1>
          </div>
          <div className="max-w-xs">
            <LocationSearch onLocationSelect={handleLocationSelect} />
          </div>
          <button
            onClick={() => setShowLayerControl(!showLayerControl)}
            className="p-3 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-blue-300"
            title="Map Layers"
          >
            <Layers className="w-6 h-6 text-gray-600 hover:text-blue-600" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 pt-20">
        {/* Weather Panel Sidebar */}
        <div className={`transition-all duration-300 ${showWeatherPanel ? 'w-96' : 'w-0'} overflow-hidden`}>
          <div className="h-full overflow-y-auto bg-gray-50/50">
            <WeatherPanel location={selectedLocation} />
          </div>
        </div>
        
        {/* Map */}
        <div className="flex-1 h-full relative overflow-hidden">
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            className="h-full w-full"
            key={`${mapCenter[0]}-${mapCenter[1]}-${mapZoom}`}
            zoomControl={false}
          >
            <MapHandler />
            <LayersControl position="topright" collapsed={!showLayerControl}>
              <LayersControl.BaseLayer checked name="OpenStreetMap">
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
              </LayersControl.BaseLayer>
              
              <LayersControl.BaseLayer name="Satellite (Esri)">
                <TileLayer
                  attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                />
              </LayersControl.BaseLayer>
              
              <LayersControl.BaseLayer name="Detailed Streets (CartoDB)">
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />
              </LayersControl.BaseLayer>
              
              <LayersControl.BaseLayer name="Terrain">
                <TileLayer
                  attribution='Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png"
                />
              </LayersControl.BaseLayer>
              
              <LayersControl.BaseLayer name="Dark Mode">
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
              </LayersControl.BaseLayer>
            </LayersControl>
            
            {/* Weather Stations */}
            <WeatherStationMap 
              stations={weatherStations}
              onStationClick={handleStationClick}
            />
            
            {selectedLocation && (
              <Marker 
                position={[selectedLocation.lat, selectedLocation.lng]}
                icon={selectedLocation.name.includes('Current Location') ? createPulsingMarker() : locationMarkers.search}
                eventHandlers={{
                  click: () => handleMarkerClick(selectedLocation)
                }}
              >
                <Popup>
                  <div className="text-sm p-2">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg">📍</span>
                      <strong className="text-gray-800">{selectedLocation.name}</strong>
                    </div>
                    <div className="text-xs text-gray-600">
                      📍 {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                    </div>
                    <button
                      onClick={() => handleMarkerClick(selectedLocation)}
                      className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors w-full"
                    >
                      View Weather & Alerts
                    </button>
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>
          
          {/* Custom Map Controls */}
          <MapControls
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onReset={handleReset}
            onFullscreen={handleFullscreen}
            onRecenter={handleRecenter}
          />
        </div>
      </div>
    </div>
  );
}

export default App;