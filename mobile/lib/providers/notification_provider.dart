import 'package:flutter/foundation.dart';
import '../core/constants/api_constants.dart';
import '../core/services/api_service.dart';
import '../models/notification_model.dart';

class NotificationProvider extends ChangeNotifier {
  List<NotificationModel> _notifications = [];
  int _unreadCount = 0;
  bool _isLoading = false;
  String? _errorMessage;

  List<NotificationModel> get notifications => _notifications;
  int get unreadCount => _unreadCount;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<void> fetchNotifications({bool silent = false}) async {
    if (!silent) {
      _isLoading = true;
      _errorMessage = null;
      notifyListeners();
    }

    try {
      final res = await ApiService.get(ApiConstants.notifications);
      if (res is Map) {
        if (res['notifications'] is List) {
          _notifications = (res['notifications'] as List)
              .map((n) => NotificationModel.fromJson(n as Map<String, dynamic>))
              .toList();
        }
        _unreadCount = (res['unreadCount'] as num?)?.toInt() ?? 0;
      }
    } catch (e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> markAsRead(String id) async {
    try {
      // Optimistic update
      final index = _notifications.indexWhere((n) => n.id == id);
      if (index != -1 && !_notifications[index].isRead) {
        _notifications[index].isRead = true;
        _unreadCount = (_unreadCount - 1).clamp(0, 9999);
        notifyListeners();
      }

      await ApiService.post(
        ApiConstants.notificationsMarkRead,
        body: {'id': id},
      );
    } catch (e) {
      debugPrint('Failed to mark notification as read: $e');
    }
  }

  Future<void> markAllAsRead() async {
    try {
      // Optimistic update
      for (final n in _notifications) {
        n.isRead = true;
      }
      _unreadCount = 0;
      notifyListeners();

      await ApiService.post(
        ApiConstants.notificationsMarkAllRead,
        body: {'all': true},
      );
    } catch (e) {
      debugPrint('Failed to mark all notifications as read: $e');
    }
  }
}
