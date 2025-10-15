/// Meal type enumeration
enum MealType {
  breakfast,
  lunch,
  dinner;

  String get displayName {
    switch (this) {
      case MealType.breakfast:
        return 'Breakfast';
      case MealType.lunch:
        return 'Lunch';
      case MealType.dinner:
        return 'Dinner';
    }
  }

  String get apiValue {
    switch (this) {
      case MealType.breakfast:
        return 'breakfast';
      case MealType.lunch:
        return 'lunch';
      case MealType.dinner:
        return 'dinner';
    }
  }

  static MealType fromString(String value) {
    switch (value.toLowerCase()) {
      case 'breakfast':
        return MealType.breakfast;
      case 'lunch':
        return MealType.lunch;
      case 'dinner':
        return MealType.dinner;
      default:
        throw ArgumentError('Invalid meal type: $value');
    }
  }
}

/// Menu item model
class MenuItem {
  final String id;
  final String title;
  final String cuisine;
  final List<String> allergens;
  final int? budgetMin;
  final int? budgetMax;
  final String? imageUrl;
  final String? notes;

  const MenuItem({
    required this.id,
    required this.title,
    required this.cuisine,
    required this.allergens,
    this.budgetMin,
    this.budgetMax,
    this.imageUrl,
    this.notes,
  });

  factory MenuItem.fromJson(Map<String, dynamic> json) {
    return MenuItem(
      id: json['_id'] ?? json['id'] ?? '',
      title: json['title'] ?? '',
      cuisine: json['cuisine'] ?? '',
      allergens: List<String>.from(json['allergens'] ?? []),
      budgetMin: json['budgetMin'],
      budgetMax: json['budgetMax'],
      imageUrl: json['imageUrl'],
      notes: json['notes'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'cuisine': cuisine,
      'allergens': allergens,
      'budgetMin': budgetMin,
      'budgetMax': budgetMax,
      'imageUrl': imageUrl,
      'notes': notes,
    };
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
      return 'Price varies';
    }
  }

  /// Check if has allergens
  bool get hasAllergens => allergens.isNotEmpty;

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is MenuItem && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;

  @override
  String toString() {
    return 'MenuItem(id: $id, title: $title, cuisine: $cuisine)';
  }
}

/// Today's meal suggestions model
class TodaySuggestion {
  final String? breakfastMenuId;
  final String? lunchMenuId;
  final String? dinnerMenuId;
  final MenuItem? breakfast;
  final MenuItem? lunch;
  final MenuItem? dinner;
  final String date;

  const TodaySuggestion({
    this.breakfastMenuId,
    this.lunchMenuId,
    this.dinnerMenuId,
    this.breakfast,
    this.lunch,
    this.dinner,
    required this.date,
  });

  factory TodaySuggestion.fromJson(Map<String, dynamic> json) {
    return TodaySuggestion(
      breakfastMenuId: json['breakfastMenuId']?['_id'] ?? json['breakfastMenuId'],
      lunchMenuId: json['lunchMenuId']?['_id'] ?? json['lunchMenuId'],
      dinnerMenuId: json['dinnerMenuId']?['_id'] ?? json['dinnerMenuId'],
      breakfast: json['breakfastMenuId'] is Map<String, dynamic>
          ? MenuItem.fromJson(json['breakfastMenuId'])
          : null,
      lunch: json['lunchMenuId'] is Map<String, dynamic>
          ? MenuItem.fromJson(json['lunchMenuId'])
          : null,
      dinner: json['dinnerMenuId'] is Map<String, dynamic>
          ? MenuItem.fromJson(json['dinnerMenuId'])
          : null,
      date: json['date'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'breakfastMenuId': breakfastMenuId,
      'lunchMenuId': lunchMenuId,
      'dinnerMenuId': dinnerMenuId,
      'date': date,
    };
  }

  /// Get menu item by meal type
  MenuItem? getMenuByType(MealType mealType) {
    switch (mealType) {
      case MealType.breakfast:
        return breakfast;
      case MealType.lunch:
        return lunch;
      case MealType.dinner:
        return dinner;
    }
  }

  /// Check if all meals are suggested
  bool get isComplete => breakfast != null && lunch != null && dinner != null;

  /// Check if any meal is missing
  bool get hasMissingMeals => breakfast == null || lunch == null || dinner == null;

  @override
  String toString() {
    return 'TodaySuggestion(date: $date, breakfast: ${breakfast?.title}, lunch: ${lunch?.title}, dinner: ${dinner?.title})';
  }
}

/// Reroll request model
class RerollRequest {
  final MealType mealType;

  const RerollRequest({required this.mealType});

  Map<String, dynamic> toJson() {
    return {
      'mealType': mealType.apiValue,
    };
  }
}
