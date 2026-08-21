import 'package:intl/intl.dart';

class Formatters {
  static final NumberFormat _currencyFormat = NumberFormat.currency(
    locale: 'pl_PL',
    symbol: 'zł',
    decimalDigits: 2,
  );

  static final DateFormat _dateFormat = DateFormat('dd.MM.yyyy, HH:mm');
  static final DateFormat _shortDateFormat = DateFormat('dd MMM yyyy', 'pl');

  static String formatPrice(num? price) {
    if (price == null) return '0,00 zł';
    return _currencyFormat.format(price);
  }

  static String formatDate(DateTime? date) {
    if (date == null) return '-';
    return _dateFormat.format(date);
  }

  static String formatShortDate(DateTime? date) {
    if (date == null) return '-';
    try {
      return _shortDateFormat.format(date);
    } catch (_) {
      return '${date.day}.${date.month}.${date.year}';
    }
  }

  static String formatOrderStatus(String? status) {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'Oczekujące';
      case 'processing':
        return 'W realizacji';
      case 'paid':
        return 'Opłacone';
      case 'shipped':
        return 'Wysłane';
      case 'delivered':
        return 'Dostarczone';
      case 'cancelled':
        return 'Anulowane';
      default:
        return status ?? 'Nieznany';
    }
  }

  static String formatPaymentStatus(String? status) {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'Opłacono';
      case 'pending':
        return 'Oczekuje na wpłatę';
      case 'failed':
        return 'Płatność nieudana';
      case 'refunded':
        return 'Zwrócono';
      default:
        return status ?? '-';
    }
  }
}
