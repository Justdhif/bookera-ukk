class User {
  final int id;
  final String name;
  final String email;
  final String? slug;
  final String? avatar;

  User({
    required this.id,
    required this.name,
    required this.email,
    this.slug,
    this.avatar,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    final profile = _asMap(json['profile']);
    final resolvedName = _asString(
      json['name'],
      fallback: _asString(
        profile?['full_name'],
        fallback: _emailLocalPart(_asString(json['email'])),
      ),
    );

    return User(
      id: _asInt(json['id']),
      name: resolvedName,
      email: _asString(json['email']),
      slug: _asNullableString(json['slug']),
      avatar: _asNullableString(json['avatar']) ??
          _asNullableString(profile?['avatar']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'slug': slug,
      'avatar': avatar,
    };
  }
}

class AuthResponse {
  final User user;
  final String token;

  AuthResponse({
    required this.user,
    required this.token,
  });

  factory AuthResponse.fromJson(Map<String, dynamic> json) {
    return AuthResponse(
      user: User.fromJson(_asMap(json['user']) ?? const <String, dynamic>{}),
      token: _asString(json['token']),
    );
  }
}

Map<String, dynamic>? _asMap(dynamic value) {
  if (value is Map<String, dynamic>) {
    return value;
  }

  if (value is Map) {
    return Map<String, dynamic>.from(value);
  }

  return null;
}

String _asString(dynamic value, {String fallback = ''}) {
  if (value == null) {
    return fallback;
  }

  final stringValue = value.toString();
  return stringValue.isEmpty ? fallback : stringValue;
}

String? _asNullableString(dynamic value) {
  if (value == null) {
    return null;
  }

  final stringValue = value.toString();
  return stringValue.isEmpty ? null : stringValue;
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

String _emailLocalPart(String email) {
  final parts = email.split('@');
  if (parts.isEmpty || parts.first.isEmpty) {
    return 'Bookera User';
  }

  return parts.first;
}
