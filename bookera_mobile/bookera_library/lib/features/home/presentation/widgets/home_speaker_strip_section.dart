import 'package:flutter/material.dart';

import '../../data/models/home_models.dart';

class HomeSpeakerStripSection extends StatelessWidget {
  final List<HomePublicBook> books;

  const HomeSpeakerStripSection({
    super.key,
    required this.books,
  });

  @override
  Widget build(BuildContext context) {
    final speakers = _buildSpeakers(books).take(6).toList();
    final theme = Theme.of(context);

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
                _SectionHeading(
                  title: 'Speaker',
                  subtitle: 'Sorotan penulis yang sering muncul di katalog publik.',
                ),
                const SizedBox(height: 16),
                if (speakers.isEmpty)
                  _EmptySpeakerState(theme: theme)
                else
                  SizedBox(
                    height: 122,
                    child: ListView.separated(
                      scrollDirection: Axis.horizontal,
                      itemCount: speakers.length,
                      separatorBuilder: (context, index) => const SizedBox(width: 12),
                      itemBuilder: (context, index) {
                        final speaker = speakers[index];
                        return _SpeakerCard(speaker: speaker);
                      },
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  List<_SpeakerSpotlight> _buildSpeakers(List<HomePublicBook> sourceBooks) {
    final speakers = <String, _SpeakerSpotlight>{};

    for (final book in sourceBooks) {
      final author = book.author.trim();
      if (author.isEmpty) {
        continue;
      }

      final key = author.toLowerCase();
      final current = speakers[key];
      if (current == null) {
        speakers[key] = _SpeakerSpotlight(
          name: author,
          publisher: book.publisher,
          category: book.primaryCategoryLabel,
          booksCount: 1,
        );
      } else {
        speakers[key] = current.copyWith(
          booksCount: current.booksCount + 1,
        );
      }
    }

    return speakers.values.toList();
  }
}

class _SpeakerSpotlight {
  final String name;
  final String publisher;
  final String category;
  final int booksCount;

  const _SpeakerSpotlight({
    required this.name,
    required this.publisher,
    required this.category,
    required this.booksCount,
  });

  _SpeakerSpotlight copyWith({
    String? name,
    String? publisher,
    String? category,
    int? booksCount,
  }) {
    return _SpeakerSpotlight(
      name: name ?? this.name,
      publisher: publisher ?? this.publisher,
      category: category ?? this.category,
      booksCount: booksCount ?? this.booksCount,
    );
  }
}

class _SpeakerCard extends StatelessWidget {
  final _SpeakerSpotlight speaker;

  const _SpeakerCard({required this.speaker});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final initials = speaker.name
        .split(' ')
        .where((part) => part.trim().isNotEmpty)
        .take(2)
        .map((part) => part.trim()[0].toUpperCase())
        .join();

    final colors = [
      theme.colorScheme.primary.withOpacity(0.14),
      theme.colorScheme.primaryContainer.withOpacity(0.26),
    ];

    return Container(
      width: 220,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(22),
        gradient: LinearGradient(
          colors: colors,
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        border: Border.all(
          color: theme.colorScheme.primary.withOpacity(0.12),
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: theme.colorScheme.primary.withOpacity(0.18),
            ),
            child: Center(
              child: Text(
                initials.isEmpty ? '?' : initials,
                style: theme.textTheme.titleMedium?.copyWith(
                  color: theme.colorScheme.primary,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  speaker.name,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: theme.textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  speaker.publisher,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children: [
                    _SpeakerChip(label: speaker.category),
                    _SpeakerChip(label: '${speaker.booksCount} buku'),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _SpeakerChip extends StatelessWidget {
  final String label;

  const _SpeakerChip({required this.label});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.7),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: theme.textTheme.labelSmall?.copyWith(
          fontWeight: FontWeight.w700,
          color: theme.colorScheme.onSurface,
        ),
      ),
    );
  }
}

class _SectionHeading extends StatelessWidget {
  final String title;
  final String subtitle;

  const _SectionHeading({
    required this.title,
    required this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
          decoration: BoxDecoration(
            color: theme.colorScheme.primary.withOpacity(0.08),
            borderRadius: BorderRadius.circular(999),
          ),
          child: Text(
            title,
            style: theme.textTheme.labelMedium?.copyWith(
              color: theme.colorScheme.primary,
              fontWeight: FontWeight.w800,
              letterSpacing: 0.35,
            ),
          ),
        ),
        const SizedBox(height: 10),
        Text(
          subtitle,
          style: theme.textTheme.bodyMedium?.copyWith(
            color: theme.colorScheme.onSurfaceVariant,
            height: 1.45,
          ),
        ),
      ],
    );
  }
}

class _EmptySpeakerState extends StatelessWidget {
  final ThemeData theme;

  const _EmptySpeakerState({required this.theme});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: theme.colorScheme.primary.withOpacity(0.06),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: theme.colorScheme.primary.withOpacity(0.10),
        ),
      ),
      child: Text(
        'Belum ada data penulis untuk ditampilkan.',
        style: theme.textTheme.bodyMedium?.copyWith(
          color: theme.colorScheme.onSurfaceVariant,
        ),
      ),
    );
  }
}
