import 'package:flutter/material.dart';

import '../../data/models/home_models.dart';
import '../../data/repositories/home_repository.dart';
import '../widgets/home_banner_carousel_section.dart';
import '../widgets/home_book_grid_section.dart';
import '../widgets/home_daily_timeline_section.dart';
import '../widgets/home_filters_section.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final HomeRepository _repository = HomeRepository();

  int? _selectedCategoryId;
  double? _selectedRating;
  late Future<HomeFeedData> _feedFuture;

  @override
  void initState() {
    super.initState();
    _feedFuture = _loadFeed();
  }

  Future<HomeFeedData> _loadFeed() {
    return _repository.fetchHomeFeed(
      booksPerPage: 24,
      categoriesPerPage: 100,
      categoryIds: _selectedCategoryId == null
          ? null
          : <int>[_selectedCategoryId!],
      rating: _selectedRating,
    );
  }

  Future<void> _refreshFeed() async {
    setState(() {
      _feedFuture = _loadFeed();
    });

    try {
      await _feedFuture;
    } catch (_) {
      // The error state is rendered below if the refresh fails.
    }
  }

  void _toggleCategory(int? categoryId) {
    setState(() {
      _selectedCategoryId = _selectedCategoryId == categoryId ? null : categoryId;
      _feedFuture = _loadFeed();
    });
  }

  void _toggleRating(double? rating) {
    setState(() {
      _selectedRating = _selectedRating == rating ? null : rating;
      _feedFuture = _loadFeed();
    });
  }

  void _resetFilters() {
    setState(() {
      _selectedCategoryId = null;
      _selectedRating = null;
      _feedFuture = _loadFeed();
    });
  }

  @override
  Widget build(BuildContext context) {
    final background = Theme.of(context).colorScheme.surface;

    return Scaffold(
      backgroundColor: background,
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [
              Color(0xFFF8FBF8),
              Color(0xFFFFFFFF),
            ],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: SafeArea(
          child: FutureBuilder<HomeFeedData>(
            future: _feedFuture,
            builder: (context, snapshot) {
              final hasLoadedData = snapshot.hasData;

              if (snapshot.connectionState == ConnectionState.waiting &&
                  !hasLoadedData) {
                return _LoadingView(onRetry: _refreshFeed);
              }

              if (snapshot.hasError && !hasLoadedData) {
                return _ErrorView(
                  error: snapshot.error,
                  onRetry: _refreshFeed,
                );
              }

              final feedData = snapshot.data ?? const HomeFeedData.empty();

              return RefreshIndicator(
                onRefresh: _refreshFeed,
                child: CustomScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  slivers: [
                    const HomeBannerCarouselSection(),
                    HomeDailyTimelineSection(borrows: feedData.borrows),
                    HomeFiltersSection(
                      categories: feedData.categories,
                      selectedCategoryId: _selectedCategoryId,
                      selectedRating: _selectedRating,
                      onCategorySelected: _toggleCategory,
                      onRatingSelected: _toggleRating,
                      onReset: _resetFilters,
                    ),
                    HomeBookGridSection(books: feedData.books),
                  ],
                ),
              );
            },
          ),
        ),
      ),
    );
  }
}

class _LoadingView extends StatelessWidget {
  final Future<void> Function() onRetry;

  const _LoadingView({required this.onRetry});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Container(
          constraints: const BoxConstraints(maxWidth: 360),
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: theme.colorScheme.surface,
            borderRadius: BorderRadius.circular(28),
            border: Border.all(
              color: theme.colorScheme.outlineVariant.withOpacity(0.55),
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.04),
                blurRadius: 24,
                offset: const Offset(0, 12),
              ),
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              CircularProgressIndicator(
                color: theme.colorScheme.primary,
              ),
              const SizedBox(height: 16),
              Text(
                'Memuat katalog publik...',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Mengambil buku, kategori, dan timeline dari API Bookera.',
                textAlign: TextAlign.center,
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                  height: 1.45,
                ),
              ),
              const SizedBox(height: 18),
              TextButton.icon(
                onPressed: onRetry,
                icon: const Icon(Icons.refresh_rounded),
                label: const Text('Coba lagi'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ErrorView extends StatelessWidget {
  final Object? error;
  final Future<void> Function() onRetry;

  const _ErrorView({
    required this.error,
    required this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Container(
          constraints: const BoxConstraints(maxWidth: 420),
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: theme.colorScheme.surface,
            borderRadius: BorderRadius.circular(28),
            border: Border.all(
              color: theme.colorScheme.error.withOpacity(0.16),
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.04),
                blurRadius: 24,
                offset: const Offset(0, 12),
              ),
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              CircleAvatar(
                radius: 28,
                backgroundColor: theme.colorScheme.error.withOpacity(0.12),
                child: Icon(
                  Icons.cloud_off_rounded,
                  color: theme.colorScheme.error,
                ),
              ),
              const SizedBox(height: 16),
              Text(
                'Home belum bisa dimuat',
                textAlign: TextAlign.center,
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                error?.toString() ?? 'Terjadi kesalahan saat mengambil data API.',
                textAlign: TextAlign.center,
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                  height: 1.45,
                ),
              ),
              const SizedBox(height: 18),
              FilledButton.icon(
                onPressed: onRetry,
                icon: const Icon(Icons.refresh_rounded),
                label: const Text('Muat ulang'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
