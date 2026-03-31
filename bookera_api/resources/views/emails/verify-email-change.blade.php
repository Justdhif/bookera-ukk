<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Verifikasi Perubahan Email</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #4CAF50;">Verifikasi Perubahan Email Bookera</h2>
    
    <p>Halo,</p>
    
    <p>Kami menerima permintaan untuk mengubah alamat email profil Bookera Anda ke alamat email ini (<strong>{{ $email }}</strong>).</p>
    
    <p>Untuk menyelesaikan proses perubahan email, silakan gunakan kode OTP berikut:</p>
    
    <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
        {{ $otp }}
    </div>
    
    <p>Kode ini hanya berlaku selama 5 menit. Jangan berikan kode ini kepada siapapun.</p>
    
    <p>Jika Anda tidak merasa mengajukan perubahan email, Anda dapat mengabaikan email ini. Akun Bookera Anda akan tetap aman.</p>
    
    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
    
    <p style="font-size: 12px; color: #888;">
        Email ini dikirim secara otomatis oleh sistem Bookera. Mohon tidak membalas email ini.
    </p>
</body>
</html>
