class CarrierModel {
  final String id;
  final String name;
  final String shortName;
  final String tagline;
  final String description;
  final String estimatedDelivery;
  final double basePrice;
  final bool freeShippingAvailable;
  final double freeThreshold;
  final String trackingPlaceholder;

  const CarrierModel({
    required this.id,
    required this.name,
    required this.shortName,
    required this.tagline,
    required this.description,
    required this.estimatedDelivery,
    required this.basePrice,
    required this.freeShippingAvailable,
    required this.freeThreshold,
    required this.trackingPlaceholder,
  });

  String getTrackingUrl(String trackingNumber) {
    final clean = trackingNumber.trim().replaceAll(RegExp(r'\s+'), '');
    switch (id.toUpperCase()) {
      case 'AN_POST':
        return 'https://www.anpost.com/Post-Parcels/Track/History?item=${Uri.encodeComponent(clean)}';
      case 'DPD_IE':
        return 'https://dpd.ie/tracking?parcelnumber=${Uri.encodeComponent(clean)}';
      case 'GLS_IE':
        return 'https://gls-group.eu/IE/en/track-trace?match=${Uri.encodeComponent(clean)}';
      case 'UPS':
        return 'https://www.ups.com/track?tracknum=${Uri.encodeComponent(clean)}';
      case 'FEDEX':
        return 'https://www.fedex.com/fedextrack/?trknbr=${Uri.encodeComponent(clean)}';
      default:
        return 'https://www.anpost.com/Post-Parcels/Track/History?item=${Uri.encodeComponent(clean)}';
    }
  }
}

const List<CarrierModel> kCarriers = [
  CarrierModel(
    id: 'AN_POST',
    name: 'An Post (Ireland)',
    shortName: 'An Post',
    tagline: 'Standard & Express Post',
    description: 'National postal service across all 32 counties and international connections.',
    estimatedDelivery: '1 – 3 Business Days',
    basePrice: 6.50,
    freeShippingAvailable: true,
    freeThreshold: 50.0,
    trackingPlaceholder: 'e.g. 1198547382IE',
  ),
  CarrierModel(
    id: 'DPD_IE',
    name: 'DPD Ireland',
    shortName: 'DPD Ireland',
    tagline: 'Predict 1-Hour Delivery Window',
    description: 'Express delivery with 1-hour delivery time slot SMS/Email notification.',
    estimatedDelivery: '1 – 2 Business Days',
    basePrice: 8.50,
    freeShippingAvailable: true,
    freeThreshold: 80.0,
    trackingPlaceholder: 'e.g. 08123456789012',
  ),
  CarrierModel(
    id: 'GLS_IE',
    name: 'GLS Ireland',
    shortName: 'GLS Ireland',
    tagline: 'High Security & European Network',
    description: 'Tracked parcel delivery with secure signature verification upon delivery.',
    estimatedDelivery: '1 – 3 Business Days',
    basePrice: 7.50,
    freeShippingAvailable: true,
    freeThreshold: 75.0,
    trackingPlaceholder: 'e.g. 23908172641',
  ),
  CarrierModel(
    id: 'UPS',
    name: 'UPS Express',
    shortName: 'UPS',
    tagline: 'Insured Luxury Express Courier',
    description: 'Global express freight with maximum insurance for high-value jewellery.',
    estimatedDelivery: '1 – 2 Business Days',
    basePrice: 12.00,
    freeShippingAvailable: false,
    freeThreshold: 150.0,
    trackingPlaceholder: 'e.g. 1Z9999999999999999',
  ),
  CarrierModel(
    id: 'FEDEX',
    name: 'FedEx Priority',
    shortName: 'FedEx',
    tagline: 'Worldwide Priority Air Delivery',
    description: 'Ultra-fast direct air courier with direct signature verification.',
    estimatedDelivery: '1 – 2 Business Days',
    basePrice: 14.00,
    freeShippingAvailable: false,
    freeThreshold: 180.0,
    trackingPlaceholder: 'e.g. 794823901234',
  ),
];

CarrierModel getCarrierById(String? id) {
  if (id == null) return kCarriers.first;
  return kCarriers.firstWhere(
    (c) => c.id.toUpperCase() == id.toUpperCase(),
    orElse: () => kCarriers.first,
  );
}
