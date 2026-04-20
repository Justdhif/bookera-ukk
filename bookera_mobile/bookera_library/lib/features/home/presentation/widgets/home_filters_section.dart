import 'package:flutter/material.dart';

import '../../data/models/home_models.dart';

class HomeFiltersSection extends StatelessWidget {
  final List<HomePublicCategory> categories;
  final int? selectedCategoryId;
  final double? selectedRating;
  final ValueChanged<int?> onCategorySelected;
  final ValueChanged<double?> onRatingSelected;
  final VoidCallback? onReset;

  const HomeFiltersSection({
    super.key,
    required this.categories,
    required this.selectedCategoryId,
    required this.selectedRating,
    required this.onCategorySelected,
    required this.onRatingSelected,
    this.onReset,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final hasActiveFilters = selectedCategoryId != null || selectedRating != null;

    return SliverToBoxAdapter(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(18, 0, 18, 16),
        child: Card(
          clipBehavior: Clip.antiAlias,
          child: Padding(
            padding: const EdgeInsets.all(18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 10,
                              vertical: 6,
                            ),
                            decoration: BoxDecoration(
                              color: theme.colorScheme.primary.withOpacity(0.08),
                              borderRadius: BorderRadius.circular(999),
                            ),
                            child: Text(
                              'Filter koleksi',
                              style: theme.textTheme.labelMedium?.copyWith(
                                color: theme.colorScheme.primary,
                                fontWeight: FontWeight.w800,
                                letterSpacing: 0.35,
                              ),
                            ),
                          ),
                          const SizedBox(height: 10),
                          Text(
                            'Saring buku langsung dari API berdasarkan kategori dan rating.',
                            style: theme.textTheme.bodyMedium?.copyWith(
                              color: theme.colorScheme.onSurfaceVariant,
                              height: 1.45,
                            ),
                          ),
                        ],
                      ),
                    ),
                    if (hasActiveFilters && onReset != null) ...[
                      const SizedBox(width: 12),
                      TextButton.icon(
                        onPressed: onReset,
                        icon: const Icon(Icons.restart_alt_rounded, size: 18),
                        label: const Text('Reset'),
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 18),
                Text(
                  'Kategori',
                  style: theme.textTheme.labelLarge?.copyWith(
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 10),
                SizedBox(
                  height: 44,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    itemCount: categories.length + 1,
                    separatorBuilder: (context, index) => const SizedBox(width: 8),
                    itemBuilder: (context, index) {
                      if (index == 0) {
                        return _FilterChip(
                          label: 'Semua',
                          selected: selectedCategoryId == null,
                          onSelected: () => onCategorySelected(null),
                        );
                      }

                      final category = categories[index - 1];
                      return _FilterChip(
                        label: category.name,
                        selected: selectedCategoryId == category.id,
                        onSelected: () => onCategorySelected(category.id),
                      );
                    },
                  ),
                ),
                const SizedBox(height: 18),
                Text(
                  'Rating',
                  style: theme.textTheme.labelLarge?.copyWith(
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 10),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    _FilterChip(
                      label: 'Semua',
                      selected: selectedRating == null,
                      onSelected: () => onRatingSelected(null),
                    ),
                    _RatingChip(
                      label: '4+ bintang',
                      selected: selectedRating == 4,
                      onSelected: () => onRatingSelected(4),
                    ),
                    _RatingChip(
                      label: '5 bintang',
                      selected: selectedRating == 5,
                      onSelected: () => onRatingSelected(5),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onSelected;

  const _FilterChip({
    required this.label,
    required this.selected,
    required this.onSelected,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return ChoiceChip(
      label: Text(label),
      selected: selected,
      onSelected: (_) => onSelected(),
      showCheckmark: false,
      selectedColor: theme.colorScheme.primary.withOpacity(0.14),
      backgroundColor: theme.colorScheme.surfaceContainerHighest.withOpacity(0.55),
      labelStyle: theme.textTheme.labelLarge?.copyWith(
        color: selected ? theme.colorScheme.primary : theme.colorScheme.onSurface,
        fontWeight: FontWeight.w700,
      ),
      side: BorderSide(
        color: selected
            ? theme.colorScheme.primary.withOpacity(0.28)
            : theme.colorScheme.outlineVariant.withOpacity(0.72),
      ),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(999),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
    );
  }
}

class _RatingChip extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onSelected;

  const _RatingChip({
    required this.label,
    required this.selected,
    required this.onSelected,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return ActionChip(
      label: Text(label),
      onPressed: onSelected,
      backgroundColor: selected
          ? theme.colorScheme.primary.withOpacity(0.14)
          : theme.colorScheme.surfaceContainerHighest.withOpacity(0.55),
      labelStyle: theme.textTheme.labelLarge?.copyWith(
        color: selected ? theme.colorScheme.primary : theme.colorScheme.onSurface,
        fontWeight: FontWeight.w700,
      ),
      side: BorderSide(
        color: selected
            ? theme.colorScheme.primary.withOpacity(0.28)
            : theme.colorScheme.outlineVariant.withOpacity(0.72),
      ),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(999),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
    );
  }
}
