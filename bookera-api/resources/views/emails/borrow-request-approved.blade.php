<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Borrow Request Approved – Bookera</title>
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
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;margin-top:14px;">
                      <path d="M20 6L9 17L4 12" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                </td>
              </tr>
              <tr>
                <td align="center">
                  <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:700;letter-spacing:-0.3px;">Request Approved!</h1>
                  <p style="color:rgba(255,255,255,0.88);margin:8px 0 0;font-size:14px;">Your borrow request has been approved by the library</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px 0;">
            <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 8px;">
              Hello, <strong style="color:#111827;">{{ $borrowRequest->user->profile->full_name ?? $borrowRequest->user->email }}</strong>
            </p>
            <p style="color:#6b7280;font-size:14px;line-height:1.7;margin:0 0 28px;">
              Great news! Your borrow request <strong style="color:#111827;">#{{ $borrowRequest->id }}</strong> has been approved.
              Please pick up your books at the library on your selected borrow date.
            </p>

            <!-- Borrow Code Box -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:2px dashed #10b981;border-radius:12px;background:#f0fdf4;margin-bottom:28px;">
              <tr>
                <td style="padding:20px 24px;text-align:center;">
                  <p style="color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:2px;font-weight:600;margin:0 0 8px;">Borrow Code</p>
                  <p style="color:#047857;font-size:28px;font-weight:800;letter-spacing:6px;margin:0;font-family:'Courier New',Courier,monospace;">{{ $borrow->borrow_code }}</p>
                  <p style="color:#6b7280;font-size:12px;margin:8px 0 0;">Show this code to library staff when picking up your books</p>
                </td>
              </tr>
            </table>

            <!-- Info Row -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;margin-bottom:28px;">
              <tr>
                <td style="padding:14px 20px;border-bottom:1px solid #e5e7eb;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="color:#6b7280;font-size:13px;">Borrow Date</td>
                      <td style="color:#111827;font-size:13px;font-weight:600;text-align:right;">{{ \Carbon\Carbon::parse($borrowRequest->borrow_date)->format('d M Y') }}</td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:14px 20px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="color:#6b7280;font-size:13px;">Return Date</td>
                      <td style="color:#111827;font-size:13px;font-weight:600;text-align:right;">{{ \Carbon\Carbon::parse($borrowRequest->return_date)->format('d M Y') }}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- Book List -->
            <p style="color:#111827;font-size:14px;font-weight:600;margin:0 0 12px;">Requested Books</p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              @foreach($borrowRequest->borrowRequestDetails as $detail)
              <tr>
                <td style="padding:0 0 8px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border-left:3px solid #10b981;border-radius:0 6px 6px 0;">
                    <tr>
                      <td style="padding:10px 14px;">
                        <span style="color:#065f46;font-size:13px;font-weight:500;">{{ $detail->book->title ?? 'Unknown' }}</span>
                        @if($detail->book->author ?? null)
                        <br><span style="color:#6b7280;font-size:12px;">{{ $detail->book->author }}</span>
                        @endif
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              @endforeach
            </table>


          </td>
        </tr>

        <!-- CTA Notice -->
        <tr>
          <td style="padding:0 40px 36px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#ecfdf5,#d1fae5);border-radius:10px;border:1px solid #a7f3d0;">
              <tr>
                <td style="padding:16px 20px;">
                  <p style="color:#065f46;font-size:13px;line-height:1.6;margin:0;">
                    <strong>Reminder:</strong> Please arrive at the library on <strong>{{ \Carbon\Carbon::parse($borrowRequest->borrow_date)->format('d M Y') }}</strong>
                    to collect your books. Late pick-up may result in automatic cancellation.
                  </p>
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
