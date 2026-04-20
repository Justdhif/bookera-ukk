import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'features/auth/data/repositories/auth_repository.dart';
import 'app.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Load environment variables
  try {
    await dotenv.load(fileName: ".env");
  } catch (_) {
  }

  await AuthRepository().restoreSession();

  runApp(
    const ProviderScope(
      child: MyApp(),
    ),
  );
}