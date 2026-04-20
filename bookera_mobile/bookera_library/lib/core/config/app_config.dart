import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class AppConfig {
  static String get baseUrl {
    const fallbackDesktopBaseUrl = 'http://127.0.0.1:8000/api';
    const fallbackAndroidBaseUrl = 'http://10.0.2.2:8000/api';

    String configuredBaseUrl = '';

    try {
      configuredBaseUrl = dotenv.env['BASE_URL']?.trim() ?? '';
    } catch (_) {
      configuredBaseUrl = '';
    }

    final isAndroid = defaultTargetPlatform == TargetPlatform.android;
    final isDesktop =
        defaultTargetPlatform == TargetPlatform.windows ||
        defaultTargetPlatform == TargetPlatform.linux ||
        defaultTargetPlatform == TargetPlatform.macOS;

    if (configuredBaseUrl.isEmpty) {
      return isAndroid ? fallbackAndroidBaseUrl : fallbackDesktopBaseUrl;
    }

    if (isDesktop && configuredBaseUrl.contains('10.0.2.2')) {
      return configuredBaseUrl.replaceFirst('10.0.2.2', '127.0.0.1');
    }

    if (isAndroid && configuredBaseUrl.contains('127.0.0.1')) {
      return configuredBaseUrl.replaceFirst('127.0.0.1', '10.0.2.2');
    }

    return configuredBaseUrl;
  }
}