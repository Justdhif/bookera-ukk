import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../data/models/home_models.dart';

class HomeDailyTimelineSection extends StatefulWidget {
  final List<HomeBorrow> borrows;

  const HomeDailyTimelineSection({
    super.key,
    required this.borrows,
  });

  @override
  State<HomeDailyTimelineSection> createState() =>
      _HomeDailyTimelineSectionState();
}

class _HomeDailyTimelineSectionState extends State<HomeDailyTimelineSection> {
  int _weekOffset = 0;
  late DateTime _selectedDate;
  late final DateTime _today = _startOfDay(DateTime.now());

  @override
  void initState() {
    super.initState();
    _selectedDate = _today;
  }

  List<DateTime> _daysForOffset(int offset) {
    final monday = _getMonday(_today.add(Duration(days: offset * 7)));
    return List.generate(
      7,
      (index) => _startOfDay(monday.add(Duration(days: index))),
    );
  }

  List<DateTime> get _currentDays => _daysForOffset(_weekOffset);

  void _changeWeek(int delta) {
    final currentWeekdayIndex = (_selectedDate.weekday - 1).clamp(0, 6);

    setState(() {
      _weekOffset += delta;
      final days = _currentDays;
      _selectedDate = days[currentWeekdayIndex];
    });
  }

  void _resetWeek() {
    setState(() {
      _weekOffset = 0;
      _selectedDate = _today;
    });
  }

  List<_TimelineEvent> _eventsForDay(DateTime date) {
    final selectedDay = _startOfDay(date);
    final events = <_TimelineEvent>[];

    for (final borrow in widget.borrows) {
      final startDate = _startOfDay(borrow.borrowDate ?? _today);
      final endDate = _startOfDay(borrow.returnDate ?? startDate);

      if (_isSameDay(selectedDay, startDate)) {
        events.add(_TimelineEvent(borrow: borrow, type: _TimelineEventType.start));
        continue;
      }

      if (_isSameDay(selectedDay, endDate)) {
        events.add(_TimelineEvent(borrow: borrow, type: _TimelineEventType.end));
        continue;
      }

      if (selectedDay.isAfter(startDate) && selectedDay.isBefore(endDate)) {
        events.add(_TimelineEvent(borrow: borrow, type: _TimelineEventType.active));
      }
    }

    events.sort((left, right) {
      final priorityCompare = _priority(left.type).compareTo(_priority(right.type));
      if (priorityCompare != 0) {
        return priorityCompare;
      }

      final leftDate = left.borrow.borrowDate ?? _today;
      final rightDate = right.borrow.borrowDate ?? _today;
      return leftDate.compareTo(rightDate);
    });

    return events;
  }

  int _priority(_TimelineEventType type) {
    switch (type) {
      case _TimelineEventType.start:
        return 0;
      case _TimelineEventType.active:
        return 1;
      case _TimelineEventType.end:
        return 2;
    }
  }

  String _weekLabel() {
    final days = _currentDays;
    final start = days.first;
    final end = days.last;
    final formatter = DateFormat('d MMM yyyy');

    return '${formatter.format(start)} - ${formatter.format(end)}';
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final events = _eventsForDay(_selectedDate);
    final activeBorrows = widget.borrows.where((borrow) => borrow.isOpen).toList();

    return SliverToBoxAdapter(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(18, 0, 18, 16),
        child: Card(
          clipBehavior: Clip.antiAlias,
          child: LayoutBuilder(
            builder: (context, constraints) {
              final isCompact = constraints.maxWidth < 560;
              final isTiny = constraints.maxWidth < 390;
              final innerPadding = EdgeInsets.all(isCompact ? 16 : 18);
              final dayBubbleWidth = isTiny ? 52.0 : (isCompact ? 58.0 : 72.0);
              final showBubbleLabel = !isCompact;

              final titleBlock = Column(
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
                      'Daily Timeline',
                      style: theme.textTheme.labelMedium?.copyWith(
                        color: theme.colorScheme.primary,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.35,
                      ),
                    ),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    'Jadwal peminjaman hari ini',
                    style: theme.textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    _weekLabel(),
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: theme.colorScheme.onSurfaceVariant,
                      height: 1.45,
                    ),
                  ),
                ],
              );

              final controls = Wrap(
                spacing: 8,
                runSpacing: 8,
                alignment: isCompact ? WrapAlignment.start : WrapAlignment.end,
                crossAxisAlignment: WrapCrossAlignment.center,
                children: [
                  _TimelineActionButton(
                    icon: Icons.chevron_left_rounded,
                    onPressed: () => _changeWeek(-1),
                    compact: isCompact,
                  ),
                  TextButton(
                    onPressed: _resetWeek,
                    child: Text(
                      _weekOffset == 0 ? 'Hari ini' : 'Kembali ke hari ini',
                    ),
                  ),
                  _TimelineActionButton(
                    icon: Icons.chevron_right_rounded,
                    onPressed: () => _changeWeek(1),
                    compact: isCompact,
                  ),
                ],
              );

              final header = isCompact
                  ? Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        titleBlock,
                        const SizedBox(height: 14),
                        controls,
                      ],
                    )
                  : Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(child: titleBlock),
                        const SizedBox(width: 12),
                        controls,
                      ],
                    );

              return Padding(
                padding: innerPadding,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    header,
                    const SizedBox(height: 16),
                    SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        children: List.generate(_currentDays.length, (index) {
                          final day = _currentDays[index];
                          final state = _dayState(day);

                          return Padding(
                            padding: EdgeInsets.only(
                              right: index == _currentDays.length - 1 ? 0 : 10,
                            ),
                            child: _DayBubble(
                              date: day,
                              state: state,
                              selected: _isSameDay(day, _selectedDate),
                              onTap: () {
                                setState(() {
                                  _selectedDate = day;
                                });
                              },
                              width: dayBubbleWidth,
                              showLabel: showBubbleLabel,
                            ),
                          );
                        }),
                      ),
                    ),
                    const SizedBox(height: 16),
                    if (events.isEmpty)
                      _EmptyTimelineState(activeBorrowsCount: activeBorrows.length)
                    else
                      Column(
                        children: events.map((event) {
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 12),
                            child: _TimelineEventCard(
                              event: event,
                              compact: isCompact,
                            ),
                          );
                        }).toList(),
                      ),
                    const SizedBox(height: 4),
                    Wrap(
                      spacing: 14,
                      runSpacing: 10,
                      children: const [
                        _LegendDot(
                          color: Color(0xFF10B981),
                          label: 'Mulai pinjam',
                        ),
                        _LegendDot(
                          color: Color(0xFFF59E0B),
                          label: 'Berjalan',
                        ),
                        _LegendDot(
                          color: Color(0xFFEF4444),
                          label: 'Jatuh tempo',
                        ),
                      ],
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ),
    );
  }

  _DayState _dayState(DateTime date) {
    final selectedEvents = _eventsForDay(date);

    if (selectedEvents.any((event) => event.type == _TimelineEventType.end)) {
      return _DayState.deadline;
    }

    if (selectedEvents.any((event) => event.type == _TimelineEventType.start)) {
      return _DayState.start;
    }

    if (selectedEvents.any((event) => event.type == _TimelineEventType.active)) {
      return _DayState.active;
    }

    if (_isSameDay(date, _today)) {
      return _DayState.today;
    }

    if (date.isBefore(_today)) {
      return _DayState.past;
    }

    return _DayState.future;
  }
}

class _TimelineEvent {
  final HomeBorrow borrow;
  final _TimelineEventType type;

  const _TimelineEvent({
    required this.borrow,
    required this.type,
  });

  DateTime get date {
    switch (type) {
      case _TimelineEventType.start:
        return borrow.borrowDate ?? DateTime.now();
      case _TimelineEventType.active:
        return borrow.borrowDate ?? DateTime.now();
      case _TimelineEventType.end:
        return borrow.returnDate ?? DateTime.now();
    }
  }
}

enum _TimelineEventType {
  start,
  active,
  end,
}

enum _DayState {
  today,
  past,
  future,
  active,
  deadline,
  start,
}

DateTime _startOfDay(DateTime date) {
  return DateTime(date.year, date.month, date.day);
}

DateTime _getMonday(DateTime date) {
  final day = date.weekday;
  final diff = day == DateTime.sunday ? -6 : 1 - day;
  return _startOfDay(date.add(Duration(days: diff)));
}

bool _isSameDay(DateTime left, DateTime right) {
  return _startOfDay(left) == _startOfDay(right);
}

class _DayBubble extends StatelessWidget {
  final DateTime date;
  final _DayState state;
  final bool selected;
  final VoidCallback onTap;
  final double width;
  final bool showLabel;

  const _DayBubble({
    required this.date,
    required this.state,
    required this.selected,
    required this.onTap,
    required this.width,
    required this.showLabel,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final color = _stateColor(colorScheme);
    final dayNames = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
    final isToday = _isSameDay(date, DateTime.now());

    return InkWell(
      borderRadius: BorderRadius.circular(22),
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        width: width,
        padding: EdgeInsets.symmetric(
          vertical: showLabel ? 12 : 10,
          horizontal: width <= 58 ? 6 : 8,
        ),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(22),
          color: selected ? color.withOpacity(0.14) : colorScheme.surfaceContainerHighest.withOpacity(0.38),
          border: Border.all(
            color: selected ? color.withOpacity(0.28) : colorScheme.outlineVariant.withOpacity(0.50),
            width: selected ? 1.2 : 1,
          ),
          boxShadow: selected
              ? [
                  BoxShadow(
                    color: color.withOpacity(0.12),
                    blurRadius: 16,
                    offset: const Offset(0, 8),
                  ),
                ]
              : null,
        ),
        child: Column(
          children: [
            Text(
              dayNames[date.weekday - 1],
              style: theme.textTheme.labelMedium?.copyWith(
                color: selected ? colorScheme.primary : colorScheme.onSurfaceVariant,
                fontWeight: FontWeight.w800,
                fontSize: showLabel ? null : 10,
              ),
            ),
            SizedBox(height: showLabel ? 8 : 6),
            Text(
              date.day.toString(),
              style: theme.textTheme.titleLarge?.copyWith(
                color: selected ? colorScheme.primary : colorScheme.onSurface,
                fontWeight: FontWeight.w800,
                fontSize: showLabel ? null : 16,
              ),
            ),
            SizedBox(height: showLabel ? 8 : 6),
            Container(
              width: 8,
              height: 8,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: color,
                boxShadow: [
                  BoxShadow(
                    color: color.withOpacity(0.35),
                    blurRadius: 8,
                    offset: const Offset(0, 0),
                  ),
                ],
              ),
            ),
            if (showLabel) ...[
              const SizedBox(height: 6),
              Text(
                isToday ? 'Hari ini' : _shortDate(date),
                textAlign: TextAlign.center,
                style: theme.textTheme.labelSmall?.copyWith(
                  color: colorScheme.onSurfaceVariant,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Color _stateColor(ColorScheme colorScheme) {
    switch (state) {
      case _DayState.today:
        return colorScheme.primary;
      case _DayState.active:
        return const Color(0xFFF59E0B);
      case _DayState.deadline:
        return const Color(0xFFEF4444);
      case _DayState.start:
        return const Color(0xFF10B981);
      case _DayState.past:
        return colorScheme.outlineVariant;
      case _DayState.future:
        return colorScheme.secondary;
    }
  }
}

class _TimelineEventCard extends StatelessWidget {
  final _TimelineEvent event;
  final bool compact;

  const _TimelineEventCard({
    required this.event,
    required this.compact,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final borrow = event.borrow;
    final books = borrow.bookTitles;
    final statusLabel = _statusLabel(event.type);
    final statusColor = _statusColor(event.type);
    final dateLabel = _dateRangeLabel(borrow);

    return Container(
      padding: EdgeInsets.all(compact ? 12 : 14),
      decoration: BoxDecoration(
        color: colorScheme.surfaceContainerHighest.withOpacity(0.34),
        borderRadius: BorderRadius.circular(compact ? 18 : 20),
        border: Border.all(
          color: colorScheme.outlineVariant.withOpacity(0.54),
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: compact ? 42 : 48,
            height: compact ? 42 : 48,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(compact ? 14 : 16),
              color: statusColor.withOpacity(0.12),
            ),
            child: Icon(
              _statusIcon(event.type),
              color: statusColor,
              size: compact ? 22 : 24,
            ),
          ),
          SizedBox(width: compact ? 12 : 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        borrow.primaryBookTitle,
                        maxLines: compact ? 2 : 1,
                        overflow: TextOverflow.ellipsis,
                        style: theme.textTheme.titleSmall?.copyWith(
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ),
                    SizedBox(width: compact ? 6 : 8),
                    Container(
                      padding: EdgeInsets.symmetric(
                        horizontal: compact ? 7 : 8,
                        vertical: compact ? 4 : 5,
                      ),
                      decoration: BoxDecoration(
                        color: statusColor.withOpacity(0.10),
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: Text(
                        statusLabel,
                        style: theme.textTheme.labelSmall?.copyWith(
                          color: statusColor,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  books.isEmpty ? borrow.borrowCode : books.join(', '),
                  maxLines: compact ? 1 : 2,
                  overflow: TextOverflow.ellipsis,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: colorScheme.onSurfaceVariant,
                    height: 1.45,
                  ),
                ),
                SizedBox(height: compact ? 8 : 10),
                Wrap(
                  spacing: compact ? 6 : 8,
                  runSpacing: 8,
                  children: [
                    _InfoPill(
                      icon: Icons.numbers_rounded,
                      label: borrow.borrowCode,
                    ),
                    _InfoPill(
                      icon: Icons.calendar_today_rounded,
                      label: dateLabel,
                    ),
                    _InfoPill(
                      icon: Icons.library_books_rounded,
                      label: '${borrow.bookCount} buku',
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _statusLabel(_TimelineEventType type) {
    switch (type) {
      case _TimelineEventType.start:
        return 'Mulai';
      case _TimelineEventType.active:
        return 'Berjalan';
      case _TimelineEventType.end:
        return 'Jatuh tempo';
    }
  }

  Color _statusColor(_TimelineEventType type) {
    switch (type) {
      case _TimelineEventType.start:
        return const Color(0xFF10B981);
      case _TimelineEventType.active:
        return const Color(0xFFF59E0B);
      case _TimelineEventType.end:
        return const Color(0xFFEF4444);
    }
  }

  IconData _statusIcon(_TimelineEventType type) {
    switch (type) {
      case _TimelineEventType.start:
        return Icons.play_circle_rounded;
      case _TimelineEventType.active:
        return Icons.timelapse_rounded;
      case _TimelineEventType.end:
        return Icons.event_busy_rounded;
    }
  }

  String _dateRangeLabel(HomeBorrow borrow) {
    final formatter = DateFormat('d MMM');
    final borrowDate = borrow.borrowDate;
    final returnDate = borrow.returnDate;

    if (borrowDate == null && returnDate == null) {
      return 'Tanggal belum tersedia';
    }

    if (borrowDate == null) {
      return 'Sampai ${formatter.format(returnDate!)}';
    }

    if (returnDate == null) {
      return 'Mulai ${formatter.format(borrowDate)}';
    }

    return '${formatter.format(borrowDate)} - ${formatter.format(returnDate)}';
  }
}

class _InfoPill extends StatelessWidget {
  final IconData icon;
  final String label;

  const _InfoPill({
    required this.icon,
    required this.label,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.72),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: theme.colorScheme.primary),
          const SizedBox(width: 6),
          Text(
            label,
            style: theme.textTheme.labelSmall?.copyWith(
              fontWeight: FontWeight.w700,
              color: theme.colorScheme.onSurface,
            ),
          ),
        ],
      ),
    );
  }
}

class _TimelineActionButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onPressed;
  final bool compact;

  const _TimelineActionButton({
    required this.icon,
    required this.onPressed,
    required this.compact,
  });

  @override
  Widget build(BuildContext context) {
    return IconButton.filledTonal(
      onPressed: onPressed,
      icon: Icon(icon, size: compact ? 18 : 20),
      visualDensity: compact ? VisualDensity.compact : VisualDensity.standard,
      padding: EdgeInsets.all(compact ? 8 : 10),
      constraints: BoxConstraints.tightFor(
        width: compact ? 40 : 44,
        height: compact ? 40 : 44,
      ),
    );
  }
}

class _EmptyTimelineState extends StatelessWidget {
  final int activeBorrowsCount;

  const _EmptyTimelineState({required this.activeBorrowsCount});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: theme.colorScheme.primary.withOpacity(0.06),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: theme.colorScheme.primary.withOpacity(0.10),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Tidak ada event untuk tanggal ini.',
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            activeBorrowsCount == 0
                ? 'Kamu belum punya peminjaman aktif yang perlu dipantau.'
                : 'Pilih tanggal lain untuk melihat start, active, atau deadline peminjaman.',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
              height: 1.45,
            ),
          ),
        ],
      ),
    );
  }
}

class _LegendDot extends StatelessWidget {
  final Color color;
  final String label;

  const _LegendDot({
    required this.color,
    required this.label,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 10,
          height: 10,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: color,
          ),
        ),
        const SizedBox(width: 8),
        Text(
          label,
          style: theme.textTheme.labelSmall?.copyWith(
            fontWeight: FontWeight.w700,
            color: theme.colorScheme.onSurfaceVariant,
          ),
        ),
      ],
    );
  }
}

String _shortDate(DateTime date) {
  return DateFormat('d MMM').format(date);
}
