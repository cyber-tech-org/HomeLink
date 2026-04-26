import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { LocationSuggestion } from './location.types';

type GoogleAutocompletePrediction = {
  description: string;
  place_id: string;
};

type GoogleAutocompleteResponse = {
  status: string;
  error_message?: string;
  predictions?: GoogleAutocompletePrediction[];
};

type GoogleGeocodeResult = {
  formatted_address: string;
  geometry?: {
    location?: {
      lat?: number;
      lng?: number;
    };
  };
  address_components?: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
};

type GoogleGeocodeResponse = {
  status: string;
  error_message?: string;
  results?: GoogleGeocodeResult[];
};

@Injectable()
export class LocationSearchService {
  private readonly logger = new Logger(LocationSearchService.name);

  constructor(private readonly config: ConfigService) {}

  async search(query: string): Promise<LocationSuggestion[]> {
    const provider = this.config
      .get<string>('LOCATION_PROVIDER', 'nominatim')
      .toLowerCase();
    if (provider === 'google') {
      return this.searchWithGoogle(query);
    }
    return this.searchWithNominatim(query);
  }

  private async searchWithNominatim(query: string): Promise<LocationSuggestion[]> {
    const endpoint = this.config.get<string>(
      'LOCATION_SEARCH_API',
      'https://nominatim.openstreetmap.org/search',
    );
    const url = new URL(endpoint);
    url.search = new URLSearchParams({
      q: query,
      format: 'json',
      addressdetails: '1',
      limit: '8',
    }).toString();

    try {
      const response = await fetch(url.toString(), {
        headers: {
          'User-Agent': 'homelink-backend/1.0',
        },
      });
      if (!response.ok) {
        this.logger.warn(
          `Nominatim location search failed with status ${response.status}`,
        );
        return [];
      }
      const data = (await response.json()) as Array<{
        display_name: string;
        lat: string;
        lon: string;
        address?: { city?: string; town?: string; state?: string; country?: string };
      }>;

      return data.map((item) => ({
        address: item.display_name,
        city: item.address?.city ?? item.address?.town ?? null,
        state: item.address?.state ?? null,
        country: item.address?.country ?? null,
        latitude: Number(item.lat),
        longitude: Number(item.lon),
      }));
    } catch (error) {
      this.logger.warn(
        `Nominatim unavailable: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return [];
    }
  }

  private async searchWithGoogle(query: string): Promise<LocationSuggestion[]> {
    const apiKey = this.config.get<string>('GOOGLE_MAPS_API_KEY');
    if (!apiKey) {
      this.logger.warn(
        'GOOGLE_MAPS_API_KEY missing while LOCATION_PROVIDER=google',
      );
      return [];
    }

    const country = this.config.get<string>('GOOGLE_PLACES_COUNTRY', 'ng');
    const language = this.config.get<string>('GOOGLE_PLACES_LANGUAGE', 'en');
    const maxResults = this.config.get<string>('GOOGLE_PLACES_LIMIT', '8');

    const autocompleteUrl = new URL(
      'https://maps.googleapis.com/maps/api/place/autocomplete/json',
    );
    autocompleteUrl.search = new URLSearchParams({
      input: query,
      key: apiKey,
      language,
      components: `country:${country}`,
    }).toString();

    try {
      const autoRes = await fetch(autocompleteUrl.toString());
      if (!autoRes.ok) {
        this.logger.warn(
          `Google autocomplete request failed with status ${autoRes.status}`,
        );
        return [];
      }

      const autoData = (await autoRes.json()) as GoogleAutocompleteResponse;
      if (
        autoData.status !== 'OK' &&
        autoData.status !== 'ZERO_RESULTS'
      ) {
        this.logger.warn(
          `Google autocomplete error: ${autoData.status} ${autoData.error_message ?? ''}`.trim(),
        );
        return [];
      }

      const predictions = (autoData.predictions ?? []).slice(
        0,
        Number(maxResults),
      );
      if (!predictions.length) {
        return [];
      }

      const details = await Promise.all(
        predictions.map((item) => this.getGoogleGeocodeByPlaceId(item.place_id, apiKey, language)),
      );
      return details.filter((item): item is LocationSuggestion => item !== null);
    } catch (error) {
      this.logger.warn(
        `Google places unavailable: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return [];
    }
  }

  private async getGoogleGeocodeByPlaceId(
    placeId: string,
    apiKey: string,
    language: string,
  ): Promise<LocationSuggestion | null> {
    const geocodeUrl = new URL(
      'https://maps.googleapis.com/maps/api/geocode/json',
    );
    geocodeUrl.search = new URLSearchParams({
      place_id: placeId,
      key: apiKey,
      language,
    }).toString();

    const response = await fetch(geocodeUrl.toString());
    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as GoogleGeocodeResponse;
    if (data.status !== 'OK' || !data.results?.length) {
      return null;
    }

    const best = data.results[0];
    const city = this.getGoogleAddressComponent(best, ['locality', 'administrative_area_level_2']);
    const state = this.getGoogleAddressComponent(best, ['administrative_area_level_1']);
    const country = this.getGoogleAddressComponent(best, ['country']);
    const lat = best.geometry?.location?.lat;
    const lng = best.geometry?.location?.lng;
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return null;
    }

    return {
      address: best.formatted_address,
      city,
      state,
      country,
      latitude: lat,
      longitude: lng,
    };
  }

  private getGoogleAddressComponent(
    result: GoogleGeocodeResult,
    acceptedTypes: string[],
  ): string | null {
    const match = result.address_components?.find((component) =>
      component.types.some((type) => acceptedTypes.includes(type)),
    );
    return match?.long_name ?? null;
  }
}
