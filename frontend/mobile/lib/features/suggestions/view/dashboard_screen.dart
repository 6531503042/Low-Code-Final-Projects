import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../providers/suggestion_providers.dart';
import '../models/suggestion_models.dart';
import '../../../core/app_router.dart';
import '../../../core/app_theme.dart';
import '../../auth/providers/auth_providers.dart';

/// Dashboard screen showing daily meal suggestions
class DashboardScreen extends ConsumerStatefulWidget {
  const DashboardScreen({super.key});

  @override
  ConsumerState<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends ConsumerState<DashboardScreen> 
    with TickerProviderStateMixin {
  late AnimationController _fadeController;
  late AnimationController _slideController;
  late AnimationController _scaleController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;
  late Animation<double> _scaleAnimation;
  
  @override
  void initState() {
    super.initState();
    
    // Initialize animations
    _fadeController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );
    _slideController = AnimationController(
      duration: const Duration(milliseconds: 600),
      vsync: this,
    );
    _scaleController = AnimationController(
      duration: const Duration(milliseconds: 400),
      vsync: this,
    );
    
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _fadeController, curve: Curves.easeInOut),
    );
    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.3),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _slideController, curve: Curves.easeOutCubic));
    _scaleAnimation = Tween<double>(begin: 0.8, end: 1.0).animate(
      CurvedAnimation(parent: _scaleController, curve: Curves.elasticOut),
    );
    
    // Load suggestions when screen loads
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      await ref.read(suggestionStateProvider.notifier).getToday();
      // Start animations
      _fadeController.forward();
      _slideController.forward();
      _scaleController.forward();
    });
  }

  @override
  void dispose() {
    _fadeController.dispose();
    _slideController.dispose();
    _scaleController.dispose();
    super.dispose();
  }

  /// Show error snackbar
  void _showErrorSnackBar(String message) {
    if (!mounted) return;
    
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Theme.of(context).colorScheme.error,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    );
  }

  /// Show success snackbar
  void _showSuccessSnackBar(String message) {
    if (!mounted) return;
    
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Theme.of(context).colorScheme.primary,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    );
  }

  /// Handle logout
  Future<void> _handleLogout() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Logout'),
        content: const Text('Are you sure you want to logout?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: const Text('Logout'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      await ref.read(authStateProvider.notifier).logout();
      if (mounted) {
        AppNavigation.goToLogin(context);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authStateProvider);
    final suggestionState = ref.watch(suggestionStateProvider);

    // Listen for auth state changes
    ref.listen<AsyncValue>(authStateProvider, (previous, next) {
      next.whenOrNull(
        data: (user) {
          if (user == null && mounted) {
            AppNavigation.goToLogin(context);
          }
        },
      );
    });

    // Listen for suggestion state changes
    ref.listen<AsyncValue>(suggestionStateProvider, (previous, next) {
      next.whenOrNull(
        error: (error, stack) {
          print('🚨 Suggestion error in UI: $error');
          _showErrorSnackBar(error.toString());
        },
      );
    });

    final currentUser = authState.valueOrNull;

    return Scaffold(
      appBar: AppBar(
        title: const Text('MeeRaiKin'),
        actions: [
          PopupMenuButton<String>(
            onSelected: (value) {
              switch (value) {
                case 'preferences':
                  AppNavigation.pushToPreferences(context);
                  break;
                case 'schedules':
                  AppNavigation.pushToSchedules(context);
                  break;
                case 'logout':
                  _handleLogout();
                  break;
              }
            },
            itemBuilder: (context) => [
              const PopupMenuItem(
                value: 'preferences',
                child: Row(
                  children: [
                    Icon(Icons.settings),
                    SizedBox(width: 8),
                    Text('Preferences'),
                  ],
                ),
              ),
              const PopupMenuItem(
                value: 'schedules',
                child: Row(
                  children: [
                    Icon(Icons.schedule),
                    SizedBox(width: 8),
                    Text('Schedules'),
                  ],
                ),
              ),
              const PopupMenuItem(
                value: 'logout',
                child: Row(
                  children: [
                    Icon(Icons.logout),
                    SizedBox(width: 8),
                    Text('Logout'),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          await ref.read(suggestionStateProvider.notifier).refresh();
          // Restart animations on refresh
          _fadeController.reset();
          _slideController.reset();
          _scaleController.reset();
          _fadeController.forward();
          _slideController.forward();
          _scaleController.forward();
        },
        child: suggestionState.when(
          data: (suggestion) => FadeTransition(
            opacity: _fadeAnimation,
            child: SlideTransition(
              position: _slideAnimation,
              child: _buildSuggestions(suggestion),
            ),
          ),
          loading: () => _buildLoadingState(),
          error: (error, stack) => _buildError(error.toString()),
        ),
      ),
      floatingActionButton: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(30),
          gradient: LinearGradient(
            colors: [
              Theme.of(context).colorScheme.primary,
              Theme.of(context).colorScheme.secondary,
            ],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          boxShadow: [
            BoxShadow(
              color: Theme.of(context).colorScheme.primary.withOpacity(0.3),
              blurRadius: 15,
              offset: const Offset(0, 5),
            ),
          ],
        ),
        child: FloatingActionButton.extended(
          onPressed: () async {
            // Add surprise animation
            _scaleController.reset();
            _scaleController.forward();
            
            await ref.read(suggestionStateProvider.notifier).generateToday();
            _showSuccessSnackBar('🎉 New delicious suggestions generated!');
          },
          backgroundColor: Colors.transparent,
          elevation: 0,
          icon: const Icon(Icons.auto_awesome, color: Colors.white),
          label: const Text(
            'Generate New',
            style: TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      ),
    );
  }

  /// Build loading state with surprise animation
  Widget _buildLoadingState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Animated food icons
          ScaleTransition(
            scale: _scaleAnimation,
            child: Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.primary.withOpacity(0.1),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Icon(
                Icons.restaurant,
                size: 64,
                color: Theme.of(context).colorScheme.primary,
              ),
            ),
          ),
          const SizedBox(height: 24),
          Text(
            '🍽️ Preparing your meal suggestions...',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
              color: Theme.of(context).colorScheme.onSurface.withOpacity(0.8),
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),
          Text(
            '✨ We\'re cooking up something delicious for you!',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: Theme.of(context).colorScheme.onSurface.withOpacity(0.6),
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 32),
          CircularProgressIndicator(
            valueColor: AlwaysStoppedAnimation<Color>(
              Theme.of(context).colorScheme.primary,
            ),
          ),
        ],
      ),
    );
  }

  /// Build suggestions UI
  Widget _buildSuggestions(TodaySuggestion? suggestion) {
    if (suggestion == null) {
      return _buildEmptyState();
    }

    return SingleChildScrollView(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Welcome message with emoji and gradient
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  Theme.of(context).colorScheme.primary.withOpacity(0.1),
                  Theme.of(context).colorScheme.secondary.withOpacity(0.1),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Column(
              children: [
                Text(
                  '🍽️ Today\'s Meal Suggestions',
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: Theme.of(context).colorScheme.onSurface,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),
                Text(
                  '✨ Tap reroll to get a different option for any meal',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Theme.of(context).colorScheme.onSurface.withOpacity(0.7),
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
          
          const SizedBox(height: 24),
          
          // Meal cards
          _buildMealCard(MealType.breakfast, suggestion.breakfast),
          _buildMealCard(MealType.lunch, suggestion.lunch),
          _buildMealCard(MealType.dinner, suggestion.dinner),
          
          const SizedBox(height: 24),
          
          // Completion status
          if (suggestion.hasMissingMeals)
            Card(
              color: Theme.of(context).colorScheme.errorContainer,
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    Icon(
                      Icons.info_outline,
                      color: Theme.of(context).colorScheme.onErrorContainer,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'Some meals are missing. Tap reroll to get suggestions.',
                        style: TextStyle(
                          color: Theme.of(context).colorScheme.onErrorContainer,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }

  /// Build meal card with beautiful design
  Widget _buildMealCard(MealType mealType, MenuItem? menuItem) {
    final theme = Theme.of(context);
    final mealColor = AppTheme.getMealTypeColor(mealType.apiValue);
    final mealIcon = AppTheme.getMealTypeIcon(mealType.apiValue);

    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        gradient: LinearGradient(
          colors: [
            mealColor.withOpacity(0.1),
            mealColor.withOpacity(0.05),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        border: Border.all(
          color: mealColor.withOpacity(0.3),
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: mealColor.withOpacity(0.2),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Meal header with beautiful design
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: mealColor.withOpacity(0.2),
                borderRadius: BorderRadius.circular(15),
              ),
              child: Row(
                children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: mealColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(
                    mealIcon,
                    color: mealColor,
                    size: 24,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        mealType.displayName,
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      Text(
                        'Tap reroll for a different option',
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: theme.colorScheme.onSurface.withOpacity(0.6),
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(20),
                    gradient: LinearGradient(
                      colors: [
                        mealColor.withOpacity(0.8),
                        mealColor,
                      ],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: mealColor.withOpacity(0.3),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: ElevatedButton(
                    onPressed: () async {
                      await ref.read(suggestionStateProvider.notifier).reroll(mealType);
                      _showSuccessSnackBar('🎲 ${mealType.displayName} rerolled!');
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.transparent,
                      elevation: 0,
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(20),
                      ),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.casino, color: Colors.white, size: 18),
                        SizedBox(width: 8),
                        Text(
                          'Reroll',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                ],
              ),
            ),
            
            const SizedBox(height: 16),
            
            // Menu item or placeholder
            if (menuItem != null) ...[
              // Menu image with surprise effect
              ScaleTransition(
                scale: _scaleAnimation,
                child: Container(
                  height: 140,
                  width: double.infinity,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(16),
                    gradient: LinearGradient(
                      colors: [
                        mealColor.withOpacity(0.1),
                        mealColor.withOpacity(0.05),
                      ],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    border: Border.all(
                      color: mealColor.withOpacity(0.2),
                      width: 2,
                    ),
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(14),
                    child: menuItem.imageUrl != null && menuItem.imageUrl!.isNotEmpty
                        ? Stack(
                            children: [
                              CachedNetworkImage(
                                imageUrl: menuItem.imageUrl!,
                                height: 140,
                                width: double.infinity,
                                fit: BoxFit.cover,
                                fadeInDuration: const Duration(milliseconds: 300),
                                placeholder: (context, url) => Container(
                                  height: 140,
                                  decoration: BoxDecoration(
                                    gradient: LinearGradient(
                                      colors: [
                                        mealColor.withOpacity(0.3),
                                        mealColor.withOpacity(0.1),
                                      ],
                                    ),
                                  ),
                                  child: Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      CircularProgressIndicator(
                                        valueColor: AlwaysStoppedAnimation<Color>(mealColor),
                                      ),
                                      const SizedBox(height: 8),
                                      Text(
                                        'Loading delicious image...',
                                        style: TextStyle(
                                          color: mealColor,
                                          fontSize: 12,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                errorWidget: (context, url, error) => Container(
                                  height: 140,
                                  decoration: BoxDecoration(
                                    gradient: LinearGradient(
                                      colors: [
                                        mealColor.withOpacity(0.3),
                                        mealColor.withOpacity(0.1),
                                      ],
                                    ),
                                  ),
                                  child: Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Icon(
                                        Icons.restaurant,
                                        size: 48,
                                        color: mealColor,
                                      ),
                                      const SizedBox(height: 8),
                                      Text(
                                        '🍽️ Surprise Dish!',
                                        style: TextStyle(
                                          color: mealColor,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                              // Overlay gradient for better text readability
                              Positioned(
                                bottom: 0,
                                left: 0,
                                right: 0,
                                child: Container(
                                  height: 40,
                                  decoration: BoxDecoration(
                                    gradient: LinearGradient(
                                      colors: [
                                        Colors.transparent,
                                        Colors.black.withOpacity(0.7),
                                      ],
                                      begin: Alignment.topCenter,
                                      end: Alignment.bottomCenter,
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          )
                        : Container(
                            height: 140,
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                colors: [
                                  mealColor.withOpacity(0.3),
                                  mealColor.withOpacity(0.1),
                                ],
                              ),
                            ),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  Icons.restaurant,
                                  size: 48,
                                  color: mealColor,
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  '🍽️ Surprise Dish!',
                                  style: TextStyle(
                                    color: mealColor,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                  ),
                                ),
                              ],
                            ),
                          ),
                  ),
                ),
              ),
              
              const SizedBox(height: 12),
              
              // Menu details
              Text(
                menuItem.title,
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              
              const SizedBox(height: 4),
              
              // Cuisine badge
              Chip(
                label: Text(menuItem.cuisine),
                backgroundColor: mealColor.withOpacity(0.1),
                labelStyle: TextStyle(
                  color: mealColor,
                  fontWeight: FontWeight.w500,
                ),
              ),
              
              const SizedBox(height: 8),
              
              // Budget range
              Row(
                children: [
                  Icon(
                    Icons.attach_money,
                    size: 16,
                    color: theme.colorScheme.onSurface.withOpacity(0.6),
                  ),
                  const SizedBox(width: 4),
                  Text(
                    menuItem.budgetRange,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.onSurface.withOpacity(0.6),
                    ),
                  ),
                ],
              ),
              
              // Allergens
              if (menuItem.hasAllergens) ...[
                const SizedBox(height: 8),
                Wrap(
                  spacing: 4,
                  runSpacing: 4,
                  children: menuItem.allergens.map((allergen) => Chip(
                    label: Text(allergen),
                    backgroundColor: theme.colorScheme.errorContainer,
                    labelStyle: TextStyle(
                      color: theme.colorScheme.onErrorContainer,
                      fontSize: 12,
                    ),
                  )).toList(),
                ),
              ],
            ] else ...[
              // No suggestion placeholder
              Container(
                height: 120,
                width: double.infinity,
                decoration: BoxDecoration(
                  color: theme.colorScheme.surface,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: theme.colorScheme.outline.withOpacity(0.2),
                    style: BorderStyle.solid,
                  ),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.add_circle_outline,
                      size: 48,
                      color: theme.colorScheme.onSurface.withOpacity(0.3),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'No suggestion yet',
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: theme.colorScheme.onSurface.withOpacity(0.6),
                      ),
                    ),
                    Text(
                      'Tap reroll to get one',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.onSurface.withOpacity(0.4),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  /// Build empty state
  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.restaurant_menu,
              size: 64,
              color: Theme.of(context).colorScheme.onSurface.withOpacity(0.3),
            ),
            const SizedBox(height: 16),
            Text(
              'No suggestions yet',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 8),
            Text(
              'Tap the generate button to get your daily meal suggestions',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Theme.of(context).colorScheme.onSurface.withOpacity(0.6),
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  /// Build error state
  Widget _buildError(String error) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.error_outline,
              size: 64,
              color: Theme.of(context).colorScheme.error,
            ),
            const SizedBox(height: 16),
            Text(
              'Failed to load suggestions',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 8),
            Text(
              error,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Theme.of(context).colorScheme.onSurface.withOpacity(0.6),
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                FilledButton(
                  onPressed: () async {
                    await ref.read(suggestionStateProvider.notifier).refresh();
                  },
                  child: const Text('Retry'),
                ),
                const SizedBox(width: 16),
                FilledButton(
                  onPressed: () async {
                    await ref.read(suggestionStateProvider.notifier).generateToday();
                  },
                  child: const Text('Generate New'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
