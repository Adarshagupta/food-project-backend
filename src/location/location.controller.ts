import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { LocationService } from './location.service';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';

@ApiTags('Location')
@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Get('directions')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get directions between two points' })
  @ApiResponse({ status: 200, description: 'Returns directions data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({ name: 'startLat', type: Number, description: 'Starting latitude' })
  @ApiQuery({ name: 'startLng', type: Number, description: 'Starting longitude' })
  @ApiQuery({ name: 'endLat', type: Number, description: 'Ending latitude' })
  @ApiQuery({ name: 'endLng', type: Number, description: 'Ending longitude' })
  async getDirections(
    @Query('startLat') startLat: number,
    @Query('startLng') startLng: number,
    @Query('endLat') endLat: number,
    @Query('endLng') endLng: number,
  ) {
    return this.locationService.getDirections(
      Number(startLat),
      Number(startLng),
      Number(endLat),
      Number(endLng),
    );
  }

  @Get('geocode')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Geocode an address to coordinates' })
  @ApiResponse({ status: 200, description: 'Returns geocoding data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({ name: 'address', type: String, description: 'Address to geocode' })
  async geocodeAddress(@Query('address') address: string) {
    return this.locationService.geocodeAddress(address);
  }

  @Get('eta')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Calculate estimated time of arrival' })
  @ApiResponse({ status: 200, description: 'Returns ETA data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({ name: 'startLat', type: Number, description: 'Starting latitude' })
  @ApiQuery({ name: 'startLng', type: Number, description: 'Starting longitude' })
  @ApiQuery({ name: 'endLat', type: Number, description: 'Ending latitude' })
  @ApiQuery({ name: 'endLng', type: Number, description: 'Ending longitude' })
  async calculateETA(
    @Query('startLat') startLat: number,
    @Query('startLng') startLng: number,
    @Query('endLat') endLat: number,
    @Query('endLng') endLng: number,
  ) {
    return this.locationService.calculateETA(
      Number(startLat),
      Number(startLng),
      Number(endLat),
      Number(endLng),
    );
  }

  @Get('static-map')
  @ApiOperation({ summary: 'Get static map image URL' })
  @ApiResponse({ status: 200, description: 'Returns static map URL' })
  @ApiQuery({ name: 'lat', type: Number, description: 'Latitude' })
  @ApiQuery({ name: 'lng', type: Number, description: 'Longitude' })
  @ApiQuery({ name: 'zoom', type: Number, description: 'Zoom level (0-22)', required: false })
  @ApiQuery({ name: 'width', type: Number, description: 'Image width in pixels', required: false })
  @ApiQuery({ name: 'height', type: Number, description: 'Image height in pixels', required: false })
  getStaticMapUrl(
    @Query('lat') lat: number,
    @Query('lng') lng: number,
    @Query('zoom') zoom = 15,
    @Query('width') width = 600,
    @Query('height') height = 400,
  ) {
    return {
      url: this.locationService.getStaticMapUrl(
        Number(lat),
        Number(lng),
        Number(zoom),
        Number(width),
        Number(height),
      ),
    };
  }

  @Get('static-map-marker')
  @ApiOperation({ summary: 'Get static map image URL with marker' })
  @ApiResponse({ status: 200, description: 'Returns static map URL with marker' })
  @ApiQuery({ name: 'lat', type: Number, description: 'Latitude' })
  @ApiQuery({ name: 'lng', type: Number, description: 'Longitude' })
  @ApiQuery({ name: 'zoom', type: Number, description: 'Zoom level (0-22)', required: false })
  @ApiQuery({ name: 'width', type: Number, description: 'Image width in pixels', required: false })
  @ApiQuery({ name: 'height', type: Number, description: 'Image height in pixels', required: false })
  getStaticMapWithMarkerUrl(
    @Query('lat') lat: number,
    @Query('lng') lng: number,
    @Query('zoom') zoom = 15,
    @Query('width') width = 600,
    @Query('height') height = 400,
  ) {
    return {
      url: this.locationService.getStaticMapWithMarkerUrl(
        Number(lat),
        Number(lng),
        Number(zoom),
        Number(width),
        Number(height),
      ),
    };
  }
}
