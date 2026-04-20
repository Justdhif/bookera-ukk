import 'package:flutter/material.dart';

import '../../../../core/constants/app_assets.dart';
import '../../data/models/home_models.dart';

class HomeHeaderSection extends StatelessWidget {
  final HomeFeedData data;
  final bool isLoading;

  const HomeHeaderSection({
    super.key,
    required this.data,
    required this.isLoading,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final heroBook = data.heroBook;
    final booksCount = isLoading ? '--' : data.books.length.toString();
    final categoriesCount = isLoading ? '--' : data.categories.length.toString();
    final activeBorrowsCount = isLoading ? '--' : data.activeBorrowCount.toString();

    return SliverToBoxAdapter(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(18, 12, 18, 16),
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(32),
            gradient: LinearGradient(
              colors: [
                const Color(0xFF052E1C),
                colorScheme.primary,
                const Color(0xFF0F172A),
              ],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            boxShadow: [
              BoxShadow(
                color: colorScheme.primary.withOpacity(0.18),
                blurRadius: 36,
                offset: const Offset(0, 18),
              ),
            ],
          ),
          child: Stack(
            children: [
              Positioned(
                right: -24,
                top: -24,
                child: _GlowCircle(color: Colors.white.withOpacity(0.10), size: 120),
              ),
              Positioned(
                left: -36,
                bottom: -36,
                child: _GlowCircle(color: Colors.white.withOpacity(0.08), size: 140),
              ),
              Padding(
                padding: const EdgeInsets.all(20),
                child: LayoutBuilder(
                  builder: (context, constraints) {
                    final isWide = constraints.maxWidth >= 720;

                    final headerContent = Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.14),
                            borderRadius: BorderRadius.circular(999),
                            border: Border.all(
                              color: Colors.white.withOpacity(0.18),
                            ),
                          ),
                          child: Text(
                            'Katalog publik Bookera',
                            style: theme.textTheme.labelMedium?.copyWith(
                              color: Colors.white.withOpacity(0.92),
                              fontWeight: FontWeight.w700,
                              letterSpacing: 0.4,
                            ),
                          ),
                        ),
                        const SizedBox(height: 14),
                        Text(
                          'Buku, filter, dan timeline langsung dari API.',
                          style: theme.textTheme.headlineSmall?.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.w800,
                            height: 1.1,
                          ),
                        ),
                        const SizedBox(height: 10),
                        Text(
                          isLoading
                              ? 'Memuat koleksi terbaru dan data peminjaman kamu...'
                              : heroBook == null
                                  ? 'Jelajahi katalog publik, kategori aktif, dan peminjaman yang sedang berjalan.'
                                  : 'Buku unggulan hari ini: ${heroBook.title}. Jelajahi koleksi publik, kategori aktif, dan peminjaman yang sedang berjalan.',
                          style: theme.textTheme.bodyMedium?.copyWith(
                            color: Colors.white.withOpacity(0.84),
                            height: 1.5,
                          ),
                        ),
                        const SizedBox(height: 18),
                        Wrap(
                          spacing: 10,
                          runSpacing: 10,
                          children: [
                            _StatPill(
                              icon: Icons.menu_book_rounded,
                              label: 'Buku',
                              value: booksCount,
                            ),
                            _StatPill(
                              icon: Icons.grid_view_rounded,
                              label: 'Kategori',
                              value: categoriesCount,
                            ),
                            _StatPill(
                              icon: Icons.schedule_rounded,
                              label: 'Pinjam aktif',
                              value: activeBorrowsCount,
                            ),
                          ],
                        ),
                      ],
                    );

                    final logo = Container(
                      width: 96,
                      height: 96,
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(28),
                        border: Border.all(
                          color: Colors.white.withOpacity(0.16),
                        ),
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Image.asset(
                          bookeraLogoAssetPath,
                          fit: BoxFit.contain,
                        ),
                      ),
                    );

                    if (isWide) {
                      return Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          logo,
                          const SizedBox(width: 20),
                          Expanded(child: headerContent),
                        ],
                      );
                    }

                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        logo,
                        const SizedBox(height: 18),
                        headerContent,
                      ],
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _StatPill extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _StatPill({
    required this.icon,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.12),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: Colors.white.withOpacity(0.16),
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: Colors.white),
          const SizedBox(width: 10),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                value,
                style: theme.textTheme.titleMedium?.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.w800,
                ),
              ),
              Text(
                label,
                style: theme.textTheme.labelSmall?.copyWith(
                  color: Colors.white.withOpacity(0.78),
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _GlowCircle extends StatelessWidget {
  final Color color;
  final double size;

  const _GlowCircle({
    required this.color,
    required this.size,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: color,
      ),
    );
  }
}
