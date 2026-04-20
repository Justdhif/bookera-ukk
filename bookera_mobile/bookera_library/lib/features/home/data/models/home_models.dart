class HomePublicCategory {
  final int id;
  final String slug;
  final String name;
  final String? description;
  final String? icon;

  const HomePublicCategory({
    required this.id,
    required this.slug,
    required this.name,
    required this.description,
    required this.icon,
  });

  factory HomePublicCategory.fromJson(Map<String, dynamic> json) {
    return HomePublicCategory(
      id: _asInt(json['id']),
      slug: _asString(json['slug']),
      name: _asString(json['name']),
      description: _asNullableString(json['description']),
      icon: _asNullableString(json['icon']),
    );
  }
}

class HomePublicBook {
  final int id;
  final String title;
  final String slug;
  final String author;
  final String publisher;
  final String? description;
  final String coverImage;
  final double averageRating;
  final int reviewsCount;
  final int favoritesCount;
  final int totalCopies;
  final int availableCopies;
  final double? price;
  final List<HomePublicCategory> categories;

  const HomePublicBook({
    required this.id,
    required this.title,
    required this.slug,
    required this.author,
    required this.publisher,
    required this.description,
    required this.coverImage,
    required this.averageRating,
    required this.reviewsCount,
    required this.favoritesCount,
    required this.totalCopies,
    required this.availableCopies,
    required this.price,
    required this.categories,
  });

  factory HomePublicBook.fromJson(Map<String, dynamic> json) {
    final rawCategories = _extractList(json['categories']);

    return HomePublicBook(
      id: _asInt(json['id']),
      title: _asString(json['title']),
      slug: _asString(json['slug']),
      author: _asString(json['author']),
      publisher: _asString(json['publisher']),
      description: _asNullableString(json['description']),
      coverImage: _asString(json['cover_image']),
      averageRating: _asDouble(json['average_rating']),
      reviewsCount: _asInt(json['reviews_count']),
      favoritesCount: _asInt(json['favorites_count']),
      totalCopies: _asInt(json['total_copies']),
      availableCopies: _asInt(json['available_copies']),
      price: _asNullableDouble(json['price']),
      categories: rawCategories
          .whereType<Map<String, dynamic>>()
          .map(HomePublicCategory.fromJson)
          .toList(),
    );
  }

  String get primaryCategoryLabel {
    if (categories.isEmpty) {
      return 'Umum';
    }

    return categories.first.name;
  }

  bool get isAvailable => availableCopies > 0;
}

class HomeBorrowBookCopy {
  final int id;
  final String copyCode;
  final String status;
  final HomePublicBook? book;

  const HomeBorrowBookCopy({
    required this.id,
    required this.copyCode,
    required this.status,
    required this.book,
  });

  factory HomeBorrowBookCopy.fromJson(Map<String, dynamic> json) {
    final rawBook = _asMap(json['book']);

    return HomeBorrowBookCopy(
      id: _asInt(json['id']),
      copyCode: _asString(json['copy_code']),
      status: _asString(json['status']),
      book: rawBook == null ? null : HomePublicBook.fromJson(rawBook),
    );
  }
}

class HomeBorrowDetail {
  final int id;
  final int borrowId;
  final int bookCopyId;
  final String status;
  final String? note;
  final HomeBorrowBookCopy? bookCopy;

  const HomeBorrowDetail({
    required this.id,
    required this.borrowId,
    required this.bookCopyId,
    required this.status,
    required this.note,
    required this.bookCopy,
  });

  factory HomeBorrowDetail.fromJson(Map<String, dynamic> json) {
    final rawBookCopy = _asMap(json['book_copy']) ?? _asMap(json['bookCopy']);

    return HomeBorrowDetail(
      id: _asInt(json['id']),
      borrowId: _asInt(json['borrow_id']),
      bookCopyId: _asInt(json['book_copy_id']),
      status: _asString(json['status']),
      note: _asNullableString(json['note']),
      bookCopy: rawBookCopy == null ? null : HomeBorrowBookCopy.fromJson(rawBookCopy),
    );
  }
}

class HomeBorrow {
  final int id;
  final String borrowCode;
  final String? qrCodeUrl;
  final DateTime? borrowDate;
  final DateTime? returnDate;
  final String status;
  final List<HomeBorrowDetail> borrowDetails;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const HomeBorrow({
    required this.id,
    required this.borrowCode,
    required this.qrCodeUrl,
    required this.borrowDate,
    required this.returnDate,
    required this.status,
    required this.borrowDetails,
    required this.createdAt,
    required this.updatedAt,
  });

  factory HomeBorrow.fromJson(Map<String, dynamic> json) {
    final rawDetails = _extractList(json['borrow_details']);

    return HomeBorrow(
      id: _asInt(json['id']),
      borrowCode: _asString(json['borrow_code']),
      qrCodeUrl: _asNullableString(json['qr_code_url']),
      borrowDate: _asDateTime(json['borrow_date']),
      returnDate: _asDateTime(json['return_date']),
      status: _asString(json['status']),
      borrowDetails: rawDetails
          .whereType<Map<String, dynamic>>()
          .map(HomeBorrowDetail.fromJson)
          .toList(),
      createdAt: _asDateTime(json['created_at']),
      updatedAt: _asDateTime(json['updated_at']),
    );
  }

  bool get isOpen => status == 'open';

  bool get isClosed => status == 'close';

  String get primaryBookTitle {
    final titles = bookTitles;
    if (titles.isNotEmpty) {
      return titles.first;
    }

    return 'Kode $borrowCode';
  }

  String get primaryCoverImage {
    for (final detail in borrowDetails) {
      final coverImage = detail.bookCopy?.book?.coverImage;
      if (coverImage != null && coverImage.isNotEmpty) {
        return coverImage;
      }
    }

    return '';
  }

  List<String> get bookTitles {
    final titles = <String>[];

    for (final detail in borrowDetails) {
      final title = detail.bookCopy?.book?.title.trim();
      if (title == null || title.isEmpty || titles.contains(title)) {
        continue;
      }
      titles.add(title);
    }

    return titles;
  }

  int get bookCount => borrowDetails.length;
}

class HomeFeedData {
  final List<HomePublicBook> books;
  final List<HomePublicCategory> categories;
  final List<HomeBorrow> borrows;

  const HomeFeedData({
    required this.books,
    required this.categories,
    required this.borrows,
  });

  const HomeFeedData.empty()
      : books = const [],
        categories = const [],
        borrows = const [];

  int get activeBorrowCount => borrows.where((borrow) => borrow.isOpen).length;

  int get availableBookCount => books.where((book) => book.isAvailable).length;

  HomePublicBook? get heroBook => books.isNotEmpty ? books.first : null;

  List<HomePublicBook> get featuredBooks {
    final items = [...books];

    items.sort((left, right) {
      final ratingCompare = right.averageRating.compareTo(left.averageRating);
      if (ratingCompare != 0) {
        return ratingCompare;
      }

      final reviewsCompare = right.reviewsCount.compareTo(left.reviewsCount);
      if (reviewsCompare != 0) {
        return reviewsCompare;
      }

      return right.availableCopies.compareTo(left.availableCopies);
    });

    return items.take(6).toList();
  }

  List<String> get speakerNames {
    final seen = <String>{};
    final speakers = <String>[];
    final sourceBooks = featuredBooks.isNotEmpty ? featuredBooks : books;

    for (final book in sourceBooks) {
      final author = book.author.trim();
      final key = author.toLowerCase();

      if (author.isEmpty || seen.contains(key)) {
        continue;
      }

      seen.add(key);
      speakers.add(author);

      if (speakers.length >= 8) {
        break;
      }
    }

    return speakers;
  }
}

Map<String, dynamic>? _asMap(dynamic value) {
  if (value is Map<String, dynamic>) {
    return value;
  }

  return null;
}

List<dynamic> _extractList(dynamic value) {
  if (value is List) {
    return value;
  }

  final mapValue = _asMap(value);
  if (mapValue != null) {
    final nested = mapValue['data'];
    if (nested is List) {
      return nested;
    }
  }

  return const [];
}

String _asString(dynamic value, [String fallback = '']) {
  if (value == null) {
    return fallback;
  }

  return value.toString();
}

String? _asNullableString(dynamic value) {
  if (value == null) {
    return null;
  }

  final stringValue = value.toString();
  if (stringValue.isEmpty) {
    return null;
  }

  return stringValue;
}

int _asInt(dynamic value) {
  if (value is int) {
    return value;
  }

  if (value is double) {
    return value.toInt();
  }

  return int.tryParse(value?.toString() ?? '') ?? 0;
}

double _asDouble(dynamic value) {
  if (value is double) {
    return value;
  }

  if (value is int) {
    return value.toDouble();
  }

  return double.tryParse(value?.toString() ?? '') ?? 0;
}

double? _asNullableDouble(dynamic value) {
  if (value == null) {
    return null;
  }

  if (value is double) {
    return value;
  }

  if (value is int) {
    return value.toDouble();
  }

  return double.tryParse(value.toString());
}

DateTime? _asDateTime(dynamic value) {
  if (value == null) {
    return null;
  }

  if (value is DateTime) {
    return value;
  }

  return DateTime.tryParse(value.toString());
}
