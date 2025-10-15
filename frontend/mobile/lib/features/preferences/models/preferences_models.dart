/// User preferences model
class Preferences {
  final List<String> cuisines;
  final List<String> allergensAvoid;
  final int? budgetMin;
  final int? budgetMax;
  final List<String> excludedMealTypes;

  const Preferences({
    required this.cuisines,
    required this.allergensAvoid,
    this.budgetMin,
    this.budgetMax,
    required this.excludedMealTypes,
  });

  factory Preferences.empty() {
    return const Preferences(
      cuisines: [],
      allergensAvoid: [],
      excludedMealTypes: [],
    );
  }

  factory Preferences.fromJson(Map<String, dynamic> json) {
    return Preferences(
      cuisines: List<String>.from(json['cuisines'] ?? []),
      allergensAvoid: List<String>.from(json['allergensAvoid'] ?? []),
      budgetMin: json['budgetMin'],
      budgetMax: json['budgetMax'],
      excludedMealTypes: List<String>.from(json['excludedMealTypes'] ?? []),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'cuisines': cuisines,
      'allergensAvoid': allergensAvoid,
      'budgetMin': budgetMin,
      'budgetMax': budgetMax,
      'excludedMealTypes': excludedMealTypes,
    };
  }

  /// Create a copy with updated values
  Preferences copyWith({
    List<String>? cuisines,
    List<String>? allergensAvoid,
    int? budgetMin,
    int? budgetMax,
    List<String>? excludedMealTypes,
  }) {
    return Preferences(
      cuisines: cuisines ?? this.cuisines,
      allergensAvoid: allergensAvoid ?? this.allergensAvoid,
      budgetMin: budgetMin ?? this.budgetMin,
      budgetMax: budgetMax ?? this.budgetMax,
      excludedMealTypes: excludedMealTypes ?? this.excludedMealTypes,
    );
  }

  /// Check if has any preferences set
  bool get hasPreferences {
    return cuisines.isNotEmpty ||
        allergensAvoid.isNotEmpty ||
        budgetMin != null ||
        budgetMax != null ||
        excludedMealTypes.isNotEmpty;
  }

  /// Get formatted budget range
  String get budgetRange {
    if (budgetMin != null && budgetMax != null) {
      return '฿$budgetMin - ฿$budgetMax';
    } else if (budgetMin != null) {
      return '฿$budgetMin+';
    } else if (budgetMax != null) {
      return '฿$budgetMax';
    } else {
      return 'No budget limit';
    }
  }

  /// Check if a meal type is excluded
  bool isMealTypeExcluded(String mealType) {
    return excludedMealTypes.contains(mealType.toLowerCase());
  }

  /// Check if a cuisine is preferred
  bool isCuisinePreferred(String cuisine) {
    return cuisines.contains(cuisine);
  }

  /// Check if an allergen is avoided
  bool isAllergenAvoided(String allergen) {
    return allergensAvoid.contains(allergen);
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Preferences &&
        other.cuisines.toString() == cuisines.toString() &&
        other.allergensAvoid.toString() == allergensAvoid.toString() &&
        other.budgetMin == budgetMin &&
        other.budgetMax == budgetMax &&
        other.excludedMealTypes.toString() == excludedMealTypes.toString();
  }

  @override
  int get hashCode {
    return Object.hash(
      cuisines,
      allergensAvoid,
      budgetMin,
      budgetMax,
      excludedMealTypes,
    );
  }

  @override
  String toString() {
    return 'Preferences(cuisines: $cuisines, allergensAvoid: $allergensAvoid, budget: $budgetRange, excludedMealTypes: $excludedMealTypes)';
  }
}

/// Available cuisine options
class CuisineOptions {
  static const List<String> options = [
    'Thai',
    'Japanese',
    'Chinese',
    'Korean',
    'Western',
    'Italian',
    'Indian',
    'Mexican',
    'Vietnamese',
    'French',
    'Mediterranean',
    'American',
    'German',
    'Spanish',
    'Middle Eastern',
  ];
}

/// Common allergen options
class AllergenOptions {
  static const List<String> options = [
    'peanut',
    'tree nuts',
    'dairy',
    'eggs',
    'soy',
    'wheat',
    'gluten',
    'fish',
    'shellfish',
    'sesame',
    'mustard',
    'sulfites',
  ];
}
