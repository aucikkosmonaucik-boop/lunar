import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import '../constants/api_constants.dart';
import 'storage_service.dart';

class ApiException implements Exception {
  final String message;
  final int? statusCode;
  final dynamic data;

  ApiException(this.message, {this.statusCode, this.data});

  @override
  String toString() => message;
}

class ApiService {
  static final http.Client _client = http.Client();

  static String get baseUrl {
    final custom = StorageService.getCustomBaseUrl();
    if (custom != null && custom.trim().isNotEmpty) {
      return custom.trim();
    }
    return ApiConstants.baseUrl;
  }

  static Uri _buildUri(String path, [Map<String, dynamic>? queryParams]) {
    final cleanPath = path.startsWith('/') ? path : '/$path';
    final base = baseUrl.endsWith('/') ? baseUrl.substring(0, baseUrl.length - 1) : baseUrl;
    final url = '$base$cleanPath';
    
    if (queryParams != null && queryParams.isNotEmpty) {
      final stringParams = queryParams.map((k, v) => MapEntry(k, v.toString()));
      return Uri.parse(url).replace(queryParameters: stringParams);
    }
    return Uri.parse(url);
  }

  static Map<String, String> _getHeaders({Map<String, String>? extraHeaders}) {
    final headers = <String, String>{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    final token = StorageService.getToken();
    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
      headers['Cookie'] = 'auth_token=$token';
    }

    if (extraHeaders != null) {
      headers.addAll(extraHeaders);
    }
    return headers;
  }

  static dynamic _processResponse(http.Response response) {
    dynamic body;
    try {
      body = jsonDecode(utf8.decode(response.bodyBytes));
    } catch (_) {
      body = response.body;
    }

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return body;
    }

    String errorMessage = 'A network communication error occurred (${response.statusCode})';
    if (body is Map && body.containsKey('message')) {
      errorMessage = body['message'].toString();
    }

    throw ApiException(
      errorMessage,
      statusCode: response.statusCode,
      data: body,
    );
  }

  // GET
  static Future<dynamic> get(String path, {Map<String, dynamic>? queryParams, Map<String, String>? headers}) async {
    try {
      final uri = _buildUri(path, queryParams);
      final response = await _client.get(
        uri,
        headers: _getHeaders(extraHeaders: headers),
      ).timeout(const Duration(seconds: 15));

      return _processResponse(response);
    } on SocketException {
      throw ApiException('Unable to connect to the server. Please check your internet connection.');
    } on http.ClientException catch (e) {
      throw ApiException('Connection error: ${e.message}');
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Unexpected error: $e');
    }
  }

  // POST
  static Future<dynamic> post(String path, {dynamic body, Map<String, String>? headers}) async {
    try {
      final uri = _buildUri(path);
      final response = await _client.post(
        uri,
        headers: _getHeaders(extraHeaders: headers),
        body: body != null ? jsonEncode(body) : null,
      ).timeout(const Duration(seconds: 20));

      return _processResponse(response);
    } on SocketException {
      throw ApiException('Unable to connect to the server.');
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Unexpected error: $e');
    }
  }

  // PUT / PATCH
  static Future<dynamic> put(String path, {dynamic body, Map<String, String>? headers}) async {
    try {
      final uri = _buildUri(path);
      final response = await _client.put(
        uri,
        headers: _getHeaders(extraHeaders: headers),
        body: body != null ? jsonEncode(body) : null,
      ).timeout(const Duration(seconds: 20));

      return _processResponse(response);
    } on SocketException {
      throw ApiException('Unable to connect to the server.');
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Unexpected error: $e');
    }
  }

  // DELETE
  static Future<dynamic> delete(String path, {dynamic body, Map<String, String>? headers}) async {
    try {
      final uri = _buildUri(path);
      final response = await _client.delete(
        uri,
        headers: _getHeaders(extraHeaders: headers),
        body: body != null ? jsonEncode(body) : null,
      ).timeout(const Duration(seconds: 20));

      return _processResponse(response);
    } on SocketException {
      throw ApiException('Unable to connect to the server.');
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Unexpected error: $e');
    }
  }
}
