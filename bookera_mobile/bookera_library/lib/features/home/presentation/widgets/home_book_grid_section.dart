import 'package:flutter/material.dart';

import '../../data/models/home_models.dart';

class HomeBookGridSection extends StatelessWidget {
  final List<HomePublicBook> books;

  const HomeBookGridSection({
    super.key,
    required this.books,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return SliverToBoxAdapter(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(18, 0, 18, 24),
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
                              'Book Grid',
                              style: theme.textTheme.labelMedium?.copyWith(
                                color: theme.colorScheme.primary,
                                fontWeight: FontWeight.w800,
                                letterSpacing: 0.35,
                              ),
                            ),
                          ),
                          const SizedBox(height: 10),
                          Text(
                            books.isEmpty
                                ? 'Katalog buku'
                                : 'Katalog buku (${books.length})',
                            style: theme.textTheme.titleLarge?.copyWith(
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            'Grid buku publik langsung dari endpoint /books.',
                            style: theme.textTheme.bodyMedium?.copyWith(
                              color: theme.colorScheme.onSurfaceVariant,
                              height: 1.45,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 18),
                if (books.isEmpty)
                  _EmptyGridState(theme: theme)
                else
                  LayoutBuilder(
                    builder: (context, constraints) {
                      final crossAxisCount = _crossAxisCount(constraints.maxWidth);

                      return GridView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: books.length,
                        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: crossAxisCount,
                          crossAxisSpacing: 12,
                          mainAxisSpacing: 14,
                          childAspectRatio: 0.72,
                        ),
                        itemBuilder: (context, index) {
                          final book = books[index];
                          return _BookCard(book: book);
                        },
                      );
                    },
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  int _crossAxisCount(double width) {
    if (width >= 1200) {
      return 4;
    }

    if (width >= 900) {
      return 3;
    }

    if (width >= 560) {
      return 2;
    }

    return 2;
  }
}

class _BookCard extends StatelessWidget {
  final HomePublicBook book;

  const _BookCard({required this.book});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Container(
      decoration: BoxDecoration(
        color: colorScheme.surfaceContainerHighest.withOpacity(0.30),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(
          color: colorScheme.outlineVariant.withOpacity(0.50),
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            AspectRatio(
              aspectRatio: 3 / 4,
              child: ClipRRect(
                borderRadius: BorderRadius.circular(18),
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    Image.network(
                      book.coverImage,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) {
                        return Container(
                          color: colorScheme.primary.withOpacity(0.10),
                          child: Icon(
                            Icons.menu_book_rounded,
                            color: colorScheme.primary,
                            size: 42,
                          ),
                        );
                      },
                    ),
                    Positioned(
                      left: 10,
                      top: 10,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 5,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.black.withOpacity(0.52),
                          borderRadius: BorderRadius.circular(999),
                        ),
                        child: Text(
                          book.primaryCategoryLabel,
                          style: theme.textTheme.labelSmall?.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ),
                    Positioned(
                      right: 10,
                      top: 10,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 5,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.black.withOpacity(0.52),
                          borderRadius: BorderRadius.circular(999),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              Icons.star_rounded,
                              size: 13,
                              color: Colors.amber.shade300,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              book.averageRating > 0
                                  ? book.averageRating.toStringAsFixed(1)
                                  : '-',
                              style: theme.textTheme.labelSmall?.copyWith(
                                color: Colors.white,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 12),
            Text(
              book.title,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: theme.textTheme.titleSmall?.copyWith(
                fontWeight: FontWeight.w800,
                height: 1.2,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              '${book.author} · ${book.publisher}',
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: theme.textTheme.bodySmall?.copyWith(
                color: colorScheme.onSurfaceVariant,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 10),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                _TinyBadge(
                  icon: Icons.inventory_2_rounded,
                  label: '${book.availableCopies}/${book.totalCopies}',
                  color: book.isAvailable ? const Color(0xFF10B981) : const Color(0xFFEF4444),
                ),
                _TinyBadge(
                  icon: Icons.rate_review_rounded,
                  label: '${book.reviewsCount} ulasan',
                  color: colorScheme.primary,
                ),
              ],
            ),
            const Spacer(),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              decoration: BoxDecoration(
                color: colorScheme.primary.withOpacity(0.08),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Text(
                book.isAvailable ? 'Tersedia untuk dibaca' : 'Sedang habis',
                textAlign: TextAlign.center,
                style: theme.textTheme.labelMedium?.copyWith(
                  color: colorScheme.primary,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _TinyBadge extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;

  const _TinyBadge({
    required this.icon,
    required this.label,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.10),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 13, color: color),
          const SizedBox(width: 5),
          Text(
            label,
            style: theme.textTheme.labelSmall?.copyWith(
              color: color,
              fontWeight: FontWeight.w800,
            ),
          ),
        ],
      ),
    );
  }
}

class _EmptyGridState extends StatelessWidget {
  final ThemeData theme;

  const _EmptyGridState({required this.theme});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: theme.colorScheme.primary.withOpacity(0.06),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: theme.colorScheme.primary.withOpacity(0.10),
        ),
      ),
      child: Text(
        'Tidak ada buku yang cocok dengan filter saat ini.',
        style: theme.textTheme.bodyMedium?.copyWith(
          color: theme.colorScheme.onSurfaceVariant,
          height: 1.45,
        ),
      ),
    );
  }
}
