import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../models/suggestion_models.dart';
import '../../../core/app_theme_premium.dart';
import 'gradient_button.dart';

/// Premium meal card component with minimal elegant design
class PremiumMealCard extends StatefulWidget {
  final MenuItem? menuItem;
  final MealType mealType;
  final VoidCallback onReroll;

  const PremiumMealCard({
    super.key,
    required this.menuItem,
    required this.mealType,
    required this.onReroll,
  });

  @override
  State<PremiumMealCard> createState() => _PremiumMealCardState();
}

class _PremiumMealCardState extends State<PremiumMealCard>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOut),
    );
    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.1),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _controller, curve: Curves.easeOutCubic));

    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _fadeAnimation,
      child: SlideTransition(
        position: _slideAnimation,
        child: Container(
          margin: const EdgeInsets.symmetric(
            horizontal: AppThemePremium.spacing4,
            vertical: AppThemePremium.spacing3,
          ),
          decoration: BoxDecoration(
            color: AppThemePremium.cardWhite,
            borderRadius: AppThemePremium.cardRadius,
            border: Border.all(
              color: AppThemePremium.cardBorder,
              width: 1,
            ),
            boxShadow: AppThemePremium.cardShadow,
          ),
          child: ClipRRect(
            borderRadius: AppThemePremium.cardRadius,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header with meal type badge and reroll button
                _buildHeader(),
                
                // Image section
                if (widget.menuItem != null) _buildImage(),
                
                // Content section
                Padding(
                  padding: const EdgeInsets.all(AppThemePremium.spacing4),
                  child: widget.menuItem != null
                      ? _buildContent()
                      : _buildEmptyState(),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    final gradient = AppThemePremium.getMealGradient(widget.mealType.apiValue);
    final icon = AppThemePremium.getMealIcon(widget.mealType.apiValue);

    return Container(
      padding: const EdgeInsets.all(AppThemePremium.spacing4),
      child: Row(
        children: [
          // Meal type badge
          Container(
            padding: const EdgeInsets.symmetric(
              horizontal: 12,
              vertical: 6,
            ),
            decoration: BoxDecoration(
              gradient: gradient,
              borderRadius: const BorderRadius.all(Radius.circular(12)),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  icon,
                  style: const TextStyle(fontSize: 16),
                ),
                const SizedBox(width: 6),
                Text(
                  widget.mealType.displayName,
                  style: const TextStyle(
                    fontFamily: AppThemePremium.fontFamily,
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: Colors.white,
                  ),
                ),
              ],
            ),
          ),
          const Spacer(),
          // Reroll button
          PillButton(
            label: 'Reroll',
            icon: Icons.casino,
            gradient: gradient,
            onPressed: widget.onReroll,
          ),
        ],
      ),
    );
  }

  Widget _buildImage() {
    if (widget.menuItem == null) return const SizedBox.shrink();

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: AppThemePremium.spacing4),
      child: AspectRatio(
        aspectRatio: 16 / 9,
        child: ClipRRect(
          borderRadius: AppThemePremium.imageRadius,
          child: CachedNetworkImage(
            imageUrl: _getImageUrl(),
            fit: BoxFit.cover,
            fadeInDuration: const Duration(milliseconds: 300),
            placeholder: (context, url) => _buildImagePlaceholder(),
            errorWidget: (context, url, error) => _buildImagePlaceholder(),
          ),
        ),
      ),
    );
  }

  Widget _buildImagePlaceholder() {
    final gradient = AppThemePremium.getMealGradient(widget.mealType.apiValue);
    
    return Container(
      decoration: BoxDecoration(
        gradient: gradient,
      ),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.restaurant,
              size: 48,
              color: Colors.white.withOpacity(0.8),
            ),
            const SizedBox(height: 8),
            Text(
              '🍽️ Delicious',
              style: TextStyle(
                color: Colors.white.withOpacity(0.9),
                fontWeight: FontWeight.w600,
                fontSize: 16,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildContent() {
    if (widget.menuItem == null) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: AppThemePremium.spacing2),
        
        // Title
        Text(
          widget.menuItem!.title,
          style: AppThemePremium.h3,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
        ),
        
        const SizedBox(height: AppThemePremium.spacing1),
        
        // Cuisine
        Row(
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: AppThemePremium.primary.withOpacity(0.1),
                borderRadius: const BorderRadius.all(Radius.circular(8)),
              ),
              child: Text(
                widget.menuItem!.cuisine,
                style: AppThemePremium.caption.copyWith(
                  color: AppThemePremium.primary,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        ),
        
        if (widget.menuItem!.notes != null && widget.menuItem!.notes!.isNotEmpty) ...[
          const SizedBox(height: AppThemePremium.spacing2),
          Text(
            widget.menuItem!.notes!,
            style: AppThemePremium.body2,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        ],
        
        const SizedBox(height: AppThemePremium.spacing3),
        
        // Budget and allergens
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            // Budget chip
            if (widget.menuItem!.budgetMin != null || widget.menuItem!.budgetMax != null)
              _buildChip(
                icon: Icons.payments_outlined,
                label: '฿${widget.menuItem!.budgetMin ?? 0}-${widget.menuItem!.budgetMax ?? 0}',
                color: AppThemePremium.accent,
              ),
            
            // Allergen chips
            ...widget.menuItem!.allergens.map(
              (allergen) => _buildChip(
                icon: Icons.warning_amber_rounded,
                label: allergen,
                color: AppThemePremium.error,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildChip({
    required IconData icon,
    required String label,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: const BorderRadius.all(Radius.circular(10)),
        border: Border.all(
          color: color.withOpacity(0.3),
          width: 1,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              fontFamily: AppThemePremium.fontFamily,
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: color,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    final gradient = AppThemePremium.getMealGradient(widget.mealType.apiValue);
    
    return Container(
      padding: const EdgeInsets.all(AppThemePremium.spacing6),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: gradient,
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.add_circle_outline,
              size: 40,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: AppThemePremium.spacing3),
          Text(
            'No ${widget.mealType.displayName.toLowerCase()} yet',
            style: AppThemePremium.h3,
          ),
          const SizedBox(height: AppThemePremium.spacing1),
          Text(
            'Tap reroll to get a suggestion',
            style: AppThemePremium.body2,
          ),
        ],
      ),
    );
  }

  String _getImageUrl() {
    if (widget.menuItem?.imageUrl != null && widget.menuItem!.imageUrl!.isNotEmpty) {
      return widget.menuItem!.imageUrl!;
    }
    final searchTerm = widget.menuItem!.cuisine.isNotEmpty
        ? '${widget.menuItem!.cuisine} ${widget.mealType.displayName} food'
        : '${widget.mealType.displayName} food';
    return 'https://source.unsplash.com/800x600/?${Uri.encodeComponent(searchTerm)}&${DateTime.now().millisecondsSinceEpoch}';
  }
}

