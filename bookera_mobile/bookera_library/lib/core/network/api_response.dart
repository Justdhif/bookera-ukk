class ApiResponse<T> {
  final T data;
  final String message;
  final bool success;

  ApiResponse({
    required this.data,
    required this.message,
    required this.success,
  });

  factory ApiResponse.fromJson(
    Map<String, dynamic> json,
    T Function(dynamic json) fromJsonT,
  ) {
    return ApiResponse(
      data: fromJsonT(json["data"]),
      message: json["message"] ?? "",
      success: json["success"] ?? true,
    );
  }
}