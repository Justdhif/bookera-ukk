import 'dart:convert';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../models/user_model.dart';

class AuthSessionService {
  static const String _tokenKey = 'auth_token';
  static const String _userKey = 'auth_user';

  final FlutterSecureStorage _storage;

  const AuthSessionService({FlutterSecureStorage? storage})
      : _storage = storage ?? const FlutterSecureStorage();

  Future<void> save(AuthResponse authResponse) async {
    await _storage.write(key: _tokenKey, value: authResponse.token);
    await _storage.write(key: _userKey, value: jsonEncode(authResponse.user.toJson()));
  }

  Future<String?> readToken() {
    return _storage.read(key: _tokenKey);
  }

  Future<User?> readUser() async {
    final rawUser = await _storage.read(key: _userKey);

    if (rawUser == null || rawUser.isEmpty) {
      return null;
    }

    final decoded = jsonDecode(rawUser);

    if (decoded is Map<String, dynamic>) {
      return User.fromJson(decoded);
    }

    if (decoded is Map) {
      return User.fromJson(Map<String, dynamic>.from(decoded));
    }

    return null;
  }

  Future<void> clear() async {
    await Future.wait([
      _storage.delete(key: _tokenKey),
      _storage.delete(key: _userKey),
    ]);
  }
}