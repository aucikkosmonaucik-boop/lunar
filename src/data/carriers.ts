export interface Carrier {
  id: string; // "AN_POST_LETTER" | "AN_POST_REGISTERED" | "AN_POST" | "DPD_IE" | "GLS_IE"
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
    id: 'AN_POST_LETTER',
    name: 'An Post (Standard Letter / Envelope)',
    shortName: 'An Post Letter',
    tagline: 'Economy Padded Mailer',
    description: 'Economical standard post in a secure bubble-padded envelope. Ideal for rings, earrings, and lighter pieces.',
    estimatedDelivery: '2 – 3 Business Days',
    basePrice: 2.90,
    freeShippingAvailable: true,
    freeThreshold: 35,
    trackingPlaceholder: 'e.g. Standard Post or Receipt Ref',
    trackingRegexHint: 'An Post standard post reference',
    badgeColor: 'bg-[#00703C]/10 text-[#00703C] border-[#00703C]/30 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-500/50',
    getTrackingUrl: (trackingNumber: string) => {
      const clean = trackingNumber.trim().replace(/\s+/g, '');
      return `https://www.anpost.com/Post-Parcels/Track/History?item=${encodeURIComponent(clean)}`;
    },
  },
  {
    id: 'AN_POST_REGISTERED',
    name: 'An Post (Registered Post & Signature)',
    shortName: 'An Post Registered',
    tagline: 'Signature & Priority Tracking',
    description: 'Priority registered post with barcode tracking and mandatory recipient signature upon delivery throughout Ireland.',
    estimatedDelivery: '1 – 2 Business Days',
    basePrice: 5.50,
    freeShippingAvailable: true,
    freeThreshold: 50,
    trackingPlaceholder: 'e.g. RL123456789IE or 1198547382IE',
    trackingRegexHint: 'An Post Registered barcode (usually starts with RL or 9-13 digits)',
    badgeColor: 'bg-[#00703C]/10 text-[#00703C] border-[#00703C]/30 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-500/50',
    getTrackingUrl: (trackingNumber: string) => {
      const clean = trackingNumber.trim().replace(/\s+/g, '');
      return `https://www.anpost.com/Post-Parcels/Track/History?item=${encodeURIComponent(clean)}`;
    },
  },
  {
    id: 'AN_POST',
    name: 'An Post (Tracked Express Parcel)',
    shortName: 'An Post Parcel',
    tagline: 'Rigid Jewellery Box & Full Telemetry',
    description: 'National postal parcel service in a rigid luxury jewellery presentation box with live milestone telemetry across all 32 counties.',
    estimatedDelivery: '1 – 3 Business Days',
    basePrice: 6.50,
    freeShippingAvailable: true,
    freeThreshold: 50,
    trackingPlaceholder: 'e.g. 1198547382IE or CE123456789IE',
    trackingRegexHint: 'An Post barcode (e.g. 9-13 alphanumeric characters)',
    badgeColor: 'bg-[#00703C]/10 text-[#00703C] border-[#00703C]/30 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-500/50',
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
    badgeColor: 'bg-[#DC0032]/10 text-[#DC0032] border-[#DC0032]/30 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-500/50',
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
    badgeColor: 'bg-[#002B7F]/10 text-[#002B7F] border-[#002B7F]/30 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-500/50',
    getTrackingUrl: (trackingNumber: string) => {
      const clean = trackingNumber.trim().replace(/\s+/g, '');
      return `https://gls-group.eu/IE/en/track-trace?match=${encodeURIComponent(clean)}`;
    },
  },
];

export const DEFAULT_CARRIER_ID = 'AN_POST';

// Historical carrier lookup for past orders (UPS, FedEx)
const HISTORICAL_CARRIERS: Record<string, Partial<Carrier>> = {
  UPS: {
    id: 'UPS',
    name: 'UPS Express',
    shortName: 'UPS',
    getTrackingUrl: (clean: string) => `https://www.ups.com/track?tracknum=${encodeURIComponent(clean)}`,
  },
  FEDEX: {
    id: 'FEDEX',
    name: 'FedEx Priority',
    shortName: 'FedEx',
    getTrackingUrl: (clean: string) => `https://www.fedex.com/fedextrack/?trknbr=${encodeURIComponent(clean)}`,
  },
};

export function getCarrierById(id?: string | null): Carrier {
  if (!id) return CARRIERS[0];
  const found = CARRIERS.find(c => c.id.toUpperCase() === id.toUpperCase());
  if (found) return found;

  const historical = HISTORICAL_CARRIERS[id.toUpperCase()];
  if (historical) {
    return {
      ...CARRIERS[0],
      id: historical.id || id,
      name: historical.name || id,
      shortName: historical.shortName || id,
      getTrackingUrl: historical.getTrackingUrl || CARRIERS[0].getTrackingUrl,
    };
  }

  return CARRIERS[0];
}

export function generateTrackingUrl(carrierId: string | null | undefined, trackingNumber: string): string {
  if (!trackingNumber) return '';
  const carrier = getCarrierById(carrierId);
  return carrier.getTrackingUrl(trackingNumber);
}
