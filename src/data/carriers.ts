export interface Carrier {
  id: string; // "AN_POST" | "DPD_IE" | "GLS_IE" | "UPS" | "FEDEX"
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  estimatedDelivery: string;
  basePrice: number;
  freeShippingAvailable: boolean;
  freeThreshold: number;
  trackingPlaceholder: string;
  trackingRegexHint: string;
  badgeColor: string;
  getTrackingUrl: (trackingNumber: string) => string;
}

export const CARRIERS: Carrier[] = [
  {
    id: 'AN_POST',
    name: 'An Post (Ireland)',
    shortName: 'An Post',
    tagline: 'Standard & Express Postal Service',
    description: 'National postal service with reliable coverage across all 32 counties and international connections.',
    estimatedDelivery: '1 – 3 Business Days',
    basePrice: 6.50,
    freeShippingAvailable: true,
    freeThreshold: 50,
    trackingPlaceholder: 'e.g. 1198547382IE or CE123456789IE',
    trackingRegexHint: 'An Post barcode (e.g. 9-13 alphanumeric characters)',
    badgeColor: 'bg-[#00703C]/10 text-[#00703C] border-[#00703C]/30',
    getTrackingUrl: (trackingNumber: string) => {
      const clean = trackingNumber.trim().replace(/\s+/g, '');
      return `https://www.anpost.com/Post-Parcels/Track/History?item=${encodeURIComponent(clean)}`;
    },
  },
  {
    id: 'DPD_IE',
    name: 'DPD Ireland',
    shortName: 'DPD Ireland',
    tagline: 'Predict 1-Hour Delivery Window & Live Map',
    description: 'Premium express delivery with real-time driver tracking and 1-hour delivery time slot SMS/Email notification.',
    estimatedDelivery: '1 – 2 Business Days',
    basePrice: 8.50,
    freeShippingAvailable: true,
    freeThreshold: 80,
    trackingPlaceholder: 'e.g. 08123456789012 or 15501234567890',
    trackingRegexHint: 'DPD parcel number (usually 14 digits)',
    badgeColor: 'bg-[#DC0032]/10 text-[#DC0032] border-[#DC0032]/30',
    getTrackingUrl: (trackingNumber: string) => {
      const clean = trackingNumber.trim().replace(/\s+/g, '');
      return `https://dpd.ie/tracking?parcelnumber=${encodeURIComponent(clean)}`;
    },
  },
  {
    id: 'GLS_IE',
    name: 'GLS Ireland',
    shortName: 'GLS Ireland',
    tagline: 'High Security & European Network',
    description: 'Specialised tracked parcel logistics throughout Ireland and Europe with secure signature upon delivery.',
    estimatedDelivery: '1 – 3 Business Days',
    basePrice: 7.50,
    freeShippingAvailable: true,
    freeThreshold: 75,
    trackingPlaceholder: 'e.g. 23908172641 or 12345678',
    trackingRegexHint: 'GLS parcel number or Track ID',
    badgeColor: 'bg-[#002B7F]/10 text-[#002B7F] border-[#002B7F]/30',
    getTrackingUrl: (trackingNumber: string) => {
      const clean = trackingNumber.trim().replace(/\s+/g, '');
      return `https://gls-group.eu/IE/en/track-trace?match=${encodeURIComponent(clean)}`;
    },
  },
  {
    id: 'UPS',
    name: 'UPS Express',
    shortName: 'UPS',
    tagline: 'Time-Definite Insured Luxury Courier',
    description: 'Global express freight with maximum insurance coverage, ideal for high-value jewellery pieces.',
    estimatedDelivery: '1 – 2 Business Days',
    basePrice: 12.00,
    freeShippingAvailable: false,
    freeThreshold: 150,
    trackingPlaceholder: 'e.g. 1Z9999999999999999',
    trackingRegexHint: 'UPS tracking (starts with 1Z, 18 characters)',
    badgeColor: 'bg-[#351C15]/10 text-[#59341C] border-[#59341C]/30',
    getTrackingUrl: (trackingNumber: string) => {
      const clean = trackingNumber.trim().replace(/\s+/g, '');
      return `https://www.ups.com/track?tracknum=${encodeURIComponent(clean)}`;
    },
  },
  {
    id: 'FEDEX',
    name: 'FedEx Priority',
    shortName: 'FedEx',
    tagline: 'Worldwide Priority & Direct Signature',
    description: 'Ultra-fast direct air courier service with strict direct signature verification and full real-time milestone telemetry.',
    estimatedDelivery: '1 – 2 Business Days',
    basePrice: 14.00,
    freeShippingAvailable: false,
    freeThreshold: 180,
    trackingPlaceholder: 'e.g. 794823901234 or 123456789012',
    trackingRegexHint: 'FedEx tracking number (12 or 15 digits)',
    badgeColor: 'bg-[#4D148C]/10 text-[#4D148C] border-[#4D148C]/30',
    getTrackingUrl: (trackingNumber: string) => {
      const clean = trackingNumber.trim().replace(/\s+/g, '');
      return `https://www.fedex.com/fedextrack/?trknbr=${encodeURIComponent(clean)}`;
    },
  },
];

export const DEFAULT_CARRIER_ID = 'AN_POST';

export function getCarrierById(id?: string | null): Carrier {
  if (!id) return CARRIERS[0];
  const found = CARRIERS.find(c => c.id.toUpperCase() === id.toUpperCase());
  return found || CARRIERS[0];
}

export function generateTrackingUrl(carrierId: string | null | undefined, trackingNumber: string): string {
  if (!trackingNumber) return '';
  const carrier = getCarrierById(carrierId);
  return carrier.getTrackingUrl(trackingNumber);
}
