import axios from 'axios';
import { WeatherData, GeologicalData, Alert, AlertType, AlertSeverity } from '../types/weather';

// Indian states and major cities data
const INDIAN_LOCATIONS = {
  'Maharashtra': { region: 'Western India', cities: ['Mumbai', 'Pune', 'Nagpur', 'Nashik'] },
  'Karnataka': { region: 'Southern India', cities: ['Bangalore', 'Mysore', 'Mangalore', 'Hubli'] },
  'Tamil Nadu': { region: 'Southern India', cities: ['Chennai', 'Coimbatore', 'Madurai', 'Salem'] },
  'Kerala': { region: 'Southern India', cities: ['Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur'] },
  'West Bengal': { region: 'Eastern India', cities: ['Kolkata', 'Siliguri', 'Durgapur', 'Asansol'] },
  'Rajasthan': { region: 'Northern India', cities: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota'] },
  'Gujarat': { region: 'Western India', cities: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot'] },
  'Uttar Pradesh': { region: 'Northern India', cities: ['Lucknow', 'Kanpur', 'Agra', 'Varanasi'] },
  'Madhya Pradesh': { region: 'Central India', cities: ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur'] },
  'Himachal Pradesh': { region: 'Northern India', cities: ['Shimla', 'Manali', 'Dharamshala', 'Kullu'] },
  'Uttarakhand': { region: 'Northern India', cities: ['Dehradun', 'Haridwar', 'Nainital', 'Rishikesh'] },
  'Assam': { region: 'North-Eastern India', cities: ['Guwahati', 'Dibrugarh', 'Silchar', 'Tezpur'] }
};

// Monsoon and seasonal patterns for India
const MONSOON_MONTHS = [6, 7, 8, 9]; // June to September
const WINTER_MONTHS = [12, 1, 2]; // December to February
const SUMMER_MONTHS = [3, 4, 5]; // March to May

class WeatherService {
  private readonly API_KEY = 'demo_key'; // In production, use IMD API key
  private readonly BASE_URL = 'https://api.openweathermap.org/data/2.5';
  private readonly IMD_API = 'https://mausam.imd.gov.in/api'; // Indian Meteorological Department
  private readonly GSI_API = 'https://www.gsi.gov.in/api'; // Geological Survey of India
  
  private alertCache = new Map<string, Alert>();
  private dataCache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  async getWeatherData(lat: number, lng: number): Promise<WeatherData> {
    const cacheKey = `weather_${lat}_${lng}`;
    const cached = this.dataCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      // Generate India-specific weather data
      const weatherData = this.generateIndianWeatherData(lat, lng);
      
      this.dataCache.set(cacheKey, {
        data: weatherData,
        timestamp: Date.now()
      });
      
      return weatherData;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw new Error('Failed to fetch weather data');
    }
  }

  async getGeologicalData(lat: number, lng: number): Promise<GeologicalData> {
    const cacheKey = `geological_${lat}_${lng}`;
    const cached = this.dataCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      // Generate India-specific geological data
      const geologicalData = this.generateIndianGeologicalData(lat, lng);
      
      this.dataCache.set(cacheKey, {
        data: geologicalData,
        timestamp: Date.now()
      });
      
      return geologicalData;
    } catch (error) {
      console.error('Error fetching geological data:', error);
      throw new Error('Failed to fetch geological data');
    }
  }

  async generateAlerts(lat: number, lng: number, locationName: string): Promise<Alert[]> {
    const weatherData = await this.getWeatherData(lat, lng);
    const geologicalData = await this.getGeologicalData(lat, lng);
    
    const alerts: Alert[] = [];
    
    // Landslide risk assessment
    const landslideRisk = this.assessLandslideRisk(weatherData, geologicalData);
    if (landslideRisk.severity !== 'Low') {
      alerts.push(this.createLandslideAlert(landslideRisk, weatherData, geologicalData, locationName));
    }
    
    // Severe weather alerts
    const weatherAlerts = this.assessWeatherHazards(weatherData, locationName);
    alerts.push(...weatherAlerts);
    
    // Cache alerts
    alerts.forEach(alert => {
      this.alertCache.set(alert.id, alert);
    });
    
    return alerts;
  }

  private assessLandslideRisk(weather: WeatherData, geological: GeologicalData) {
    let riskScore = 0;
    
    // Rainfall factor (40% weight)
    if (weather.current.precipitation > 50) riskScore += 40;
    else if (weather.current.precipitation > 25) riskScore += 25;
    else if (weather.current.precipitation > 10) riskScore += 15;
    
    // Soil moisture factor (30% weight)
    if (geological.soilMoisture > 80) riskScore += 30;
    else if (geological.soilMoisture > 60) riskScore += 20;
    else if (geological.soilMoisture > 40) riskScore += 10;
    
    // Slope angle factor (20% weight)
    if (geological.slopeAngle > 30) riskScore += 20;
    else if (geological.slopeAngle > 20) riskScore += 15;
    else if (geological.slopeAngle > 15) riskScore += 10;
    
    // Seismic activity factor (10% weight)
    if (geological.seismicActivity > 3.0) riskScore += 10;
    else if (geological.seismicActivity > 2.0) riskScore += 5;
    
    let severity: AlertSeverity = 'Low';
    if (riskScore >= 80) severity = 'Critical';
    else if (riskScore >= 60) severity = 'High';
    else if (riskScore >= 40) severity = 'Moderate';
    
    return { severity, score: riskScore };
  }

  private assessWeatherHazards(weather: WeatherData, locationName: string): Alert[] {
    const alerts: Alert[] = [];
    
    // Temperature extremes
    if (weather.current.temperature > 40 || weather.current.temperature < -20) {
      alerts.push(this.createTemperatureAlert(weather, locationName));
    }
    
    // High wind advisory
    if (weather.current.windSpeed > 25) {
      alerts.push(this.createWindAlert(weather, locationName));
    }
    
    // Heavy precipitation
    if (weather.current.precipitation > 25) {
      alerts.push(this.createFloodAlert(weather, locationName));
    }
    
    return alerts;
  }

  private createLandslideAlert(risk: { severity: AlertSeverity; score: number }, weather: WeatherData, geological: GeologicalData, locationName: string): Alert {
    return {
      id: `landslide_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'landslide',
      severity: risk.severity,
      location: {
        city: locationName,
        region: weather.location.region,
        coordinates: weather.location.coordinates
      },
      title: `Landslide ${risk.severity} Risk Alert`,
      description: `Elevated landslide risk detected due to combination of heavy rainfall, high soil moisture, and terrain conditions.`,
      currentConditions: `Current rainfall: ${weather.current.precipitation}mm/hr, Soil moisture: ${geological.soilMoisture}%, Slope angle: ${geological.slopeAngle}°`,
      forecast: `Continued precipitation expected. Risk may increase over next 6-12 hours.`,
      risks: [
        'Potential slope failure and debris flow',
        'Road closures and transportation disruption',
        'Property damage in vulnerable areas',
        'Risk to life in high-risk zones'
      ],
      recommendations: [
        'Avoid travel in mountainous or hilly areas',
        'Stay away from steep slopes and cliff areas',
        'Monitor local emergency broadcasts',
        'Have evacuation plan ready if in risk zone',
        'Report any signs of ground movement to authorities'
      ],
      timestamp: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
      dataSource: 'Integrated Weather & Geological Monitoring',
      reliabilityScore: 0.85,
      confidenceLevel: 0.78
    };
  }

  private createTemperatureAlert(weather: WeatherData, locationName: string): Alert {
    const isHot = weather.current.temperature > 40;
    return {
      id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'temperature_extreme',
      severity: isHot ? 'High' : 'Moderate',
      location: {
        city: locationName,
        region: weather.location.region,
        coordinates: weather.location.coordinates
      },
      title: `Extreme ${isHot ? 'Heat' : 'Cold'} Warning`,
      description: `Dangerous ${isHot ? 'high' : 'low'} temperatures pose health risks.`,
      currentConditions: `Current temperature: ${weather.current.temperature}°C, Feels like: ${weather.current.temperature + (isHot ? 5 : -5)}°C`,
      forecast: `${isHot ? 'Hot' : 'Cold'} conditions expected to continue for next 24-48 hours.`,
      risks: isHot ? [
        'Heat exhaustion and heat stroke',
        'Dehydration',
        'Increased fire risk',
        'Power grid strain'
      ] : [
        'Hypothermia and frostbite',
        'Frozen pipes',
        'Transportation hazards',
        'Increased heating costs'
      ],
      recommendations: isHot ? [
        'Stay indoors during peak hours',
        'Drink plenty of water',
        'Wear light, loose clothing',
        'Check on elderly neighbors'
      ] : [
        'Dress in layers',
        'Limit outdoor exposure',
        'Keep heating systems maintained',
        'Protect pipes from freezing'
      ],
      timestamp: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      dataSource: 'OpenWeatherMap API',
      reliabilityScore: 0.92,
      confidenceLevel: 0.88
    };
  }

  private createWindAlert(weather: WeatherData, locationName: string): Alert {
    return {
      id: `wind_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'high_wind',
      severity: weather.current.windSpeed > 35 ? 'High' : 'Moderate',
      location: {
        city: locationName,
        region: weather.location.region,
        coordinates: weather.location.coordinates
      },
      title: 'High Wind Advisory',
      description: 'Strong winds may cause hazardous conditions.',
      currentConditions: `Wind speed: ${weather.current.windSpeed} km/h, Direction: ${weather.current.windDirection}°`,
      forecast: 'Winds expected to remain strong for next 6-12 hours.',
      risks: [
        'Downed trees and power lines',
        'Property damage',
        'Difficult driving conditions',
        'Flying debris hazard'
      ],
      recommendations: [
        'Secure loose outdoor items',
        'Avoid driving high-profile vehicles',
        'Stay away from trees and power lines',
        'Postpone outdoor activities'
      ],
      timestamp: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
      dataSource: 'Weather Station Network',
      reliabilityScore: 0.89,
      confidenceLevel: 0.82
    };
  }

  private createFloodAlert(weather: WeatherData, locationName: string): Alert {
    return {
      id: `flood_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'flash_flood',
      severity: weather.current.precipitation > 50 ? 'Critical' : 'High',
      location: {
        city: locationName,
        region: weather.location.region,
        coordinates: weather.location.coordinates
      },
      title: 'Flash Flood Warning',
      description: 'Heavy rainfall may cause rapid flooding in low-lying areas.',
      currentConditions: `Rainfall rate: ${weather.current.precipitation}mm/hr, Accumulated: ${weather.current.precipitation * 2}mm`,
      forecast: 'Heavy rain expected to continue for next 2-4 hours.',
      risks: [
        'Rapid water rise in streams and roads',
        'Vehicle entrapment',
        'Property flooding',
        'Life-threatening conditions'
      ],
      recommendations: [
        'Avoid driving through flooded roads',
        'Move to higher ground if necessary',
        'Stay informed via emergency broadcasts',
        'Do not walk in moving water'
      ],
      timestamp: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
      dataSource: 'Precipitation Radar Network',
      reliabilityScore: 0.91,
      confidenceLevel: 0.85
    };
  }

  private generateIndianWeatherData(lat: number, lng: number): WeatherData {
    const currentMonth = new Date().getMonth() + 1;
    const { state, city, region } = this.getIndianLocationInfo(lat, lng);
    
    // India-specific temperature patterns
    let baseTemp = 25; // Base temperature for India
    let precipitation = 0;
    let humidity = 60;
    let condition = 'Clear';
    let icon = '☀️';
    
    // Seasonal adjustments for India
    if (MONSOON_MONTHS.includes(currentMonth)) {
      // Monsoon season
      precipitation = 15 + Math.random() * 85; // Heavy rainfall during monsoon
      humidity = 75 + Math.random() * 20;
      baseTemp = 26 + Math.random() * 8; // Moderate temperatures
      condition = precipitation > 25 ? 'Heavy Rain' : precipitation > 10 ? 'Moderate Rain' : 'Light Rain';
      icon = precipitation > 25 ? '🌧️' : precipitation > 10 ? '🌦️' : '🌤️';
    } else if (SUMMER_MONTHS.includes(currentMonth)) {
      // Summer season
      precipitation = Math.random() * 5; // Very low rainfall
      humidity = 40 + Math.random() * 25;
      baseTemp = 35 + Math.random() * 12; // High temperatures (35-47°C)
      condition = baseTemp > 42 ? 'Extreme Heat' : baseTemp > 38 ? 'Very Hot' : 'Hot';
      icon = baseTemp > 42 ? '🔥' : '☀️';
    } else if (WINTER_MONTHS.includes(currentMonth)) {
      // Winter season
      precipitation = Math.random() * 8; // Low rainfall
      humidity = 50 + Math.random() * 30;
      baseTemp = 15 + Math.random() * 15; // Cooler temperatures (15-30°C)
      condition = baseTemp < 18 ? 'Cool' : 'Pleasant';
      icon = baseTemp < 18 ? '🌤️' : '☀️';
    } else {
      // Pre-monsoon/Post-monsoon
      precipitation = Math.random() * 15;
      humidity = 55 + Math.random() * 25;
      baseTemp = 28 + Math.random() * 10;
      condition = precipitation > 5 ? 'Partly Cloudy' : 'Clear';
      icon = precipitation > 5 ? '⛅' : '☀️';
    }
    
    // Regional adjustments
    if (lat > 30) {
      // Northern India (Himalayas, Punjab, etc.)
      baseTemp -= 5;
      if (WINTER_MONTHS.includes(currentMonth)) {
        baseTemp -= 8; // Much colder winters in north
      }
    } else if (lat < 15) {
      // Southern India (Tamil Nadu, Kerala, etc.)
      baseTemp += 2;
      humidity += 10; // More humid in south
    }
    
    // Coastal adjustments
    if (this.isCoastalArea(lat, lng)) {
      humidity += 15;
      baseTemp -= 2; // Coastal areas are slightly cooler
    }
    
    // Hill station adjustments
    if (this.isHillStation(lat, lng)) {
      baseTemp -= 10;
      precipitation += 5;
      condition = 'Pleasant';
      icon = '🌤️';
    }
    
    return {
      location: {
        city: city,
        region: region,
        country: 'India',
        coordinates: { lat, lng }
      },
      current: {
        temperature: Math.round(baseTemp * 10) / 10,
        humidity: Math.round(humidity),
        pressure: 1008 + Math.random() * 20, // Typical for India
        windSpeed: Math.random() * 25 + 5, // Indian wind patterns
        windDirection: Math.random() * 360,
        precipitation: Math.round(precipitation * 10) / 10,
        visibility: MONSOON_MONTHS.includes(currentMonth) ? 3 + Math.random() * 7 : 8 + Math.random() * 7,
        uvIndex: Math.random() * 11,
        condition: condition,
        icon: icon
      },
      forecast: Array.from({ length: 5 }, (_, i) => ({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        high: baseTemp + Math.random() * 5,
        low: baseTemp - Math.random() * 8,
        condition: MONSOON_MONTHS.includes(currentMonth) && Math.random() > 0.4 ? 'Rainy' : condition,
        precipitation: MONSOON_MONTHS.includes(currentMonth) ? Math.random() * 40 : Math.random() * 10,
        windSpeed: Math.random() * 20 + 5
      })),
      lastUpdated: new Date().toISOString()
    };
  }

  private generateIndianGeologicalData(lat: number, lng: number): GeologicalData {
    const { state, region } = this.getIndianLocationInfo(lat, lng);
    const currentMonth = new Date().getMonth() + 1;
    
    let soilMoisture = 30;
    let slopeAngle = 5;
    let recentRainfall = 0;
    let seismicActivity = 0.5;
    let terrainStability = 85;
    
    // Monsoon impact on soil moisture and rainfall
    if (MONSOON_MONTHS.includes(currentMonth)) {
      soilMoisture = 60 + Math.random() * 35; // High during monsoon
      recentRainfall = 50 + Math.random() * 150; // Heavy monsoon rainfall
    } else {
      soilMoisture = 20 + Math.random() * 40;
      recentRainfall = Math.random() * 30;
    }
    
    // Regional geological characteristics
    if (this.isHimalayanRegion(lat, lng)) {
      // Himalayan region - high landslide risk
      slopeAngle = 25 + Math.random() * 20; // Steep slopes
      seismicActivity = 1.5 + Math.random() * 2.5; // Higher seismic activity
      terrainStability = 50 + Math.random() * 30; // Less stable terrain
    } else if (this.isWesternGhats(lat, lng)) {
      // Western Ghats - moderate landslide risk
      slopeAngle = 15 + Math.random() * 15;
      seismicActivity = 0.5 + Math.random() * 1.5;
      terrainStability = 60 + Math.random() * 25;
    } else if (this.isDeccanPlateau(lat, lng)) {
      // Deccan Plateau - stable terrain
      slopeAngle = 2 + Math.random() * 8;
      seismicActivity = 0.2 + Math.random() * 0.8;
      terrainStability = 75 + Math.random() * 20;
    } else if (this.isGangticPlain(lat, lng)) {
      // Gangetic Plains - very stable, flood-prone
      slopeAngle = 0.5 + Math.random() * 3;
      seismicActivity = 0.1 + Math.random() * 0.5;
      terrainStability = 85 + Math.random() * 15;
      soilMoisture += 15; // Higher moisture retention
    }
    
    return {
      location: { lat, lng, region: region },
      soilMoisture: Math.round(soilMoisture),
      slopeAngle: Math.round(slopeAngle * 10) / 10,
      recentRainfall: Math.round(recentRainfall * 10) / 10,
      seismicActivity: Math.round(seismicActivity * 10) / 10,
      terrainStability: Math.round(terrainStability),
      lastUpdated: new Date().toISOString()
    };
  }
  
  private getIndianLocationInfo(lat: number, lng: number): { state: string; city: string; region: string } {
    // Determine Indian state and city based on coordinates
    if (lat >= 28 && lat <= 37 && lng >= 74 && lng <= 80) {
      return { state: 'Himachal Pradesh', city: 'Shimla', region: 'Northern India' };
    } else if (lat >= 28 && lat <= 31 && lng >= 75 && lng <= 78) {
      return { state: 'Rajasthan', city: 'Jaipur', region: 'Northern India' };
    } else if (lat >= 18 && lat <= 20 && lng >= 72 && lng <= 75) {
      return { state: 'Maharashtra', city: 'Mumbai', region: 'Western India' };
    } else if (lat >= 12 && lat <= 16 && lng >= 74 && lng <= 78) {
      return { state: 'Karnataka', city: 'Bangalore', region: 'Southern India' };
    } else if (lat >= 8 && lat <= 12 && lng >= 76 && lng <= 78) {
      return { state: 'Tamil Nadu', city: 'Chennai', region: 'Southern India' };
    } else if (lat >= 8 && lat <= 12 && lng >= 74 && lng <= 77) {
      return { state: 'Kerala', city: 'Kochi', region: 'Southern India' };
    } else if (lat >= 22 && lat <= 27 && lng >= 87 && lng <= 89) {
      return { state: 'West Bengal', city: 'Kolkata', region: 'Eastern India' };
    } else if (lat >= 21 && lat <= 24 && lng >= 68 && lng <= 74) {
      return { state: 'Gujarat', city: 'Ahmedabad', region: 'Western India' };
    } else if (lat >= 24 && lat <= 28 && lng >= 77 && lng <= 84) {
      return { state: 'Uttar Pradesh', city: 'Lucknow', region: 'Northern India' };
    } else if (lat >= 21 && lat <= 26 && lng >= 74 && lng <= 82) {
      return { state: 'Madhya Pradesh', city: 'Bhopal', region: 'Central India' };
    } else if (lat >= 29 && lat <= 31 && lng >= 77 && lng <= 81) {
      return { state: 'Uttarakhand', city: 'Dehradun', region: 'Northern India' };
    } else if (lat >= 24 && lat <= 28 && lng >= 89 && lng <= 96) {
      return { state: 'Assam', city: 'Guwahati', region: 'North-Eastern India' };
    } else {
      // Default fallback
      return { state: 'Maharashtra', city: 'Mumbai', region: 'Western India' };
    }
  }
  
  private isCoastalArea(lat: number, lng: number): boolean {
    // Check if location is near Indian coastline
    return (
      (lng <= 73 && lat >= 8 && lat <= 23) || // Western coast
      (lng >= 79 && lat >= 8 && lat <= 20) || // Eastern coast
      (lat <= 10) // Southern tip
    );
  }
  
  private isHillStation(lat: number, lng: number): boolean {
    // Check if location is a hill station
    return (
      (lat >= 30 && lng >= 76 && lng <= 80) || // Himachal Pradesh hills
      (lat >= 29 && lat <= 31 && lng >= 78 && lng <= 80) || // Uttarakhand hills
      (lat >= 11 && lat <= 12 && lng >= 76 && lng <= 77) || // Nilgiri hills
      (lat >= 15 && lat <= 16 && lng >= 73 && lng <= 74) // Western Ghats hills
    );
  }
  
  private isHimalayanRegion(lat: number, lng: number): boolean {
    return lat >= 28 && lng >= 74 && lng <= 95;
  }
  
  private isWesternGhats(lat: number, lng: number): boolean {
    return lat >= 8 && lat <= 21 && lng >= 73 && lng <= 77;
  }
  
  private isDeccanPlateau(lat: number, lng: number): boolean {
    return lat >= 12 && lat <= 24 && lng >= 74 && lng <= 84;
  }
  
  private isGangticPlain(lat: number, lng: number): boolean {
    return lat >= 24 && lat <= 30 && lng >= 77 && lng <= 88;
  }

  getActiveAlerts(): Alert[] {
    const now = new Date();
    return Array.from(this.alertCache.values()).filter(
      alert => new Date(alert.expiresAt) > now
    );
  }

  clearExpiredAlerts(): void {
    const now = new Date();
    for (const [key, alert] of this.alertCache.entries()) {
      if (new Date(alert.expiresAt) <= now) {
        this.alertCache.delete(key);
      }
    }
  }
}

export const weatherService = new WeatherService();