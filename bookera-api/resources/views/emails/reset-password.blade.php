<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password - Bookera</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f6f9; padding: 40px 0;">
        <tr>
            <td align="center">
                <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.07);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 32px 40px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">📚 Bookera</h1>
                            <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Sistem Manajemen Perpustakaan</p>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="color: #1e293b; margin: 0 0 16px; font-size: 22px; font-weight: 600;">Reset Password</h2>
                            
                            <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
                                Halo! Kami menerima permintaan untuk mengatur ulang password akun Anda. Gunakan kode verifikasi di bawah ini:
                            </p>

                            <!-- Token Code -->
                            <div style="background: linear-gradient(135deg, #f0f0ff, #f5f3ff); border: 2px dashed #8b5cf6; border-radius: 12px; padding: 24px; text-align: center; margin: 0 0 24px;">
                                <p style="color: #6366f1; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 8px; font-weight: 600;">Kode Verifikasi</p>
                                <p style="color: #1e293b; font-size: 36px; font-weight: 700; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">{{ $token }}</p>
                            </div>

                            <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 8px;">
                                ⏰ Kode ini berlaku selama <strong style="color: #1e293b;">60 menit</strong> sejak email ini dikirim.
                            </p>

                            <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
                                Jika Anda tidak merasa meminta reset password, abaikan email ini. Password Anda akan tetap aman.
                            </p>

                            <!-- Divider -->
                            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">

                            <p style="color: #94a3b8; font-size: 13px; line-height: 1.5; margin: 0;">
                                🔒 Demi keamanan, jangan bagikan kode verifikasi ini kepada siapapun. Tim Bookera tidak akan pernah meminta kode ini.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8fafc; padding: 24px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="color: #94a3b8; font-size: 12px; margin: 0 0 4px;">
                                &copy; {{ date('Y') }} Bookera. Seluruh hak cipta dilindungi.
                            </p>
                            <p style="color: #cbd5e1; font-size: 11px; margin: 0;">
                                Email ini dikirim secara otomatis, mohon tidak membalas email ini.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
