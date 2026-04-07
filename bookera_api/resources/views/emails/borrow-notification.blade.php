<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>{{ $title }} – Bookera</title>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 16px;">
  <tr>
    <td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(15,23,42,0.08);">

        <tr>
          <td style="background:linear-gradient(135deg,#0f766e 0%,#14b8a6 60%,#5eead4 100%);padding:36px 40px;text-align:center;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center">
                  <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:12px;padding:10px 24px;margin-bottom:16px;">
                    <span style="color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.5px;font-family:'Segoe UI',Arial,sans-serif;">Bookera</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td align="center">
                  <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:700;letter-spacing:-0.3px;">{{ $title }}</h1>
                  <p style="color:rgba(255,255,255,0.88);margin:8px 0 0;font-size:14px;">Borrow notification from the library system</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:36px 40px 0;">
            <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 24px;white-space:pre-line;">{{ $bodyMessage }}</p>

            @if(!empty($details))
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;margin-bottom:28px;">
              @foreach($details as $label => $value)
              <tr>
                <td style="padding:14px 20px;{{ !$loop->last ? 'border-bottom:1px solid #e5e7eb;' : '' }}">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="color:#6b7280;font-size:13px;">{{ $label }}</td>
                      <td style="color:#111827;font-size:13px;font-weight:600;text-align:right;">{{ $value }}</td>
                    </tr>
                  </table>
                </td>
              </tr>
              @endforeach
            </table>
            @endif

            @if(!empty($books))
            <p style="color:#111827;font-size:14px;font-weight:600;margin:0 0 12px;">Books</p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              @foreach($books as $book)
              <tr>
                <td style="padding:0 0 8px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border-left:3px solid #14b8a6;border-radius:0 6px 6px 0;">
                    <tr>
                      <td style="padding:10px 14px;">
                        <span style="color:#0f172a;font-size:13px;font-weight:500;">{{ $book }}</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              @endforeach
            </table>
            @endif
          </td>
        </tr>

        @if($footerNote)
        <tr>
          <td style="padding:0 40px 36px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#ecfeff,#cffafe);border-radius:10px;border:1px solid #a5f3fc;">
              <tr>
                <td style="padding:16px 20px;">
                  <p style="color:#155e75;font-size:13px;line-height:1.6;margin:0;">{{ $footerNote }}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        @endif

        <tr>
          <td style="padding:0 40px;">
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:0;">
          </td>
        </tr>

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
