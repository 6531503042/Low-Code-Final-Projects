import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../providers/suggestion_providers.dart';
import '../models/suggestion_models.dart';
import '../../../core/app_router.dart';
import 'package:go_router/go_router.dart';
import '../../auth/providers/auth_providers.dart';
import 'dart:ui';
import 'dart:math' as math;

/// Premium dashboard with modern design
class DashboardScreen extends ConsumerStatefulWidget {
  const DashboardScreen({super.key});

  @override
  ConsumerState<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends ConsumerState<DashboardScreen>
    with TickerProviderStateMixin {
  late AnimationController _heroController;
  late AnimationController _cardController;
  late Animation<double> _heroAnimation;
  String _selectedTab = 'all';

  @override
  void initState() {
    super.initState();
    _heroController = AnimationController(
      duration: const Duration(milliseconds: 1200),
      vsync: this,
    );
    _cardController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );
    _heroAnimation = CurvedAnimation(
      parent: _heroController,
      curve: Curves.easeOutCubic,
    );

    WidgetsBinding.instance.addPostFrameCallback((_) async {
      await ref.read(suggestionStateProvider.notifier).getToday();
      _heroController.forward();
      _cardController.forward();
    });
  }

  @override
  void dispose() {
    _heroController.dispose();
    _cardController.dispose();
    super.dispose();
  }

  void _showSnackBar(String message, {bool isError = false}) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: isError
            ? const Color(0xFFFF6B6B)
            : const Color(0xFF4ECDC4),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        margin: const EdgeInsets.all(16),
      ),
    );
  }

  Future<void> _handleLogout() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.exit_to_app, size: 48, color: Color(0xFFFF6B6B)),
              const SizedBox(height: 16),
              const Text(
                'Logout',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Text(
                'Are you sure you want to logout?',
                style: TextStyle(color: Colors.grey[600]),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => Navigator.pop(context, false),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
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
                        backgroundColor: const Color(0xFFFF6B6B),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
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
      backgroundColor: const Color(0xFFF8F9FA),
      extendBodyBehindAppBar: true,
      body: Stack(
        children: [
          // Animated gradient background
          _buildAnimatedBackground(),

          // Main content
          SafeArea(
            child: CustomScrollView(
              physics: const BouncingScrollPhysics(),
              slivers: [
                // Custom app bar
                _buildSliverAppBar(),

                // Content
                SliverToBoxAdapter(
                  child: suggestionState.when(
                    data: (suggestion) => _buildContent(suggestion),
                    loading: () => _buildLoadingState(),
                    error: (error, _) => _buildErrorState(error.toString()),
                  ),
                ),
              ],
            ),
          ),

          // Floating action button
          Positioned(
            right: 20,
            bottom: 20,
            child: _buildFloatingButton(),
          ),
        ],
      ),
    );
  }

  Widget _buildAnimatedBackground() {
    return AnimatedBuilder(
      animation: _heroAnimation,
      builder: (context, child) {
        return Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                Color.lerp(
                  const Color(0xFFE8F5E9),
                  const Color(0xFFFFF3E0),
                  _heroAnimation.value,
                )!,
                Color.lerp(
                  const Color(0xFFE3F2FD),
                  const Color(0xFFFCE4EC),
                  _heroAnimation.value,
                )!,
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildSliverAppBar() {
    return SliverAppBar(
      expandedHeight: 180,
      floating: false,
      pinned: true,
      backgroundColor: Colors.transparent,
      elevation: 0,
      flexibleSpace: FlexibleSpaceBar(
        background: Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [
                Colors.black.withOpacity(0.3),
                Colors.transparent,
              ],
            ),
          ),
          child: SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  FadeTransition(
                    opacity: _heroAnimation,
                    child: const Text(
                      'MeeRaiKin',
                      style: TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                        letterSpacing: -0.5,
                      ),
                    ),
                  ),
                  const SizedBox(height: 4),
                  FadeTransition(
                    opacity: _heroAnimation,
                    child: Text(
                      'Your personalized meal companion',
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.white.withOpacity(0.9),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
      actions: [
        PopupMenuButton<String>(
          icon: Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.2),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.more_vert, color: Colors.white),
          ),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          onSelected: (value) {
            if (value == 'preferences') {
              context.go('/preferences');
            } else if (value == 'schedules') {
              context.go('/schedules');
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
        const SizedBox(width: 8),
      ],
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
            color: isDestructive ? const Color(0xFFFF6B6B) : Colors.grey[700],
          ),
          const SizedBox(width: 12),
          Text(
            label,
            style: TextStyle(
              color: isDestructive ? const Color(0xFFFF6B6B) : Colors.grey[800],
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildContent(TodaySuggestion? suggestion) {
    if (suggestion == null) return _buildEmptyState();

    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Tab selector
          _buildTabSelector(),
          const SizedBox(height: 24),

          // Meal cards
          if (_selectedTab == 'all') ...[
            _buildMealCard(suggestion.breakfast, MealType.breakfast, 0),
            _buildMealCard(suggestion.lunch, MealType.lunch, 1),
            _buildMealCard(suggestion.dinner, MealType.dinner, 2),
          ] else if (_selectedTab == 'breakfast')
            _buildMealCard(suggestion.breakfast, MealType.breakfast, 0)
          else if (_selectedTab == 'lunch')
            _buildMealCard(suggestion.lunch, MealType.lunch, 0)
          else if (_selectedTab == 'dinner')
            _buildMealCard(suggestion.dinner, MealType.dinner, 0),

          const SizedBox(height: 100),
        ],
      ),
    );
  }

  Widget _buildTabSelector() {
    final tabs = [
      ('all', 'All Meals', Icons.restaurant_menu),
      ('breakfast', 'Breakfast', Icons.wb_sunny_outlined),
      ('lunch', 'Lunch', Icons.wb_sunny),
      ('dinner', 'Dinner', Icons.nights_stay_outlined),
    ];

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      physics: const BouncingScrollPhysics(),
      child: Row(
        children: tabs.map((tab) {
          final isSelected = _selectedTab == tab.$1;
          return Padding(
            padding: const EdgeInsets.only(right: 12),
            child: GestureDetector(
              onTap: () {
                HapticFeedback.lightImpact();
                setState(() => _selectedTab = tab.$1);
              },
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                curve: Curves.easeOutCubic,
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                decoration: BoxDecoration(
                  gradient: isSelected
                      ? const LinearGradient(
                          colors: [Color(0xFF667eea), Color(0xFF764ba2)],
                        )
                      : null,
                  color: isSelected ? null : Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: isSelected
                          ? const Color(0xFF667eea).withOpacity(0.3)
                          : Colors.black.withOpacity(0.05),
                      blurRadius: isSelected ? 12 : 8,
                      offset: Offset(0, isSelected ? 4 : 2),
                    ),
                  ],
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      tab.$3,
                      size: 20,
                      color: isSelected ? Colors.white : Colors.grey[700],
                    ),
                    const SizedBox(width: 8),
                    Text(
                      tab.$2,
                      style: TextStyle(
                        color: isSelected ? Colors.white : Colors.grey[700],
                        fontWeight: FontWeight.w600,
                        fontSize: 14,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildMealCard(MenuItem? item, MealType type, int index) {
    final colors = _getMealColors(type);

    return AnimatedBuilder(
      animation: _cardController,
      builder: (context, child) {
        final delay = index * 0.1;
        final value = (_cardController.value - delay).clamp(0.0, 1.0);
        final curve = Curves.easeOutCubic.transform(value);

        return Transform.translate(
          offset: Offset(0, 30 * (1 - curve)),
          child: Opacity(
            opacity: curve,
            child: child,
          ),
        );
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          boxShadow: [
            BoxShadow(
              color: colors.$1.withOpacity(0.15),
              blurRadius: 20,
              offset: const Offset(0, 10),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Image section
              if (item != null) _buildImageSection(item, type, colors),

              // Content section
              Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Header with meal type and reroll button
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: [colors.$1, colors.$2],
                            ),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Icon(
                            _getMealIcon(type),
                            color: Colors.white,
                            size: 20,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                type.displayName,
                                style: const TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              if (item != null)
                                Text(
                                  item.cuisine,
                                  style: TextStyle(
                                    fontSize: 13,
                                    color: colors.$1,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                            ],
                          ),
                        ),
                        _buildRerollButton(type, colors),
                      ],
                    ),

                    if (item != null) ...[
                      const SizedBox(height: 16),
                      Text(
                        item.title,
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          height: 1.3,
                        ),
                      ),
                      if (item.notes != null && item.notes!.isNotEmpty) ...[
                        const SizedBox(height: 8),
                        Text(
                          item.notes!,
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.grey[600],
                            height: 1.5,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                      const SizedBox(height: 16),
                      _buildChips(item, colors),
                    ] else
                      _buildEmptyMealState(type, colors),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildImageSection(MenuItem item, MealType type, (Color, Color) colors) {
    return Stack(
      children: [
        AspectRatio(
          aspectRatio: 16 / 9,
          child: CachedNetworkImage(
            imageUrl: _getImageUrl(item, type),
            fit: BoxFit.cover,
            placeholder: (context, url) => Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    colors.$1.withOpacity(0.3),
                    colors.$2.withOpacity(0.1),
                  ],
                ),
              ),
              child: Center(
                child: CircularProgressIndicator(
                  valueColor: AlwaysStoppedAnimation(colors.$1),
                ),
              ),
            ),
            errorWidget: (context, url, error) => Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [colors.$1.withOpacity(0.3), colors.$2.withOpacity(0.1)],
                ),
              ),
              child: Icon(Icons.restaurant, size: 64, color: colors.$1.withOpacity(0.5)),
            ),
          ),
        ),
        Positioned(
          bottom: 0,
          left: 0,
          right: 0,
          child: Container(
            height: 80,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Colors.transparent,
                  Colors.black.withOpacity(0.5),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildRerollButton(MealType type, (Color, Color) colors) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () async {
          HapticFeedback.mediumImpact();
          await ref.read(suggestionStateProvider.notifier).reroll(type);
          _showSnackBar('✨ ${type.displayName} rerolled!');
        },
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [colors.$1, colors.$2],
            ),
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              BoxShadow(
                color: colors.$1.withOpacity(0.3),
                blurRadius: 8,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: const Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.casino, color: Colors.white, size: 16),
              SizedBox(width: 6),
              Text(
                'Reroll',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 13,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildChips(MenuItem item, (Color, Color) colors) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: [
        if (item.budgetMin != null || item.budgetMax != null)
          _buildChip(
            '฿${item.budgetMin ?? 0}-${item.budgetMax ?? 0}',
            Icons.attach_money,
            colors.$1,
          ),
        ...item.allergens.map(
          (allergen) => _buildChip(
            allergen,
            Icons.warning_amber_rounded,
            const Color(0xFFFF6B6B),
          ),
        ),
      ],
    );
  }

  Widget _buildChip(String label, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: color,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyMealState(MealType type, (Color, Color) colors) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 32),
      child: Column(
        children: [
          Icon(
            Icons.add_circle_outline,
            size: 48,
            color: colors.$1.withOpacity(0.3),
          ),
          const SizedBox(height: 12),
          Text(
            'No ${type.displayName.toLowerCase()} yet',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: Colors.grey[400],
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Tap reroll to get a suggestion',
            style: TextStyle(
              fontSize: 13,
              color: Colors.grey[400],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFloatingButton() {
    return AnimatedBuilder(
      animation: _heroAnimation,
      builder: (context, child) {
        return Transform.scale(
          scale: _heroAnimation.value,
          child: child,
        );
      },
      child: Material(
        elevation: 8,
        borderRadius: BorderRadius.circular(20),
        child: Container(
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFFf093fb), Color(0xFFf5576c)],
            ),
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFFf5576c).withOpacity(0.4),
                blurRadius: 20,
                offset: const Offset(0, 10),
              ),
            ],
          ),
          child: Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: () async {
                HapticFeedback.heavyImpact();
                await ref.read(suggestionStateProvider.notifier).generateToday();
                _showSnackBar('🎉 New suggestions generated!');
              },
              borderRadius: BorderRadius.circular(20),
              child: const Padding(
                padding: EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.auto_awesome, color: Colors.white, size: 24),
                    SizedBox(width: 8),
                    Text(
                      'Generate New',
                      style: TextStyle(
                        color: Colors.white,
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
      ),
    );
  }

  Widget _buildLoadingState() {
    return Container(
      padding: const EdgeInsets.all(60),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          TweenAnimationBuilder(
            tween: Tween<double>(begin: 0, end: 2 * math.pi),
            duration: const Duration(seconds: 2),
            builder: (context, double value, child) {
              return Transform.rotate(
                angle: value,
                child: Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF667eea), Color(0xFF764ba2)],
                    ),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Icon(Icons.restaurant, color: Colors.white, size: 40),
                ),
              );
            },
            onEnd: () => setState(() {}),
          ),
          const SizedBox(height: 32),
          const Text(
            'Preparing your meals...',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          Text(
            'Finding the perfect dishes for you',
            style: TextStyle(color: Colors.grey[600]),
          ),
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
              gradient: const LinearGradient(
                colors: [Color(0xFFffecd2), Color(0xFFfcb69f)],
              ),
              borderRadius: BorderRadius.circular(32),
            ),
            child: const Icon(Icons.restaurant_menu, size: 80, color: Colors.white),
          ),
          const SizedBox(height: 32),
          const Text(
            'No meals yet',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),
          Text(
            'Tap the button below to generate your personalized meal suggestions',
            style: TextStyle(fontSize: 15, color: Colors.grey[600]),
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
              color: const Color(0xFFFF6B6B).withOpacity(0.1),
              borderRadius: BorderRadius.circular(32),
            ),
            child: const Icon(Icons.error_outline, size: 80, color: Color(0xFFFF6B6B)),
          ),
          const SizedBox(height: 32),
          const Text(
            'Oops!',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),
          Text(
            error,
            style: TextStyle(fontSize: 15, color: Colors.grey[600]),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: () => ref.read(suggestionStateProvider.notifier).refresh(),
            icon: const Icon(Icons.refresh),
            label: const Text('Try Again'),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFFF6B6B),
              padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            ),
          ),
        ],
      ),
    );
  }

  (Color, Color) _getMealColors(MealType type) {
    switch (type) {
      case MealType.breakfast:
        return (const Color(0xFFffa751), const Color(0xFFffe259));
      case MealType.lunch:
        return (const Color(0xFF4facfe), const Color(0xFF00f2fe));
      case MealType.dinner:
        return (const Color(0xFF667eea), const Color(0xFF764ba2));
    }
  }

  IconData _getMealIcon(MealType type) {
    switch (type) {
      case MealType.breakfast:
        return Icons.wb_sunny_outlined;
      case MealType.lunch:
        return Icons.wb_sunny;
      case MealType.dinner:
        return Icons.nights_stay_outlined;
    }
  }

  String _getImageUrl(MenuItem item, MealType type) {
    if (item.imageUrl != null && item.imageUrl!.isNotEmpty) {
      return item.imageUrl!;
    }
    final searchTerm = item.cuisine.isNotEmpty
        ? '${item.cuisine} ${type.displayName} food'
        : '${type.displayName} food';
    return 'https://source.unsplash.com/800x600/?${Uri.encodeComponent(searchTerm)}&${DateTime.now().millisecondsSinceEpoch}';
  }
}
