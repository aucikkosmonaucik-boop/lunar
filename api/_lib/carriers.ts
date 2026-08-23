export interface CarrierInfo {
  id: string;
  name: string;
  shortName: string;
  estimatedDelivery: string;
  getTrackingUrl: (trackingNumber: string) => string;
}

export const BACKEND_CARRIERS: Record<string, CarrierInfo> = {
  AN_POST: {
    id: 'AN_POST',
    name: 'An Post (Ireland)',
    shortName: 'An Post',
    estimatedDelivery: '1 – 3 Business Days',
    getTrackingUrl: (num: string) => `https://www.anpost.com/Post-Parcels/Track/History?item=${encodeURIComponent(num.trim().replace(/\s+/g, ''))}`,
  },
  DPD_IE: {
    id: 'DPD_IE',
    name: 'DPD Ireland',
    shortName: 'DPD Ireland',
    estimatedDelivery: '1 – 2 Business Days',
    getTrackingUrl: (num: string) => `https://dpd.ie/tracking?parcelnumber=${encodeURIComponent(num.trim().replace(/\s+/g, ''))}`,
  },
  GLS_IE: {
    id: 'GLS_IE',
    name: 'GLS Ireland',
    shortName: 'GLS Ireland',
    estimatedDelivery: '1 – 3 Business Days',
    getTrackingUrl: (num: string) => `https://gls-group.eu/IE/en/track-trace?match=${encodeURIComponent(num.trim().replace(/\s+/g, ''))}`,
  },
  UPS: {
    id: 'UPS',
    name: 'UPS Express',
    shortName: 'UPS',
    estimatedDelivery: '1 – 2 Business Days',
    getTrackingUrl: (num: string) => `https://www.ups.com/track?tracknum=${encodeURIComponent(num.trim().replace(/\s+/g, ''))}`,
  },
  FEDEX: {
    id: 'FEDEX',
    name: 'FedEx Priority',
    shortName: 'FedEx',
    estimatedDelivery: '1 – 2 Business Days',
    getTrackingUrl: (num: string) => `https://www.fedex.com/fedextrack/?trknbr=${encodeURIComponent(num.trim().replace(/\s+/g, ''))}`,
  },
};

export function getBackendCarrier(carrierId?: string | null): CarrierInfo {
  if (!carrierId) return BACKEND_CARRIERS.AN_POST;
  const key = carrierId.toUpperCase();
  return BACKEND_CARRIERS[key] || BACKEND_CARRIERS.AN_POST;
}

export function buildTrackingUrl(carrierId: string | null | undefined, trackingNumber: string): string {
  if (!trackingNumber) return '';
  const carrier = getBackendCarrier(carrierId);
  return carrier.getTrackingUrl(trackingNumber);
}
