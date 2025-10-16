import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/suggestion_providers.dart';
import '../models/suggestion_models.dart';
import '../../auth/providers/auth_providers.dart';
import '../../../core/app_theme_premium.dart';
import '../widgets/meal_card.dart';
import '../widgets/gradient_button.dart';

/// Premium minimal dashboard screen
class DashboardScreenPremium extends ConsumerStatefulWidget {
  const DashboardScreenPremium({super.key});

  @override
  ConsumerState<DashboardScreenPremium> createState() => _DashboardScreenPremiumState();
}

class _DashboardScreenPremiumState extends ConsumerState<DashboardScreenPremium>
    with SingleTickerProviderStateMixin {
  late AnimationController _headerController;
  late Animation<double> _headerAnimation;
  bool _isGenerating = false;

  @override
  void initState() {
    super.initState();
    _headerController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );
    _headerAnimation = CurvedAnimation(
      parent: _headerController,
      curve: Curves.easeOut,
    );

    WidgetsBinding.instance.addPostFrameCallback((_) async {
      await ref.read(suggestionStateProvider.notifier).getToday();
      _headerController.forward();
    });
  }

  @override
  void dispose() {
    _headerController.dispose();
    super.dispose();
  }

  void _showSnackBar(String message, {bool isError = false}) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: isError
            ? AppThemePremium.error
            : AppThemePremium.success,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: const BorderRadius.all(Radius.circular(12)),
        ),
        margin: const EdgeInsets.all(16),
      ),
    );
  }

  Future<void> _handleLogout() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => Dialog(
        shape: RoundedRectangleBorder(
          borderRadius: const BorderRadius.all(Radius.circular(24)),
        ),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppThemePremium.error.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.exit_to_app,
                  size: 32,
                  color: AppThemePremium.error,
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'Logout',
                style: AppThemePremium.h2,
              ),
              const SizedBox(height: 8),
              Text(
                'Are you sure you want to logout?',
                style: AppThemePremium.body2,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => Navigator.pop(context, false),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        side: BorderSide(color: AppThemePremium.cardBorder),
                        shape: RoundedRectangleBorder(
                          borderRadius: const BorderRadius.all(Radius.circular(12)),
                        ),
                      ),
                      child: const Text('Cancel'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () => Navigator.pop(context, true),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppThemePremium.error,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: const BorderRadius.all(Radius.circular(12)),
                        ),
                      ),
                      child: const Text('Logout'),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );

    if (confirmed == true) {
      await ref.read(authStateProvider.notifier).logout();
      if (mounted) context.go('/login');
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authStateProvider);
    final suggestionState = ref.watch(suggestionStateProvider);

    if (authState.value == null && authState is! AsyncLoading) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        context.go('/login');
      });
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Stack(
          children: [
            // Main content
            CustomScrollView(
              physics: const BouncingScrollPhysics(),
              slivers: [
                // Header
                _buildHeader(),

                // Content
                SliverToBoxAdapter(
                  child: suggestionState.when(
                    data: (suggestion) => _buildContent(suggestion),
                    loading: () => _buildLoadingState(),
                    error: (error, _) => _buildErrorState(error.toString()),
                  ),
                ),

                // Bottom padding for FAB
                const SliverToBoxAdapter(
                  child: SizedBox(height: 100),
                ),
              ],
            ),

            // Floating action button
            Positioned(
              left: 20,
              right: 20,
              bottom: 20,
              child: _buildGenerateButton(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return SliverToBoxAdapter(
      child: FadeTransition(
        opacity: _headerAnimation,
        child: Padding(
          padding: const EdgeInsets.all(AppThemePremium.spacing5),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'MeeRaiKin',
                      style: AppThemePremium.h1.copyWith(
                        foreground: Paint()
                          ..shader = AppThemePremium.primaryGradient.createShader(
                            const Rect.fromLTWH(0, 0, 200, 70),
                          ),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Your daily meal companion',
                      style: AppThemePremium.body2,
                    ),
                  ],
                ),
              ),
              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: const BorderRadius.all(Radius.circular(14)),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.05),
                      blurRadius: 10,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: PopupMenuButton<String>(
                  icon: const Icon(Icons.more_vert, color: AppThemePremium.textPrimary),
                  shape: RoundedRectangleBorder(
                    borderRadius: const BorderRadius.all(Radius.circular(16)),
                  ),
                  onSelected: (value) {
                    if (value == 'preferences') {
                      context.push('/preferences');
                    } else if (value == 'schedules') {
                      context.push('/schedules');
                    } else if (value == 'logout') {
                      _handleLogout();
                    }
                  },
                  itemBuilder: (context) => [
                    _buildMenuItem(Icons.tune, 'Preferences', 'preferences'),
                    _buildMenuItem(Icons.schedule, 'Schedules', 'schedules'),
                    _buildMenuItem(Icons.logout, 'Logout', 'logout', isDestructive: true),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  PopupMenuItem<String> _buildMenuItem(
    IconData icon,
    String label,
    String value, {
    bool isDestructive = false,
  }) {
    return PopupMenuItem(
      value: value,
      child: Row(
        children: [
          Icon(
            icon,
            size: 20,
            color: isDestructive ? AppThemePremium.error : AppThemePremium.textSecondary,
          ),
          const SizedBox(width: 12),
          Text(
            label,
            style: AppThemePremium.body1.copyWith(
              color: isDestructive ? AppThemePremium.error : AppThemePremium.textPrimary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildContent(TodaySuggestion? suggestion) {
    if (suggestion == null) return _buildEmptyState();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppThemePremium.spacing5),
          child: Text(
            "Today's Suggestions",
            style: AppThemePremium.h2,
          ),
        ),
        const SizedBox(height: AppThemePremium.spacing2),
        
        // Meal cards
        PremiumMealCard(
          menuItem: suggestion.breakfast,
          mealType: MealType.breakfast,
          onReroll: () => _handleReroll(MealType.breakfast),
        ),
        PremiumMealCard(
          menuItem: suggestion.lunch,
          mealType: MealType.lunch,
          onReroll: () => _handleReroll(MealType.lunch),
        ),
        PremiumMealCard(
          menuItem: suggestion.dinner,
          mealType: MealType.dinner,
          onReroll: () => _handleReroll(MealType.dinner),
        ),
      ],
    );
  }

  Widget _buildLoadingState() {
    return Container(
      padding: const EdgeInsets.all(60),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              gradient: AppThemePremium.primaryGradient,
              shape: BoxShape.circle,
              boxShadow: AppThemePremium.cardShadow,
            ),
            child: const Icon(
              Icons.restaurant,
              size: 48,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 24),
          const Text(
            'Preparing your meals...',
            style: AppThemePremium.h3,
          ),
          const SizedBox(height: 8),
          Text(
            'Finding the perfect dishes for you',
            style: AppThemePremium.body2,
          ),
          const SizedBox(height: 32),
          const CircularProgressIndicator(),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Container(
      padding: const EdgeInsets.all(40),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(32),
            decoration: BoxDecoration(
              gradient: AppThemePremium.secondaryGradient,
              borderRadius: const BorderRadius.all(Radius.circular(32)),
            ),
            child: const Icon(
              Icons.restaurant_menu,
              size: 64,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 24),
          const Text(
            'No meals yet',
            style: AppThemePremium.h2,
          ),
          const SizedBox(height: 12),
          Text(
            'Tap the button below to generate your personalized meal suggestions',
            style: AppThemePremium.body2,
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildErrorState(String error) {
    return Container(
      padding: const EdgeInsets.all(40),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(32),
            decoration: BoxDecoration(
              color: AppThemePremium.error.withOpacity(0.1),
              borderRadius: const BorderRadius.all(Radius.circular(32)),
            ),
            child: const Icon(
              Icons.error_outline,
              size: 64,
              color: AppThemePremium.error,
            ),
          ),
          const SizedBox(height: 24),
          const Text(
            'Oops!',
            style: AppThemePremium.h2,
          ),
          const SizedBox(height: 12),
          Text(
            error,
            style: AppThemePremium.body2,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          GradientButton(
            label: 'Try Again',
            icon: Icons.refresh,
            onPressed: () => ref.read(suggestionStateProvider.notifier).refresh(),
          ),
        ],
      ),
    );
  }

  Widget _buildGenerateButton() {
    return GradientButton(
      label: 'Generate New',
      icon: Icons.auto_awesome,
      gradient: AppThemePremium.secondaryGradient,
      isFullWidth: true,
      isLoading: _isGenerating,
      onPressed: _handleGenerate,
    );
  }

  Future<void> _handleGenerate() async {
    if (_isGenerating) return;
    
    setState(() => _isGenerating = true);
    HapticFeedback.heavyImpact();
    
    await ref.read(suggestionStateProvider.notifier).generateToday();
    _showSnackBar('🎉 New suggestions generated!');
    
    setState(() => _isGenerating = false);
  }

  Future<void> _handleReroll(MealType mealType) async {
    await ref.read(suggestionStateProvider.notifier).reroll(mealType);
    _showSnackBar('✨ ${mealType.displayName} rerolled!');
  }
}

