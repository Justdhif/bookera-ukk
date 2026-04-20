import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:go_router/go_router.dart';

import '../widgets/auth_page_shell.dart';

class RegisterScreen extends HookWidget {
  const RegisterScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final emailController = useTextEditingController();
    final passwordController = useTextEditingController();
    final passwordConfirmController = useTextEditingController();
    final isPasswordVisible = useState(false);
    final isPasswordConfirmVisible = useState(false);
    final isLoading = useState(false);
    final theme = Theme.of(context);
    useListenable(emailController);
    useListenable(passwordController);
    useListenable(passwordConfirmController);

    final password = passwordController.text;
    final passwordValid = PasswordRequirementsBox.isPasswordValid(password);
    final confirmMismatch =
        passwordConfirmController.text.isNotEmpty &&
        passwordConfirmController.text != password;
    final confirmMatch =
        passwordConfirmController.text.isNotEmpty &&
        passwordConfirmController.text == password;
    final canSubmit =
        emailController.text.trim().isNotEmpty &&
        passwordValid &&
        passwordConfirmController.text.isNotEmpty &&
        !confirmMismatch;

    Future<void> handleSubmit() async {
      if (isLoading.value || !canSubmit) {
        return;
      }

      isLoading.value = true;

      try {
        await Future<void>.delayed(const Duration(milliseconds: 900));

        if (!context.mounted) {
          return;
        }

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Registration success.'),
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
      heroTitlePrefix: 'Start your',
      heroTitleAccent: 'reading journey',
      heroDescription:
          'Create your account to explore the library, borrow books, and keep your reading progress in sync.',
      features: const [
        AuthFeature(
          icon: FontAwesomeIcons.bookOpenReader,
          title: 'Borrow with ease',
          description: 'Request and manage books from one dashboard.',
        ),
        AuthFeature(
          icon: FontAwesomeIcons.graduationCap,
          title: 'Stay organized',
          description: 'Track your reading and learning goals.',
        ),
        AuthFeature(
          icon: FontAwesomeIcons.users,
          title: 'Join the community',
          description: 'Connect with students and fellow readers.',
        ),
        AuthFeature(
          icon: FontAwesomeIcons.globe,
          title: 'Access anywhere',
          description: 'Use Bookera on desktop and mobile.',
        ),
      ],
      formCard: AuthFormCard(
        icon: FontAwesomeIcons.userPlus,
        title: 'Create account',
        description: 'Set up your Bookera profile to join the library.',
        accentGradient: LinearGradient(
          colors: [theme.colorScheme.secondary, theme.colorScheme.primary],
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
            Text(
              'Password',
              style: theme.textTheme.labelLarge?.copyWith(
                fontWeight: FontWeight.w700,
                color: theme.colorScheme.onSurface,
              ),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: passwordController,
              obscureText: !isPasswordVisible.value,
              textInputAction: TextInputAction.next,
              decoration: InputDecoration(
                hintText: 'Create a password',
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
            PasswordRequirementsBox(
              password: password,
              visible: password.isNotEmpty,
            ),
            const SizedBox(height: 20),
            Text(
              'Confirm Password',
              style: theme.textTheme.labelLarge?.copyWith(
                fontWeight: FontWeight.w700,
                color: theme.colorScheme.onSurface,
              ),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: passwordConfirmController,
              obscureText: !isPasswordConfirmVisible.value,
              textInputAction: TextInputAction.done,
              onSubmitted: (_) => handleSubmit(),
              decoration: InputDecoration(
                hintText: 'Re-enter your password',
                prefixIcon: const Icon(FontAwesomeIcons.shield, size: 18),
                suffixIcon: IconButton(
                  icon: Icon(
                    isPasswordConfirmVisible.value
                        ? FontAwesomeIcons.eyeSlash
                        : FontAwesomeIcons.eye,
                    size: 18,
                  ),
                  onPressed: isLoading.value
                      ? null
                      : () {
                          isPasswordConfirmVisible.value =
                              !isPasswordConfirmVisible.value;
                        },
                ),
              ),
            ),
            if (confirmMismatch) ...[
              const SizedBox(height: 8),
              Text(
                'Passwords do not match.',
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.error,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ] else if (confirmMatch) ...[
              const SizedBox(height: 8),
              Text(
                'Passwords match.',
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.primary,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
            const SizedBox(height: 28),
            SizedBox(
              height: 56,
              child: ElevatedButton(
                onPressed: isLoading.value || !canSubmit
                    ? null
                    : handleSubmit,
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
                          Text('Create account'),
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
                  'Already have an account?',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: theme.colorScheme.onSurface.withOpacity(0.65),
                  ),
                ),
                TextButton(
                  onPressed: isLoading.value ? null : () => context.go('/login'),
                  style: TextButton.styleFrom(
                    padding: EdgeInsets.zero,
                    minimumSize: Size.zero,
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  ),
                  child: const Text('Sign in'),
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
                  'By creating an account, you agree to our',
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
}