import 'package:intl/intl.dart';

class Formatters {
  static final NumberFormat _currencyFormat = NumberFormat.currency(
    locale: 'en_IE',
    symbol: '€',
    decimalDigits: 2,
  );

  static final DateFormat _dateFormat = DateFormat('dd MMM yyyy, HH:mm', 'en');
  static final DateFormat _shortDateFormat = DateFormat('dd MMM yyyy', 'en');

  static String formatPrice(num? price) {
    if (price == null) return '€0.00';
    return _currencyFormat.format(price);
  }

  static String formatDate(DateTime? date) {
    if (date == null) return '-';
    try {
      return _dateFormat.format(date);
    } catch (_) {
      return '${date.day}/${date.month}/${date.year}';
    }
  }

  static String formatShortDate(DateTime? date) {
    if (date == null) return '-';
    try {
      return _shortDateFormat.format(date);
    } catch (_) {
      return '${date.day}/${date.month}/${date.year}';
    }
  }

  static String formatOrderStatus(String? status) {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'Pending';
      case 'processing':
        return 'Processing';
      case 'paid':
        return 'Paid';
      case 'shipped':
        return 'Shipped';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status ?? 'Unknown';
    }
  }

  static String formatPaymentStatus(String? status) {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'Paid';
      case 'pending':
        return 'Pending Payment';
      case 'failed':
        return 'Payment Failed';
      case 'refunded':
        return 'Refunded';
      default:
        return status ?? '-';
    }
  }
}
