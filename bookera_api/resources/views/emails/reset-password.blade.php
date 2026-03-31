<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Reset Password – Bookera</title>
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
                      <rect x="5" y="11" width="14" height="10" rx="2" stroke="#ffffff" stroke-width="2" stroke-linejoin="round"/>
                      <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <circle cx="12" cy="16" r="1.5" fill="#ffffff"/>
                    </svg>
                  </div>
                </td>
              </tr>
              <tr>
                <td align="center">
                  <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:700;letter-spacing:-0.3px;">Reset Your Password</h1>
                  <p style="color:rgba(255,255,255,0.88);margin:8px 0 0;font-size:14px;">We received a password reset request for your account</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px 0;">
            <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 8px;">Hello,</p>
            <p style="color:#6b7280;font-size:14px;line-height:1.7;margin:0 0 28px;">
              We received a request to reset the password for your Bookera account associated with
              <strong style="color:#111827;">{{ $email }}</strong>.
              Use the verification code below to complete the process.
            </p>

            <!-- Token/OTP Box -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:2px dashed #10b981;border-radius:12px;background:#f0fdf4;margin-bottom:24px;">
              <tr>
                <td style="padding:24px;text-align:center;">
                  <p style="color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:2px;font-weight:600;margin:0 0 12px;">Verification Code</p>
                  <p style="color:#047857;font-size:36px;font-weight:800;letter-spacing:10px;margin:0;font-family:'Courier New',Courier,monospace;">{{ $token }}</p>
                </td>
              </tr>
            </table>

            <!-- Expiry Notice -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;margin-bottom:28px;">
              <tr>
                <td style="padding:14px 20px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="color:#6b7280;font-size:13px;">Code expires in</td>
                      <td style="text-align:right;">
                        <span style="background:#d1fae5;color:#065f46;font-size:12px;font-weight:700;padding:3px 10px;border-radius:20px;">60 minutes</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <p style="color:#6b7280;font-size:14px;line-height:1.7;margin:0 0 28px;">
              If you did not request a password reset, please ignore this email.
              Your password will remain unchanged and your account is safe.
            </p>
          </td>
        </tr>

        <!-- Security Warning -->
        <tr>
          <td style="padding:0 40px 36px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fef9c3;border-radius:10px;border:1px solid #fde68a;">
              <tr>
                <td style="padding:14px 18px;">
                  <table role="presentation" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding-right:10px;vertical-align:top;padding-top:1px;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="#92400e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </td>
                      <td>
                        <p style="color:#92400e;font-size:13px;line-height:1.6;margin:0;">
                          <strong>Security reminder:</strong> Never share this code with anyone.
                          Bookera staff will never ask for your verification code.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Divider -->
        <tr>
          <td style="padding:0 40px;">
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:0;">
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:24px 40px;text-align:center;background:#f9fafb;">
            <p style="color:#9ca3af;font-size:12px;margin:0 0 4px;">
              &copy; {{ date('Y') }} Bookera Library Management System. All rights reserved.
            </p>
            <p style="color:#d1d5db;font-size:11px;margin:0;">
              This is an automated message — please do not reply to this email.
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>

</body>
</html>
