import 'package:dio/dio.dart';

import '../../../../core/network/dio_client.dart';
import '../models/home_models.dart';

class HomeRepository {
  final Dio _dio;

  HomeRepository({Dio? dio}) : _dio = dio ?? DioClient.instance;

  Future<HomeFeedData> fetchHomeFeed({
    int booksPerPage = 24,
    int categoriesPerPage = 100,
    List<int>? categoryIds,
    double? rating,
    String? search,
  }) async {
    final results = await Future.wait<dynamic>([
      _fetchBooks(
        perPage: booksPerPage,
        categoryIds: categoryIds,
        rating: rating,
        search: search,
      ),
      _fetchCategories(perPage: categoriesPerPage),
      _fetchBorrows(),
    ]);

    return HomeFeedData(
      books: results[0] as List<HomePublicBook>,
      categories: results[1] as List<HomePublicCategory>,
      borrows: results[2] as List<HomeBorrow>,
    );
  }

  Future<List<HomePublicBook>> _fetchBooks({
    required int perPage,
    List<int>? categoryIds,
    double? rating,
    String? search,
  }) async {
    final queryParameters = <String, dynamic>{
      'per_page': perPage,
    };

    final trimmedSearch = search?.trim();
    if (trimmedSearch != null && trimmedSearch.isNotEmpty) {
      queryParameters['search'] = trimmedSearch;
    }

    if (categoryIds != null && categoryIds.isNotEmpty) {
      queryParameters['category_ids'] = categoryIds.join(',');
    }

    if (rating != null) {
      queryParameters['rating'] = rating;
    }

    final response = await _dio.get(
      '/books',
      queryParameters: queryParameters,
    );

    return _parseBooks(response.data);
  }

  Future<List<HomePublicCategory>> _fetchCategories({
    required int perPage,
  }) async {
    final response = await _dio.get(
      '/categories',
      queryParameters: {
        'per_page': perPage,
      },
    );

    return _parseCategories(response.data);
  }

  Future<List<HomeBorrow>> _fetchBorrows() async {
    try {
      final response = await _dio.get('/my-borrows');
      return _parseBorrows(response.data);
    } on DioException catch (error) {
      final statusCode = error.response?.statusCode;
      if (statusCode == 401 || statusCode == 403) {
        return const [];
      }

      rethrow;
    }
  }

  List<HomePublicBook> _parseBooks(dynamic responseBody) {
    final items = _extractItems(responseBody);

    return items
        .whereType<Map<String, dynamic>>()
        .map(HomePublicBook.fromJson)
        .toList();
  }

  List<HomePublicCategory> _parseCategories(dynamic responseBody) {
    final items = _extractItems(responseBody);

    return items
        .whereType<Map<String, dynamic>>()
        .map(HomePublicCategory.fromJson)
        .toList();
  }

  List<HomeBorrow> _parseBorrows(dynamic responseBody) {
    final items = _extractItems(responseBody);

    return items
        .whereType<Map<String, dynamic>>()
        .map(HomeBorrow.fromJson)
        .toList();
  }

  List<dynamic> _extractItems(dynamic responseBody) {
    if (responseBody is! Map<String, dynamic>) {
      if (responseBody is List) {
        return responseBody;
      }

      return const [];
    }

    final data = responseBody['data'];
    if (data is List) {
      return data;
    }

    if (data is Map<String, dynamic>) {
      final nestedItems = data['data'];
      if (nestedItems is List) {
        return nestedItems;
      }
    }

    return const [];
  }
}
