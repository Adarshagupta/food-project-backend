import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class LocationService {
  private readonly mapboxApiKey: string;
  private readonly mapboxBaseUrl = 'https://api.mapbox.com';

  constructor(private configService: ConfigService) {
    this.mapboxApiKey = this.configService.get<string>('MAPBOX_API_KEY');
  }

  /**
   * Get directions between two points
   * @param startLat Starting latitude
   * @param startLng Starting longitude
   * @param endLat Ending latitude
   * @param endLng Ending longitude
   * @returns Directions data from Mapbox
   */
  async getDirections(startLat: number, startLng: number, endLat: number, endLng: number) {
    try {
      const response = await axios.get(
        `${this.mapboxBaseUrl}/directions/v5/mapbox/driving/${startLng},${startLat};${endLng},${endLat}`,
        {
          params: {
            access_token: this.mapboxApiKey,
            geometries: 'geojson',
            overview: 'full',
            steps: true,
          },
        },
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get directions: ${error.message}`);
    }
  }

  /**
   * Geocode an address to coordinates
   * @param address Address to geocode
   * @returns Geocoding data from Mapbox
   */
  async geocodeAddress(address: string) {
    try {
      const encodedAddress = encodeURIComponent(address);
      const response = await axios.get(
        `${this.mapboxBaseUrl}/geocoding/v5/mapbox.places/${encodedAddress}.json`,
        {
          params: {
            access_token: this.mapboxApiKey,
            limit: 1,
          },
        },
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to geocode address: ${error.message}`);
    }
  }

  /**
   * Calculate the estimated time of arrival
   * @param startLat Starting latitude
   * @param startLng Starting longitude
   * @param endLat Ending latitude
   * @param endLng Ending longitude
   * @returns Estimated time of arrival in seconds
   */
  async calculateETA(startLat: number, startLng: number, endLat: number, endLng: number) {
    try {
      const directions = await this.getDirections(startLat, startLng, endLat, endLng);
      const route = directions.routes[0];
      return {
        duration: route.duration, // in seconds
        distance: route.distance, // in meters
        eta: new Date(Date.now() + route.duration * 1000), // ETA as Date object
      };
    } catch (error) {
      throw new Error(`Failed to calculate ETA: ${error.message}`);
    }
  }

  /**
   * Get static map image URL
   * @param lat Latitude
   * @param lng Longitude
   * @param zoom Zoom level (0-22)
   * @param width Image width in pixels
   * @param height Image height in pixels
   * @returns URL for static map image
   */
  getStaticMapUrl(lat: number, lng: number, zoom = 15, width = 600, height = 400) {
    return `${this.mapboxBaseUrl}/styles/v1/mapbox/streets-v11/static/${lng},${lat},${zoom},0/${width}x${height}?access_token=${this.mapboxApiKey}`;
  }

  /**
   * Get static map image URL with a marker
   * @param lat Latitude
   * @param lng Longitude
   * @param zoom Zoom level (0-22)
   * @param width Image width in pixels
   * @param height Image height in pixels
   * @returns URL for static map image with marker
   */
  getStaticMapWithMarkerUrl(lat: number, lng: number, zoom = 15, width = 600, height = 400) {
    return `${this.mapboxBaseUrl}/styles/v1/mapbox/streets-v11/static/pin-s+ff0000(${lng},${lat})/${lng},${lat},${zoom},0/${width}x${height}?access_token=${this.mapboxApiKey}`;
  }

  /**
   * Get static map image URL with a route
   * @param coordinates Array of [longitude, latitude] coordinates
   * @param width Image width in pixels
   * @param height Image height in pixels
   * @returns URL for static map image with route
   */
  getStaticMapWithRouteUrl(coordinates: [number, number][], width = 600, height = 400) {
    const encodedCoordinates = encodeURIComponent(
      `path-5+0066ff-0.5(${coordinates.map(coord => coord.join(',')).join(';')})`,
    );
    
    // Calculate center and zoom automatically
    return `${this.mapboxBaseUrl}/styles/v1/mapbox/streets-v11/static/${encodedCoordinates}/auto/${width}x${height}?access_token=${this.mapboxApiKey}`;
  }
}
