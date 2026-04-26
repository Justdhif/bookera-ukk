<?php

namespace App\Services\AI;

use App\Models\AIChat;
use App\Models\Book;
use App\Models\Borrow;
use App\Models\FineBorrow;
use App\Models\FineType;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class AIChatService
{
    private string $groqApiKey;
    private string $groqBaseUrl = 'https://api.groq.com/openai/v1/chat/completions';
    private string $model = 'llama-3.1-8b-instant';

    public function __construct()
    {
        $this->groqApiKey = config('services.groq.key', env('GROQ_API_KEY', ''));
    }

    private function buildDatabaseContext(): string
    {
        $topBorrowedBooks = DB::table('borrow_details')
            ->join('book_copies', 'borrow_details.book_copy_id', '=', 'book_copies.id')
            ->join('books', 'book_copies.book_id', '=', 'books.id')
            ->select('books.title', DB::raw('COUNT(*) as total_borrows'))
            ->groupBy('books.id', 'books.title')
            ->orderByDesc('total_borrows')
            ->limit(5)
            ->get();

        $topBooksText = $topBorrowedBooks->isEmpty() 
            ? "Belum ada data peminjaman buku." 
            : $topBorrowedBooks->map(fn($b) => "- {$b->title} ({$b->total_borrows} peminjaman)")->join("\n");

        $totalBooks    = Book::count();
        $totalUsers    = User::where('role', 'member')->count();
        $totalBorrows  = Borrow::count();
        $openBorrows   = Borrow::where('status', 'open')->count();
        $closeBorrows  = Borrow::where('status', 'close')->count();

        // 3. Overdue (terlambat) borrows
        $overdueBorrows = Borrow::where('status', 'open')
            ->whereDate('return_date', '<', now()->toDateString())
            ->count();

        $fineTypes = FineType::all()->map(fn($f) => "- {$f->name}: Rp " . number_format((float)$f->amount, 0, ',', '.') . " ({$f->description})")->join("\n");
        if (empty(trim($fineTypes))) {
            $fineTypes = "Tidak ada data tipe denda.";
        }

        $topCategoriesData = DB::table('borrow_details')
            ->join('book_copies', 'borrow_details.book_copy_id', '=', 'book_copies.id')
            ->join('books', 'book_copies.book_id', '=', 'books.id')
            ->join('book_categories', 'books.id', '=', 'book_categories.book_id')
            ->join('categories', 'book_categories.category_id', '=', 'categories.id')
            ->select('categories.name', DB::raw('COUNT(*) as total'))
            ->groupBy('categories.id', 'categories.name')
            ->orderByDesc('total')
            ->limit(3)
            ->get();

        $topCategories = $topCategoriesData->isEmpty()
            ? "Belum ada kategori yang dipinjam."
            : $topCategoriesData->map(fn($c) => "- {$c->name} ({$c->total} peminjaman)")->join("\n");

        $availableCopies = DB::table('book_copies')->where('status', 'available')->count();
        $totalCopies     = DB::table('book_copies')->count();
        $borrowedCopies  = $totalCopies - $availableCopies;

        return <<<CONTEXT
=== DATA REAL-TIME PERPUSTAKAAN BOOKERA ===

📚 Koleksi Buku:
- Total buku: {$totalBooks} judul
- Total eksemplar: {$totalCopies} eksemplar
- Eksemplar tersedia: {$availableCopies} eksemplar
- Eksemplar dipinjam: {$borrowedCopies} eksemplar

👥 Pengguna:
- Total anggota aktif: {$totalUsers} orang

📋 Peminjaman:
- Total peminjaman: {$totalBorrows}
- Sedang dipinjam (open): {$openBorrows}
- Sudah dikembalikan (close): {$closeBorrows}
- Terlambat dikembalikan: {$overdueBorrows}

🏆 5 Buku Paling Banyak Dipinjam:
{$topBooksText}

🗂️ 3 Kategori Paling Banyak Dipinjam:
{$topCategories}

💰 Tipe Denda Perpustakaan:
{$fineTypes}
CONTEXT;
    }

    /**
     * Generate an AI response based on user message and real DB context.
     */
    public function generateResponse(string $message, User $user): string
    {
        $userName = $user->profile?->full_name ?? $user->email;
        $dbContext = $this->buildDatabaseContext();

        // 1. Get recent chat history for context (last 5 exchanges)
        $history = AIChat::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->reverse();

        $messages = [
            [
                'role'    => 'system',
                'content' => $this->buildSystemPrompt($userName, $dbContext),
            ],
        ];

        // 2. Add history to messages
        foreach ($history as $chat) {
            $messages[] = ['role' => 'user', 'content' => $chat->message];
            $messages[] = ['role' => 'assistant', 'content' => $chat->response];
        }

        // 3. Add current message
        $messages[] = [
            'role'    => 'user',
            'content' => $message,
        ];

        /** @var \Illuminate\Http\Client\Response $response */
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->groqApiKey,
            'Content-Type'  => 'application/json',
        ])->timeout(30)->post($this->groqBaseUrl, [
            'model'       => $this->model,
            'temperature' => 0.5,
            'max_tokens'  => 512,
            'messages'    => $messages,
        ]);

        if ($response->failed()) {
            throw new \RuntimeException('Groq API request failed: ' . $response->body());
        }

        $data = $response->json();
        $aiReply = $data['choices'][0]['message']['content'] ?? 'Maaf, saya tidak dapat memproses permintaan Anda saat ini.';

        // 4. Save to database for persistence
        AIChat::create([
            'user_id'  => $user->id,
            'message'  => $message,
            'response' => $aiReply,
        ]);

        return $aiReply;
    }

    private function buildSystemPrompt(string $userName, string $dbContext): string
    {
        return <<<PROMPT
Anda adalah Bookera AI, asisten virtual cerdas dan eksklusif untuk perpustakaan digital Bookera.

Nama pengguna yang bertanya: {$userName}.

Anda memiliki akses ke data real-time perpustakaan berikut ini:

{$dbContext}

=== PANDUAN RESPONS KETAT ===
Tugas utama Anda:
- HANYA menjawab pertanyaan seputar Bookera (koleksi buku, peminjaman, fitur website, dan layanan perpustakaan).
- Memberikan informasi akurat berdasarkan data real-time di atas.
- Membantu pengguna memahami proses peminjaman dan pengembalian buku di Bookera.
- Menjelaskan informasi denda dan kebijakan perpustakaan Bookera.

Aturan Penting:
- JIKA user bertanya hal di luar Bookera atau perpustakaan (misal: politik, matematika umum, masak, coding umum, dll), Anda WAJIB menolak dengan sopan. Contoh: "Maaf, sebagai asisten Bookera AI, saya hanya dapat membantu Anda dengan informasi seputar perpustakaan Bookera."
- SELALU gunakan Bahasa Indonesia yang baik dan sopan.
- Jawaban harus singkat, jelas, dan informatif (maksimal 3 paragraf).
- Jika ada data numerik, sebutkan angkanya secara spesifik dari konteks.
- Jangan mengarang data. Jika data (buku terpopuler/denda) tertulis "Belum ada" atau "Tidak ada" di konteks, sampaikan bahwa data tersebut belum tersedia. JANGAN gunakan placeholder.
- Gunakan emoji untuk kesan ramah namun profesional.
PROMPT;
    }
}
