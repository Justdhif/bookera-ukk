import 'dart:async';

import 'package:flutter/material.dart';

class HomeBannerCarouselSection extends StatefulWidget {
  const HomeBannerCarouselSection({super.key});

  @override
  State<HomeBannerCarouselSection> createState() =>
      _HomeBannerCarouselSectionState();
}

class _HomeBannerCarouselSectionState extends State<HomeBannerCarouselSection> {
  static const List<String> _bannerAssets = <String>[
    'assets/banner/banner-1.png',
    'assets/banner/banner-2.png',
    'assets/banner/banner-3.png',
  ];

  late final PageController _pageController;
  Timer? _timer;
  int _currentIndex = 0;

  @override
  void initState() {
    super.initState();
    _pageController = PageController(viewportFraction: 0.94);
    _startAutoPlay();
  }

  void _startAutoPlay() {
    _timer?.cancel();

    if (_bannerAssets.length < 2) {
      return;
    }

    _timer = Timer.periodic(const Duration(seconds: 5), (_) {
      if (!mounted || !_pageController.hasClients) {
        return;
      }

      final nextIndex = (_currentIndex + 1) % _bannerAssets.length;
      _pageController.animateToPage(
        nextIndex,
        duration: const Duration(milliseconds: 650),
        curve: Curves.easeOutCubic,
      );
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return SliverToBoxAdapter(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(18, 0, 18, 16),
        child: Column(
          children: [
            Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(28),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.10),
                    blurRadius: 28,
                    offset: const Offset(0, 14),
                  ),
                ],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(28),
                child: AspectRatio(
                  aspectRatio: 160 / 69,
                  child: PageView.builder(
                    controller: _pageController,
                    onPageChanged: (index) {
                      setState(() {
                        _currentIndex = index;
                      });
                    },
                    itemCount: _bannerAssets.length,
                    itemBuilder: (context, index) {
                      return Image.asset(
                        _bannerAssets[index],
                        fit: BoxFit.cover,
                        filterQuality: FilterQuality.high,
                        errorBuilder: (context, error, stackTrace) {
                          return Container(
                            color: theme.colorScheme.primary.withOpacity(0.08),
                            alignment: Alignment.center,
                            child: Text(
                              'Banner ${index + 1}',
                              style: theme.textTheme.titleMedium?.copyWith(
                                color: theme.colorScheme.primary,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                          );
                        },
                      );
                    },
                  ),
                ),
              ),
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(_bannerAssets.length, (index) {
                final isActive = index == _currentIndex;

                return AnimatedContainer(
                  duration: const Duration(milliseconds: 220),
                  margin: const EdgeInsets.symmetric(horizontal: 4),
                  width: isActive ? 22 : 8,
                  height: 8,
                  decoration: BoxDecoration(
                    color: isActive
                        ? theme.colorScheme.primary
                        : theme.colorScheme.primary.withOpacity(0.18),
                    borderRadius: BorderRadius.circular(999),
                  ),
                );
              }),
            ),
          ],
        ),
      ),
    );
  }
}
