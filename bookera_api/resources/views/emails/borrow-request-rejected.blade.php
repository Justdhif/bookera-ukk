<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Borrow Request Rejected – Bookera</title>
</head>
<body style="margin:0;padding:0;background-color:#fef2f2;font-family:'Segoe UI',Arial,sans-serif;">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fef2f2;padding:40px 16px;">
  <tr>
    <td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(239,68,68,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#b91c1c 0%,#dc2626 60%,#ef4444 100%);padding:36px 40px;text-align:center;">
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
                  <!-- X circle icon (SVG, no emoji) -->
                  <div style="display:inline-block;width:56px;height:56px;background:rgba(255,255,255,0.25);border-radius:50%;text-align:center;line-height:56px;margin-bottom:12px;">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;margin-top:14px;">
                      <path d="M18 6L6 18M6 6L18 18" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                </td>
              </tr>
              <tr>
                <td align="center">
                  <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:700;letter-spacing:-0.3px;">Request Rejected</h1>
                  <p style="color:rgba(255,255,255,0.88);margin:8px 0 0;font-size:14px;">Your borrow request could not be approved</p>
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
              We regret to inform you that your borrow request <strong style="color:#111827;">#{{ $borrowRequest->id }}</strong>
              has been <strong style="color:#dc2626;">rejected</strong> by the library.
            </p>

            <!-- Request Summary -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;margin-bottom:28px;">
              <tr>
                <td style="padding:14px 20px;border-bottom:1px solid #e5e7eb;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="color:#6b7280;font-size:13px;">Request ID</td>
                      <td style="color:#111827;font-size:13px;font-weight:600;text-align:right;">#{{ $borrowRequest->id }}</td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:14px 20px;border-bottom:1px solid #e5e7eb;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="color:#6b7280;font-size:13px;">Requested Borrow Date</td>
                      <td style="color:#111827;font-size:13px;font-weight:600;text-align:right;">{{ \Carbon\Carbon::parse($borrowRequest->borrow_date)->format('d M Y') }}</td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:14px 20px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="color:#6b7280;font-size:13px;">Status</td>
                      <td style="text-align:right;">
                        <span style="background:#fee2e2;color:#b91c1c;font-size:12px;font-weight:600;padding:3px 10px;border-radius:20px;">Rejected</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- Rejection Reason -->
            @if($borrowRequest->reject_reason)
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              <tr>
                <td style="background:#fef2f2;border-left:3px solid #dc2626;border-radius:0 8px 8px 0;padding:14px 18px;">
                  <p style="color:#991b1b;font-size:13px;font-weight:600;margin:0 0 6px;text-transform:uppercase;letter-spacing:0.5px;">Reason for Rejection</p>
                  <p style="color:#7f1d1d;font-size:14px;line-height:1.6;margin:0;">{{ $borrowRequest->reject_reason }}</p>
                </td>
              </tr>
            </table>
            @else
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              <tr>
                <td style="background:#fef2f2;border-left:3px solid #dc2626;border-radius:0 8px 8px 0;padding:14px 18px;">
                  <p style="color:#991b1b;font-size:13px;font-weight:600;margin:0 0 6px;text-transform:uppercase;letter-spacing:0.5px;">Reason for Rejection</p>
                  <p style="color:#9ca3af;font-size:14px;font-style:italic;margin:0;">No specific reason provided.</p>
                </td>
              </tr>
            </table>
            @endif

            <!-- Requested Books -->
            <p style="color:#111827;font-size:14px;font-weight:600;margin:0 0 12px;">Requested Books</p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              @foreach($borrowRequest->borrowRequestDetails as $detail)
              <tr>
                <td style="padding:0 0 8px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-left:3px solid #d1d5db;border-radius:0 6px 6px 0;">
                    <tr>
                      <td style="padding:10px 14px;">
                        <span style="color:#374151;font-size:13px;font-weight:500;">{{ $detail->book->title ?? 'Unknown' }}</span>
                        @if($detail->book->author ?? null)
                        <br><span style="color:#9ca3af;font-size:12px;">{{ $detail->book->author }}</span>
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

        <!-- Suggestion Banner -->
        <tr>
          <td style="padding:0 40px 36px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#ecfdf5,#d1fae5);border-radius:10px;border:1px solid #a7f3d0;">
              <tr>
                <td style="padding:16px 20px;">
                  <p style="color:#065f46;font-size:13px;font-weight:600;margin:0 0 4px;">What can you do next?</p>
                  <p style="color:#047857;font-size:13px;line-height:1.6;margin:0;">
                    You may submit a new borrow request with different dates or contact the library directly for more information about this rejection.
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
