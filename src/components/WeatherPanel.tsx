import React, { useState, useEffect } from 'react';
import { Cloud, Thermometer, Droplets, Wind, Eye, Sun, AlertTriangle, RefreshCw } from 'lucide-react';
import { WeatherData, Alert } from '../types/weather';
import { weatherService } from '../services/weatherService';
import { AlertPanel } from './AlertPanel';

interface WeatherPanelProps {
  location: {
    lat: number;
    lng: number;
    name: string;
  } | null;
}

export const WeatherPanel: React.FC<WeatherPanelProps> = ({ location }) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    if (location) {
      fetchWeatherData();
      const interval = setInterval(fetchWeatherData, 5 * 60 * 1000); // Update every 5 minutes
      return () => clearInterval(interval);
    }
  }, [location]);

  const fetchWeatherData = async () => {
    if (!location) return;
    
    setLoading(true);
    try {
      const [weather, generatedAlerts] = await Promise.all([
        weatherService.getWeatherData(location.lat, location.lng),
        weatherService.generateAlerts(location.lat, location.lng, location.name)
      ]);
      
      setWeatherData(weather);
      setAlerts(generatedAlerts);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching weather data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'text-red-600 bg-red-100';
      case 'High': return 'text-orange-600 bg-orange-100';
      case 'Moderate': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  if (!location) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 m-4">
        <div className="text-center text-gray-500">
          <Cloud className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Select a location to view weather data and alerts</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 m-4">
      {/* Active Alerts */}
      {alerts.length > 0 && (
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-bold">Active Alerts ({alerts.length})</h3>
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {alerts.map((alert) => (
              <AlertPanel key={alert.id} alert={alert} />
            ))}
          </div>
        </div>
      )}

      {/* Weather Data */}
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">{location.name}</h3>
              <p className="text-blue-100 text-sm">Weather Conditions</p>
            </div>
            <button
              onClick={fetchWeatherData}
              disabled={loading}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {loading && !weatherData ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        ) : weatherData ? (
          <div className="p-6">
            {/* Current Conditions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-3xl mb-2">{weatherData.current.icon}</div>
                <div className="text-2xl font-bold text-gray-800">
                  {Math.round(weatherData.current.temperature)}°C
                </div>
                <div className="text-sm text-gray-600">{weatherData.current.condition}</div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Droplets className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="font-semibold">{weatherData.current.humidity}%</div>
                  <div className="text-xs text-gray-600">Humidity</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Wind className="w-5 h-5 text-gray-500" />
                <div>
                  <div className="font-semibold">{Math.round(weatherData.current.windSpeed)} km/h</div>
                  <div className="text-xs text-gray-600">Wind Speed</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Cloud className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="font-semibold">{Math.round(weatherData.current.pressure)} hPa</div>
                  <div className="text-xs text-gray-600">Pressure</div>
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center space-x-2">
                <Droplets className="w-4 h-4 text-blue-400" />
                <span className="text-sm">Precipitation: {weatherData.current.precipitation}mm/hr</span>
              </div>
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-gray-400" />
                <span className="text-sm">Visibility: {weatherData.current.visibility}km</span>
              </div>
              <div className="flex items-center space-x-2">
                <Sun className="w-4 h-4 text-yellow-400" />
                <span className="text-sm">UV Index: {Math.round(weatherData.current.uvIndex)}</span>
              </div>
            </div>

            {/* 5-Day Forecast */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">5-Day Forecast</h4>
              <div className="grid grid-cols-5 gap-2">
                {weatherData.forecast.map((day, index) => (
                  <div key={index} className="text-center p-2 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-600 mb-1">
                      {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                    </div>
                    <div className="text-lg mb-1">
                      {day.condition === 'Rainy' ? '🌧️' : '☀️'}
                    </div>
                    <div className="text-sm font-semibold">{Math.round(day.high)}°</div>
                    <div className="text-xs text-gray-500">{Math.round(day.low)}°</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Last Update */}
            {lastUpdate && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Last updated: {lastUpdate.toLocaleTimeString()}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            <Cloud className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Unable to load weather data</p>
          </div>
        )}
      </div>
    </div>
  );
};