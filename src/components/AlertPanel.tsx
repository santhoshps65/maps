import React, { useState } from 'react';
import { AlertTriangle, Clock, MapPin, ChevronDown, ChevronUp, Shield, TrendingUp } from 'lucide-react';
import { Alert } from '../types/weather';
import { formatDistanceToNow } from 'date-fns';

interface AlertPanelProps {
  alert: Alert;
}

export const AlertPanel: React.FC<AlertPanelProps> = ({ alert }) => {
  const [expanded, setExpanded] = useState(false);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'border-red-500 bg-red-50 text-red-800';
      case 'High': return 'border-orange-500 bg-orange-50 text-orange-800';
      case 'Moderate': return 'border-yellow-500 bg-yellow-50 text-yellow-800';
      default: return 'border-blue-500 bg-blue-50 text-blue-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'Critical': return '🚨';
      case 'High': return '⚠️';
      case 'Moderate': return '⚡';
      default: return 'ℹ️';
    }
  };

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'landslide': return '🏔️';
      case 'flash_flood': return '🌊';
      case 'severe_thunderstorm': return '⛈️';
      case 'temperature_extreme': return '🌡️';
      case 'high_wind': return '💨';
      case 'seismic_activity': return '🌍';
      default: return '🌤️';
    }
  };

  return (
    <div className={`border-l-4 ${getSeverityColor(alert.severity)} p-4 m-2 rounded-r-lg`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-xl">{getAlertTypeIcon(alert.type)}</span>
            <span className="text-lg">{getSeverityIcon(alert.severity)}</span>
            <h4 className="font-bold text-lg">{alert.title}</h4>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
              {alert.severity}
            </span>
          </div>
          
          <p className="text-gray-700 mb-2">{alert.description}</p>
          
          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4" />
              <span>{alert.location.city}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}</span>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <Shield className="w-4 h-4 text-green-600" />
              <span>Reliability: {Math.round(alert.reliabilityScore * 100)}%</span>
            </div>
            <div className="flex items-center space-x-1">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>Confidence: {Math.round(alert.confidenceLevel * 100)}%</span>
            </div>
          </div>
        </div>
        
        <button
          onClick={() => setExpanded(!expanded)}
          className="ml-4 p-1 hover:bg-gray-200 rounded-full transition-colors"
        >
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
          {/* Current Conditions */}
          <div>
            <h5 className="font-semibold text-gray-800 mb-2">Current Conditions</h5>
            <p className="text-sm text-gray-700 bg-gray-100 p-3 rounded-lg">
              {alert.currentConditions}
            </p>
          </div>

          {/* Forecast */}
          <div>
            <h5 className="font-semibold text-gray-800 mb-2">Forecast</h5>
            <p className="text-sm text-gray-700 bg-gray-100 p-3 rounded-lg">
              {alert.forecast}
            </p>
          </div>

          {/* Risks */}
          <div>
            <h5 className="font-semibold text-gray-800 mb-2">Potential Risks</h5>
            <ul className="text-sm text-gray-700 space-y-1">
              {alert.risks.map((risk, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recommendations */}
          <div>
            <h5 className="font-semibold text-gray-800 mb-2">Safety Recommendations</h5>
            <ul className="text-sm text-gray-700 space-y-1">
              {alert.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Technical Details */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <h5 className="font-semibold text-gray-800 mb-2">Technical Details</h5>
            <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
              <div>
                <span className="font-medium">Data Source:</span> {alert.dataSource}
              </div>
              <div>
                <span className="font-medium">Expires:</span> {new Date(alert.expiresAt).toLocaleString()}
              </div>
              <div>
                <span className="font-medium">Coordinates:</span> {alert.location.coordinates.lat.toFixed(4)}, {alert.location.coordinates.lng.toFixed(4)}
              </div>
              <div>
                <span className="font-medium">Alert ID:</span> {alert.id.slice(-8)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};