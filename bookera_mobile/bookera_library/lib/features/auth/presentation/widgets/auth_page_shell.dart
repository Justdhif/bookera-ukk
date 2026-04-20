import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

import '../../../../core/constants/app_assets.dart';

class AuthFeature {
  final IconData icon;
  final String title;
  final String description;

  const AuthFeature({
    required this.icon,
    required this.title,
    required this.description,
  });
}

class AuthPageScaffold extends StatelessWidget {
  final String heroEyebrow;
  final String heroTitlePrefix;
  final String heroTitleAccent;
  final String heroDescription;
  final List<AuthFeature> features;
  final Widget formCard;

  const AuthPageScaffold({
    super.key,
    required this.heroEyebrow,
    required this.heroTitlePrefix,
    required this.heroTitleAccent,
    required this.heroDescription,
    required this.features,
    required this.formCard,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final primary = theme.colorScheme.primary;
    final secondary = theme.colorScheme.secondary;

    return Scaffold(
      body: Stack(
        children: [
          Positioned.fill(
            child: DecoratedBox(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: isDark
                      ? const [
                          Color(0xFF0B1120),
                          Color(0xFF020617),
                          Color(0xFF071B14),
                        ]
                      : [
                          primary.withOpacity(0.14),
                          Colors.white,
                          secondary.withOpacity(0.08),
                        ],
                ),
              ),
            ),
          ),
          Positioned(
            top: -140,
            right: -110,
            child: _GlowCircle(
              color: primary.withOpacity(isDark ? 0.12 : 0.08),
              size: 320,
            ),
          ),
          Positioned(
            bottom: -120,
            left: -90,
            child: _GlowCircle(
              color: secondary.withOpacity(isDark ? 0.1 : 0.06),
              size: 280,
            ),
          ),
          SafeArea(
            child: LayoutBuilder(
              builder: (context, constraints) {
                final isWide = constraints.maxWidth >= 980;

                return SingleChildScrollView(
                  child: ConstrainedBox(
                    constraints: BoxConstraints(
                      minHeight: constraints.maxHeight,
                    ),
                    child: Padding(
                      padding: EdgeInsets.symmetric(
                        horizontal: isWide ? 32 : 20,
                        vertical: isWide ? 28 : 20,
                      ),
                      child: Center(
                        child: ConstrainedBox(
                          constraints: const BoxConstraints(maxWidth: 1240),
                          child: isWide
                              ? Row(
                                  crossAxisAlignment: CrossAxisAlignment.center,
                                  children: [
                                    Expanded(
                                      flex: 5,
                                      child: _AuthHeroPanel(
                                        eyebrow: heroEyebrow,
                                        titlePrefix: heroTitlePrefix,
                                        titleAccent: heroTitleAccent,
                                        description: heroDescription,
                                        features: features,
                                      ),
                                    ),
                                    const SizedBox(width: 40),
                                    Expanded(
                                      flex: 4,
                                      child: formCard,
                                    ),
                                  ],
                                )
                              : Column(
                                  crossAxisAlignment: CrossAxisAlignment.stretch,
                                  children: [
                                    _AuthHeroPanel(
                                      eyebrow: heroEyebrow,
                                      titlePrefix: heroTitlePrefix,
                                      titleAccent: heroTitleAccent,
                                      description: heroDescription,
                                      features: features,
                                    ),
                                    const SizedBox(height: 24),
                                    formCard,
                                  ],
                                ),
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class AuthFormCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String description;
  final Widget child;
  final Gradient accentGradient;

  const AuthFormCard({
    super.key,
    required this.icon,
    required this.title,
    required this.description,
    required this.child,
    required this.accentGradient,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Container(
      decoration: BoxDecoration(
        color: isDark
            ? theme.colorScheme.surface.withOpacity(0.95)
            : Colors.white.withOpacity(0.94),
        borderRadius: BorderRadius.circular(32),
        border: Border.all(
          color: isDark
              ? Colors.white.withOpacity(0.06)
              : theme.colorScheme.primary.withOpacity(0.12),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(isDark ? 0.24 : 0.08),
            blurRadius: 32,
            offset: const Offset(0, 24),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(32),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(
              height: 5,
              decoration: BoxDecoration(gradient: accentGradient),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(28, 28, 28, 0),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 54,
                    height: 54,
                    decoration: BoxDecoration(
                      gradient: accentGradient,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: theme.colorScheme.primary.withOpacity(0.18),
                          blurRadius: 24,
                          offset: const Offset(0, 12),
                        ),
                      ],
                    ),
                    child: Icon(icon, color: Colors.white, size: 22),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          title,
                          style: theme.textTheme.headlineSmall?.copyWith(
                            fontWeight: FontWeight.w800,
                            color: theme.colorScheme.onSurface,
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          description,
                          style: theme.textTheme.bodyMedium?.copyWith(
                            color: theme.colorScheme.onSurface.withOpacity(0.68),
                            height: 1.5,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(28, 24, 28, 28),
              child: child,
            ),
          ],
        ),
      ),
    );
  }
}

class PasswordRequirementsBox extends StatelessWidget {
  final String password;
  final bool visible;

  const PasswordRequirementsBox({
    super.key,
    required this.password,
    required this.visible,
  });

  static bool isPasswordValid(String password) {
    return _requirementsMet(password).every((met) => met);
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 220),
      transitionBuilder: (child, animation) {
        return SizeTransition(
          sizeFactor: animation,
          axisAlignment: -1,
          child: FadeTransition(opacity: animation, child: child),
        );
      },
      child: visible
          ? _PasswordRequirementsContent(
              key: const ValueKey('password-requirements'),
              password: password,
            )
          : const SizedBox.shrink(key: ValueKey('password-requirements-empty')),
    );
  }
}

class _AuthHeroPanel extends StatelessWidget {
  final String eyebrow;
  final String titlePrefix;
  final String titleAccent;
  final String description;
  final List<AuthFeature> features;

  const _AuthHeroPanel({
    required this.eyebrow,
    required this.titlePrefix,
    required this.titleAccent,
    required this.description,
    required this.features,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final primary = theme.colorScheme.primary;

    return Container(
      padding: const EdgeInsets.all(28),
      decoration: BoxDecoration(
        color: isDark
            ? theme.colorScheme.surface.withOpacity(0.96)
            : Colors.white.withOpacity(0.86),
        borderRadius: BorderRadius.circular(32),
        border: Border.all(
          color: isDark
              ? Colors.white.withOpacity(0.06)
              : primary.withOpacity(0.12),
        ),
        boxShadow: [
          BoxShadow(
            color: primary.withOpacity(isDark ? 0.12 : 0.1),
            blurRadius: 36,
            offset: const Offset(0, 24),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _Pill(label: eyebrow),
          const SizedBox(height: 24),
          LayoutBuilder(
            builder: (context, constraints) {
              final compact = constraints.maxWidth < 540;
              final logo = _LogoBadge(size: compact ? 74 : 86);
              final title = Text.rich(
                TextSpan(
                  children: [
                    TextSpan(text: '$titlePrefix\n'),
                    TextSpan(
                      text: titleAccent,
                      style: TextStyle(color: primary),
                    ),
                  ],
                ),
                style: theme.textTheme.displaySmall?.copyWith(
                  fontWeight: FontWeight.w800,
                  height: 1.02,
                  fontSize: compact ? 34 : 42,
                ),
              );

              return compact
                  ? Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        logo,
                        const SizedBox(height: 18),
                        title,
                      ],
                    )
                  : Row(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        logo,
                        const SizedBox(width: 18),
                        Expanded(child: title),
                      ],
                    );
            },
          ),
          const SizedBox(height: 16),
          Text(
            description,
            style: theme.textTheme.bodyLarge?.copyWith(
              color: theme.colorScheme.onSurface.withOpacity(0.72),
              height: 1.6,
            ),
          ),
          const SizedBox(height: 28),
          LayoutBuilder(
            builder: (context, constraints) {
              final twoColumns = constraints.maxWidth >= 520;
              final itemWidth = twoColumns
                  ? (constraints.maxWidth - 12) / 2
                  : constraints.maxWidth;

              return Wrap(
                spacing: 12,
                runSpacing: 12,
                children: features
                    .map(
                      (feature) => SizedBox(
                        width: itemWidth,
                        child: _FeatureCard(feature: feature),
                      ),
                    )
                    .toList(),
              );
            },
          ),
        ],
      ),
    );
  }
}

class _FeatureCard extends StatelessWidget {
  final AuthFeature feature;

  const _FeatureCard({required this.feature});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        color: isDark
            ? Colors.white.withOpacity(0.03)
            : const Color(0xFFF8FAFC),
        border: Border.all(
          color: isDark
              ? Colors.white.withOpacity(0.05)
              : const Color(0xFFE2E8F0),
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: theme.colorScheme.primary.withOpacity(isDark ? 0.2 : 0.12),
              shape: BoxShape.circle,
            ),
            child: Icon(
              feature.icon,
              color: theme.colorScheme.primary,
              size: 16,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  feature.title,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w700,
                    color: theme.colorScheme.onSurface,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  feature.description,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.onSurface.withOpacity(0.65),
                    height: 1.35,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _PasswordRequirementsContent extends StatelessWidget {
  final String password;

  const _PasswordRequirementsContent({super.key, required this.password});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final requirements = [
      (
        label: 'At least 8 characters',
        met: password.length >= 8,
      ),
      (
        label: 'One uppercase letter',
        met: RegExp(r'[A-Z]').hasMatch(password),
      ),
      (
        label: 'One number',
        met: RegExp(r'[0-9]').hasMatch(password),
      ),
      (
        label: 'One special character',
        met: RegExp(r'[^a-zA-Z0-9]').hasMatch(password),
      ),
    ];

    final allMet = requirements.every((item) => item.met);

    return Container(
      margin: const EdgeInsets.only(top: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: allMet
            ? theme.colorScheme.primary.withOpacity(0.08)
            : theme.colorScheme.surface.withOpacity(0.7),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: allMet
              ? theme.colorScheme.primary.withOpacity(0.18)
              : theme.colorScheme.outlineVariant.withOpacity(0.8),
        ),
      ),
      child: LayoutBuilder(
        builder: (context, constraints) {
          final twoColumns = constraints.maxWidth >= 420;
          final itemWidth = twoColumns
              ? (constraints.maxWidth - 12) / 2
              : constraints.maxWidth;

          return Wrap(
            spacing: 12,
            runSpacing: 10,
            children: requirements
                .map(
                  (requirement) => SizedBox(
                    width: itemWidth,
                    child: _RequirementItem(
                      label: requirement.label,
                      met: requirement.met,
                    ),
                  ),
                )
                .toList(),
          );
        },
      ),
    );
  }
}

class _RequirementItem extends StatelessWidget {
  final String label;
  final bool met;

  const _RequirementItem({required this.label, required this.met});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 18,
          height: 18,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: met
                ? theme.colorScheme.primary
                : theme.colorScheme.onSurface.withOpacity(0.12),
          ),
          child: Icon(
            met ? Icons.check_rounded : Icons.close_rounded,
            size: 12,
            color: met
                ? Colors.white
                : theme.colorScheme.onSurface.withOpacity(0.45),
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            label,
            style: theme.textTheme.bodySmall?.copyWith(
              color: met
                  ? theme.colorScheme.primary
                  : theme.colorScheme.onSurface.withOpacity(0.62),
              fontWeight: met ? FontWeight.w600 : FontWeight.w500,
            ),
          ),
        ),
      ],
    );
  }
}

class _GlowCircle extends StatelessWidget {
  final Color color;
  final double size;

  const _GlowCircle({required this.color, required this.size});

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

class _Pill extends StatelessWidget {
  final String label;

  const _Pill({required this.label});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(999),
        color: theme.colorScheme.primary.withOpacity(0.12),
        border: Border.all(
          color: theme.colorScheme.primary.withOpacity(0.16),
        ),
      ),
      child: Text(
        label,
        style: theme.textTheme.labelMedium?.copyWith(
          color: theme.colorScheme.primary,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.2,
        ),
      ),
    );
  }
}

class _LogoBadge extends StatelessWidget {
  final double size;

  const _LogoBadge({required this.size});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(size * 0.28),
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            theme.colorScheme.primary,
            theme.colorScheme.secondary,
          ],
        ),
        boxShadow: [
          BoxShadow(
            color: theme.colorScheme.primary.withOpacity(0.22),
            blurRadius: 24,
            offset: const Offset(0, 14),
          ),
        ],
      ),
      padding: const EdgeInsets.all(12),
      child: Image.asset(
        bookeraLogoAssetPath,
        fit: BoxFit.contain,
        errorBuilder: (context, error, stackTrace) {
          return const Icon(
            FontAwesomeIcons.bookOpenReader,
            color: Colors.white,
            size: 30,
          );
        },
      ),
    );
  }
}

List<bool> _requirementsMet(String password) {
  return [
    password.length >= 8,
    RegExp(r'[A-Z]').hasMatch(password),
    RegExp(r'[0-9]').hasMatch(password),
    RegExp(r'[^a-zA-Z0-9]').hasMatch(password),
  ];
}