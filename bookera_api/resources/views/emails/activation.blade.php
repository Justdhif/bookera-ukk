<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}" xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>{{ __('Activate Your Account - Bookera') }}</title>
</head>
<body style="margin:0;padding:0;background-color:#f0fdf4;font-family:'Segoe UI',Arial,sans-serif;">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0fdf4;padding:40px 16px;">
  <tr>
    <td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(16,185,129,0.10);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#059669 0%,#10b981 60%,#34d399 100%);padding:36px 40px;text-align:center;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center">
                  <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:12px;padding:10px 24px;margin-bottom:16px;">
                    <span style="color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.5px;font-family:'Segoe UI',Arial,sans-serif;">Bookera</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td align="center" style="padding-top:8px;">
                  <div style="display:inline-block;width:56px;height:56px;background:rgba(255,255,255,0.25);border-radius:50%;text-align:center;line-height:56px;margin-bottom:12px;">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;margin-top:15px;">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                </td>
              </tr>
              <tr>
                <td align="center">
                  <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:700;letter-spacing:-0.3px;">{{ __('Verify Your Email') }}</h1>
                  <p style="color:rgba(255,255,255,0.88);margin:8px 0 0;font-size:14px;">{{ __('Just one more step to join Bookera') }}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px 0;">
            <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 8px;">{{ __('Hello,') }}</p>
            <p style="color:#6b7280;font-size:14px;line-height:1.7;margin:0 0 28px;">
              {{ __('Thank you for registering at Bookera!') }}
              {{ __('Please click the button below to activate your account and start your journey with us.') }}
            </p>

            <!-- Activation Button -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:36px;">
              <tr>
                <td align="center">
                  <a href="{{ $activationUrl }}" target="_blank" style="display:inline-block;background:#10b981;color:#ffffff;padding:14px 32px;font-size:16px;font-weight:700;text-decoration:none;border-radius:12px;box-shadow:0 4px 12px rgba(16,185,129,0.25);transition:all 0.2s ease;">
                    {{ __('Activate Account') }}
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:24px 40px;text-align:center;background:#f9fafb;">
            <p style="color:#9ca3af;font-size:12px;margin:0 0 4px;">
              &copy; {{ date('Y') }} Bookera Library Management System. {{ __('All rights reserved.') }}
            </p>
            <p style="color:#d1d5db;font-size:11px;margin:0;">
              {{ __('This is an automated message — please do not reply to this email.') }}
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>

</body>
</html>
