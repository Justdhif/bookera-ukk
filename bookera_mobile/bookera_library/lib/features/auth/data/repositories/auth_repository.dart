import '../../../../core/network/dio_client.dart';
import '../models/user_model.dart';
import '../services/auth_session_service.dart';
import '../sources/auth_remote_source.dart';

class AuthRepository {
  final AuthRemoteSource _remoteSource;
  final AuthSessionService _sessionService;

  AuthRepository({
    AuthRemoteSource? remoteSource,
    AuthSessionService? sessionService,
  })  : _remoteSource = remoteSource ?? AuthRemoteSource(),
        _sessionService = sessionService ?? const AuthSessionService();

  Future<AuthResponse> login(String email, String password) async {
    final authResponse = await _remoteSource.login(email, password);
    await _sessionService.save(authResponse);
    DioClient.setToken(authResponse.token);
    return authResponse;
  }

  Future<AuthResponse> register(String email, String password) async {
    final authResponse = await _remoteSource.register(email, password);
    await _sessionService.save(authResponse);
    DioClient.setToken(authResponse.token);
    return authResponse;
  }

  Future<void> restoreSession() async {
    final token = await _sessionService.readToken();

    if (token != null && token.isNotEmpty) {
      DioClient.setToken(token);
    }
  }

  Future<void> logout() async {
    await _sessionService.clear();
    DioClient.clearToken();
  }
}