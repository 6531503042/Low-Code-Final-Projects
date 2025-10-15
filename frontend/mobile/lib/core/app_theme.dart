import 'package:flutter/material.dart';

/// App theme configuration with Material 3 design
class AppTheme {
  // Color scheme
  static const Color primaryColor = Color(0xFF6750A4);
  static const Color secondaryColor = Color(0xFF625B71);
  static const Color tertiaryColor = Color(0xFF7D5260);
  static const Color errorColor = Color(0xFFBA1A1A);
  static const Color surfaceColor = Color(0xFFFFFBFE);
  static const Color backgroundColor = Color(0xFFFFFBFE);
  static const Color onPrimaryColor = Color(0xFFFFFFFF);
  static const Color onSecondaryColor = Color(0xFFFFFFFF);
  static const Color onSurfaceColor = Color(0xFF1C1B1F);
  static const Color onBackgroundColor = Color(0xFF1C1B1F);
  static const Color outlineColor = Color(0xFF79747E);

  /// Light theme
  static ThemeData get lightTheme {
    final colorScheme = ColorScheme.fromSeed(
      seedColor: primaryColor,
      brightness: Brightness.light,
      primary: primaryColor,
      secondary: secondaryColor,
      tertiary: tertiaryColor,
      error: errorColor,
      surface: surfaceColor,
      background: backgroundColor,
      onPrimary: onPrimaryColor,
      onSecondary: onSecondaryColor,
      onSurface: onSurfaceColor,
      onBackground: onBackgroundColor,
      outline: outlineColor,
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: colorScheme,
      
      // App bar theme
      appBarTheme: const AppBarTheme(
        centerTitle: true,
        elevation: 0,
        scrolledUnderElevation: 1,
        titleTextStyle: TextStyle(
          fontSize: 22,
          fontWeight: FontWeight.w600,
          color: onBackgroundColor,
        ),
      ),

      // Card theme
      cardTheme: const CardThemeData(
        elevation: 2,
        margin: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      ),

      // Elevated button theme
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          elevation: 1,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          textStyle: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),

      // Outlined button theme
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          textStyle: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),

      // Text button theme
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          textStyle: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),

      // Filled button theme
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          textStyle: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),

      // Input decoration theme
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: colorScheme.surface,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: colorScheme.outline),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: colorScheme.outline),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: colorScheme.primary, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: colorScheme.error),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: colorScheme.error, width: 2),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        labelStyle: TextStyle(
          color: colorScheme.onSurface.withOpacity(0.6),
        ),
        hintStyle: TextStyle(
          color: colorScheme.onSurface.withOpacity(0.6),
        ),
      ),

      // Chip theme
      chipTheme: ChipThemeData(
        backgroundColor: colorScheme.surface,
        selectedColor: colorScheme.primaryContainer,
        disabledColor: colorScheme.onSurface.withOpacity(0.12),
        labelStyle: TextStyle(color: colorScheme.onSurface),
        secondaryLabelStyle: TextStyle(color: colorScheme.onPrimaryContainer),
        brightness: colorScheme.brightness,
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        labelPadding: const EdgeInsets.symmetric(horizontal: 8),
        side: BorderSide(color: colorScheme.outline),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
      ),

      // Floating action button theme
      floatingActionButtonTheme: FloatingActionButtonThemeData(
        elevation: 3,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
      ),

      // Bottom navigation bar theme
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        elevation: 3,
        backgroundColor: colorScheme.surface,
        selectedItemColor: colorScheme.primary,
        unselectedItemColor: colorScheme.onSurface.withOpacity(0.6),
        type: BottomNavigationBarType.fixed,
        selectedLabelStyle: const TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w600,
        ),
        unselectedLabelStyle: const TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w500,
        ),
      ),

      // List tile theme
      listTileTheme: ListTileThemeData(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      ),

      // Divider theme
      dividerTheme: DividerThemeData(
        color: colorScheme.outline.withOpacity(0.3),
        thickness: 1,
        space: 1,
      ),

      // Typography
      textTheme: TextTheme(
        headlineLarge: const TextStyle(
          fontSize: 32,
          fontWeight: FontWeight.w400,
          color: onBackgroundColor,
        ),
        headlineMedium: const TextStyle(
          fontSize: 28,
          fontWeight: FontWeight.w400,
          color: onBackgroundColor,
        ),
        headlineSmall: const TextStyle(
          fontSize: 24,
          fontWeight: FontWeight.w400,
          color: onBackgroundColor,
        ),
        titleLarge: const TextStyle(
          fontSize: 22,
          fontWeight: FontWeight.w400,
          color: onBackgroundColor,
        ),
        titleMedium: const TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w500,
          color: onBackgroundColor,
        ),
        titleSmall: const TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w500,
          color: onBackgroundColor,
        ),
        bodyLarge: const TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w400,
          color: onBackgroundColor,
        ),
        bodyMedium: const TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w400,
          color: onBackgroundColor,
        ),
        bodySmall: const TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w400,
          color: onBackgroundColor,
        ),
        labelLarge: const TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w500,
          color: onBackgroundColor,
        ),
        labelMedium: const TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w500,
          color: onBackgroundColor,
        ),
        labelSmall: const TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w500,
          color: onBackgroundColor,
        ),
      ),
    );
  }

  /// Get meal type color
  static Color getMealTypeColor(String mealType) {
    switch (mealType.toLowerCase()) {
      case 'breakfast':
        return const Color(0xFFFFB74D); // Orange
      case 'lunch':
        return const Color(0xFF81C784); // Green
      case 'dinner':
        return const Color(0xFF64B5F6); // Blue
      default:
        return primaryColor;
    }
  }

  /// Get meal type icon
  static IconData getMealTypeIcon(String mealType) {
    switch (mealType.toLowerCase()) {
      case 'breakfast':
        return Icons.wb_sunny_outlined;
      case 'lunch':
        return Icons.wb_sunny;
      case 'dinner':
        return Icons.nightlight_outlined;
      default:
        return Icons.restaurant;
    }
  }
}
