import 'package:flutter/material.dart';

/// Premium minimal theme for MeeRaiKin app
class AppThemePremium {
  // Primary Colors
  static const Color primary = Color(0xFF6C63FF);
  static const Color secondary = Color(0xFFFF80AB);
  static const Color accent = Color(0xFF4ECDC4);
  
  // Background Colors
  static const Color backgroundStart = Color(0xFFFFF1F3);
  static const Color backgroundEnd = Color(0xFFFFE4C7);
  
  // Card Colors
  static const Color cardWhite = Color(0xFFFDFDFD);
  static const Color cardBorder = Color(0xFFECECEC);
  
  // Text Colors
  static const Color textPrimary = Color(0xFF2D2D2D);
  static const Color textSecondary = Color(0xFF7A7A7A);
  static const Color textLight = Color(0xFF9E9E9E);
  
  // Meal Type Colors (soft pastels)
  static const Color breakfastOrange = Color(0xFFFFB366);
  static const Color lunchCyan = Color(0xFF6DD5FA);
  static const Color dinnerPurple = Color(0xFFB19CD9);
  
  // Functional Colors
  static const Color success = Color(0xFF4ECDC4);
  static const Color warning = Color(0xFFFFB366);
  static const Color error = Color(0xFFFF6B6B);
  
  // Gradients
  static const LinearGradient backgroundGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [backgroundStart, backgroundEnd],
  );
  
  static const LinearGradient primaryGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF667eea), Color(0xFF764ba2)],
  );
  
  static const LinearGradient secondaryGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFFf093fb), Color(0xFFf5576c)],
  );
  
  static const LinearGradient breakfastGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFFffa751), Color(0xFFffe259)],
  );
  
  static const LinearGradient lunchGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF6DD5FA), Color(0xFF2980B9)],
  );
  
  static const LinearGradient dinnerGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFFB19CD9), Color(0xFF7F53AC)],
  );
  
  // Shadows
  static List<BoxShadow> cardShadow = [
    BoxShadow(
      color: Colors.black.withOpacity(0.06),
      blurRadius: 16,
      offset: const Offset(0, 6),
    ),
  ];
  
  static List<BoxShadow> buttonShadow = [
    BoxShadow(
      color: primary.withOpacity(0.25),
      blurRadius: 20,
      offset: const Offset(0, 10),
    ),
  ];
  
  // Border Radius
  static const BorderRadius cardRadius = BorderRadius.all(Radius.circular(20));
  static const BorderRadius buttonRadius = BorderRadius.all(Radius.circular(16));
  static const BorderRadius pillRadius = BorderRadius.all(Radius.circular(30));
  static const BorderRadius imageRadius = BorderRadius.all(Radius.circular(16));
  
  // Spacing (8px grid)
  static const double spacing1 = 4;
  static const double spacing2 = 8;
  static const double spacing3 = 12;
  static const double spacing4 = 16;
  static const double spacing5 = 20;
  static const double spacing6 = 24;
  static const double spacing8 = 32;
  
  // Typography
  static const String fontFamily = 'Inter';
  
  static const TextStyle h1 = TextStyle(
    fontFamily: fontFamily,
    fontSize: 28,
    fontWeight: FontWeight.w700,
    color: textPrimary,
    letterSpacing: -0.5,
  );
  
  static const TextStyle h2 = TextStyle(
    fontFamily: fontFamily,
    fontSize: 22,
    fontWeight: FontWeight.w600,
    color: textPrimary,
    letterSpacing: -0.3,
  );
  
  static const TextStyle h3 = TextStyle(
    fontFamily: fontFamily,
    fontSize: 18,
    fontWeight: FontWeight.w600,
    color: textPrimary,
  );
  
  static const TextStyle body1 = TextStyle(
    fontFamily: fontFamily,
    fontSize: 15,
    fontWeight: FontWeight.w400,
    color: textPrimary,
  );
  
  static const TextStyle body2 = TextStyle(
    fontFamily: fontFamily,
    fontSize: 14,
    fontWeight: FontWeight.w400,
    color: textSecondary,
  );
  
  static const TextStyle caption = TextStyle(
    fontFamily: fontFamily,
    fontSize: 12,
    fontWeight: FontWeight.w500,
    color: textLight,
  );
  
  static const TextStyle button = TextStyle(
    fontFamily: fontFamily,
    fontSize: 16,
    fontWeight: FontWeight.w600,
    letterSpacing: 0.2,
  );
  
  // Material Theme
  static ThemeData get theme {
    return ThemeData(
      useMaterial3: true,
      fontFamily: fontFamily,
      scaffoldBackgroundColor: Colors.white,
      colorScheme: const ColorScheme.light(
        primary: primary,
        secondary: secondary,
        surface: cardWhite,
        error: error,
      ),
      textTheme: const TextTheme(
        displayLarge: h1,
        displayMedium: h2,
        displaySmall: h3,
        bodyLarge: body1,
        bodyMedium: body2,
        bodySmall: caption,
      ),
      cardTheme: CardThemeData(
        color: cardWhite,
        elevation: 0,
        shape: RoundedRectangleBorder(borderRadius: cardRadius),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: cardWhite,
        labelStyle: caption,
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        shape: RoundedRectangleBorder(
          borderRadius: const BorderRadius.all(Radius.circular(12)),
          side: BorderSide(color: cardBorder),
        ),
      ),
    );
  }
  
  // Helper method to get meal type gradient
  static LinearGradient getMealGradient(String mealType) {
    switch (mealType.toLowerCase()) {
      case 'breakfast':
        return breakfastGradient;
      case 'lunch':
        return lunchGradient;
      case 'dinner':
        return dinnerGradient;
      default:
        return primaryGradient;
    }
  }
  
  // Helper method to get meal type icon
  static String getMealIcon(String mealType) {
    switch (mealType.toLowerCase()) {
      case 'breakfast':
        return '☀️';
      case 'lunch':
        return '🍱';
      case 'dinner':
        return '🌙';
      default:
        return '🍽️';
    }
  }
}

