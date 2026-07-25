/**
 * @mysimcha/maps — Google Maps helpers contract.
 */

export type GeoCoordinates = {
  lat: number;
  lng: number;
};

export type PlaceSummary = {
  placeId: string;
  name: string;
  formattedAddress: string;
  location: GeoCoordinates;
};

export type MapsPublicConfig = {
  apiKey: string;
  mapId?: string;
};
