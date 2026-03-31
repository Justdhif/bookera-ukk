import 'package:dio/dio.dart';
import '../config/app_config.dart';
import 'interceptors.dart';

class DioClient {
  static final AuthInterceptor _authInterceptor = AuthInterceptor();

  static final Dio instance = Dio(
    BaseOptions(
      baseUrl: AppConfig.baseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
    ),
  )
    ..interceptors.add(_authInterceptor)
    ..interceptors.add(LoggingInterceptor());

  static void setToken(String token) {
    _authInterceptor.setToken(token);
  }

  static void clearToken() {
    _authInterceptor.clearToken();
  }
}