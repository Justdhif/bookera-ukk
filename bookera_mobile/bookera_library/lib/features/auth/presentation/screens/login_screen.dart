import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:dio/dio.dart';
import 'package:go_router/go_router.dart';

import '../../data/repositories/auth_repository.dart';
import '../widgets/auth_page_shell.dart';

class LoginScreen extends HookWidget {
  const LoginScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final emailController = useTextEditingController();
    final passwordController = useTextEditingController();
    final isPasswordVisible = useState(false);
    final isLoading = useState(false);
    final theme = Theme.of(context);
    useListenable(emailController);
    useListenable(passwordController);

    final canSubmit =
        emailController.text.trim().isNotEmpty && passwordController.text.isNotEmpty;

    Future<void> handleSubmit() async {
      if (isLoading.value || !canSubmit) {
        return;
      }

      isLoading.value = true;
      final authRepository = AuthRepository();

      try {
        await authRepository.login(
          emailController.text.trim(),
          passwordController.text,
        );

        if (!context.mounted) {
          return;
        }

        context.goNamed('home');
      } on DioException catch (error) {
        if (!context.mounted) {
          return;
        }

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(_resolveLoginErrorMessage(error)),
            behavior: SnackBarBehavior.floating,
          ),
        );
      } catch (error) {
        if (!context.mounted) {
          return;
        }

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              error is FormatException
                  ? 'Unexpected response from server.'
                  : 'Login failed. Please try again.',
            ),
            behavior: SnackBarBehavior.floating,
          ),
        );
      } finally {
        if (context.mounted) {
          isLoading.value = false;
        }
      }
    }

    void showPlaceholder(String label) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('$label is not available yet.'),
          behavior: SnackBarBehavior.floating,
        ),
      );
    }

    return AuthPageScaffold(
      heroEyebrow: 'Bookera Library',
      heroTitlePrefix: 'Digital School',
      heroTitleAccent: 'Library',
      heroDescription:
          'Sign in to continue to Bookera Library and pick up right where you left off.',
      features: const [
        AuthFeature(
          icon: FontAwesomeIcons.bookOpenReader,
          title: 'Thousands of books',
          description: 'A growing catalog for every reader.',
        ),
        AuthFeature(
          icon: FontAwesomeIcons.graduationCap,
          title: 'Learning materials',
          description: 'Reference and study content in one place.',
        ),
        AuthFeature(
          icon: FontAwesomeIcons.users,
          title: 'Student collaboration',
          description: 'Share ideas and reading progress.',
        ),
        AuthFeature(
          icon: FontAwesomeIcons.globe,
          title: 'Access 24/7',
          description: 'Use Bookera across devices anytime.',
        ),
      ],
      formCard: AuthFormCard(
        icon: FontAwesomeIcons.rightToBracket,
        title: 'Welcome back',
        description: 'Use your Bookera account to access the library.',
        accentGradient: LinearGradient(
          colors: [theme.colorScheme.primary, theme.colorScheme.secondary],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              'Email Address',
              style: theme.textTheme.labelLarge?.copyWith(
                fontWeight: FontWeight.w700,
                color: theme.colorScheme.onSurface,
              ),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: emailController,
              keyboardType: TextInputType.emailAddress,
              textInputAction: TextInputAction.next,
              decoration: const InputDecoration(
                hintText: 'Enter your email',
                prefixIcon: Icon(FontAwesomeIcons.envelope, size: 18),
              ),
            ),
            const SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Password',
                  style: theme.textTheme.labelLarge?.copyWith(
                    fontWeight: FontWeight.w700,
                    color: theme.colorScheme.onSurface,
                  ),
                ),
                TextButton(
                  onPressed: isLoading.value ? null : () => showPlaceholder('Forgot password'),
                  style: TextButton.styleFrom(
                    padding: EdgeInsets.zero,
                    minimumSize: Size.zero,
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  ),
                  child: const Text('Forgot password?'),
                ),
              ],
            ),
            const SizedBox(height: 8),
            TextField(
              controller: passwordController,
              obscureText: !isPasswordVisible.value,
              textInputAction: TextInputAction.done,
              onSubmitted: (_) => handleSubmit(),
              decoration: InputDecoration(
                hintText: 'Enter your password',
                prefixIcon: const Icon(FontAwesomeIcons.lock, size: 18),
                suffixIcon: IconButton(
                  icon: Icon(
                    isPasswordVisible.value
                        ? FontAwesomeIcons.eyeSlash
                        : FontAwesomeIcons.eye,
                    size: 18,
                  ),
                  onPressed: isLoading.value
                      ? null
                      : () {
                          isPasswordVisible.value = !isPasswordVisible.value;
                        },
                ),
              ),
            ),
            const SizedBox(height: 28),
            SizedBox(
              height: 56,
              child: ElevatedButton(
                onPressed: isLoading.value || !canSubmit ? null : handleSubmit,
                child: isLoading.value
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2.4,
                          color: Colors.white,
                        ),
                      )
                    : const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text('Sign in'),
                          SizedBox(width: 10),
                          Icon(Icons.arrow_forward_rounded, size: 20),
                        ],
                      ),
              ),
            ),
            const SizedBox(height: 24),
            Wrap(
              alignment: WrapAlignment.center,
              crossAxisAlignment: WrapCrossAlignment.center,
              spacing: 4,
              runSpacing: 4,
              children: [
                Text(
                  'Don\'t have an account?',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: theme.colorScheme.onSurface.withOpacity(0.65),
                  ),
                ),
                TextButton(
                  onPressed: isLoading.value ? null : () => context.go('/register'),
                  style: TextButton.styleFrom(
                    padding: EdgeInsets.zero,
                    minimumSize: Size.zero,
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  ),
                  child: const Text('Create account'),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Wrap(
              alignment: WrapAlignment.center,
              crossAxisAlignment: WrapCrossAlignment.center,
              spacing: 4,
              runSpacing: 4,
              children: [
                Text(
                  'By continuing, you agree to our',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.onSurface.withOpacity(0.58),
                  ),
                ),
                TextButton(
                  onPressed: isLoading.value ? null : () => showPlaceholder('Terms of Service'),
                  style: TextButton.styleFrom(
                    padding: EdgeInsets.zero,
                    minimumSize: Size.zero,
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  ),
                  child: const Text('Terms of Service'),
                ),
                Text(
                  'and',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.onSurface.withOpacity(0.58),
                  ),
                ),
                TextButton(
                  onPressed: isLoading.value ? null : () => showPlaceholder('Privacy Policy'),
                  style: TextButton.styleFrom(
                    padding: EdgeInsets.zero,
                    minimumSize: Size.zero,
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  ),
                  child: const Text('Privacy Policy'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  String _resolveLoginErrorMessage(DioException error) {
    final responseData = error.response?.data;

    if (responseData is Map<String, dynamic>) {
      final message = responseData['message'];

      if (message is String && message.isNotEmpty) {
        return message;
      }

      final nestedData = responseData['data'];

      if (nestedData is Map<String, dynamic>) {
        final nestedMessage = nestedData['message'];

        if (nestedMessage is String && nestedMessage.isNotEmpty) {
          return nestedMessage;
        }
      }
    }

    return 'Login failed. Please check your email and password.';
  }
}
