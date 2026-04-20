import 'package:dio/dio.dart';

import '../../../../core/network/dio_client.dart';
import '../models/user_model.dart';

class AuthRemoteSource {
  final Dio _dio = DioClient.instance;

  Future<AuthResponse> login(String email, String password) async {
    final response = await _dio.post('/auth/login', data: {
      'email': email,
      'password': password,
    });

    return _parseAuthResponse(response);
  }

  Future<AuthResponse> register(String email, String password) async {
    final response = await _dio.post('/auth/register', data: {
      'email': email,
      'password': password,
    });

    return _parseAuthResponse(response);
  }

  Future<Response> logout() async {
    return await _dio.post('/logout');
  }

  Future<Response> me() async {
    return await _dio.get('/me');
  }

  AuthResponse _parseAuthResponse(Response response) {
    final responseData = response.data;

    if (responseData is Map<String, dynamic>) {
      final data = responseData['data'];

      if (data is Map<String, dynamic>) {
        return AuthResponse.fromJson(data);
      }
    }

    throw const FormatException('Unexpected authentication response format');
  }
}
