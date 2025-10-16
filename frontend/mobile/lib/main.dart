import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/app_theme_premium.dart';
import 'core/app_router.dart';
import 'core/dio_client.dart';

/// Main app entry point
void main() {
  // Set system UI overlay style for better status bar appearance
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
      systemNavigationBarColor: Colors.white,
      systemNavigationBarIconBrightness: Brightness.dark,
    ),
  );
  
  // Initialize Dio client
  DioClient.init();
  
  runApp(
    const ProviderScope(
      child: MeeRaiKinApp(),
    ),
  );
}

/// Main app widget
class MeeRaiKinApp extends ConsumerWidget {
  const MeeRaiKinApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(appRouterProvider);

    return MaterialApp.router(
      title: 'MeeRaiKin',
      theme: AppThemePremium.theme,
      routerConfig: router,
      debugShowCheckedModeBanner: false,
    );
  }
}
