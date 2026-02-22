class AppException implements Exception {
  final String message;
  final int? statusCode;

  AppException(this.message, [this.statusCode]);

  @override
  String toString() => message;
}

class NetworkException extends AppException {
  NetworkException(super.message, [super.statusCode]);
}

class UnauthorizedException extends AppException {
  UnauthorizedException(super.message, [super.statusCode]);
}

class ServerException extends AppException {
  ServerException(super.message, [super.statusCode]);
}