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

    private function buildDatabaseContext(?User $user = null): string
    {
        // 1. Top Borrowed Books
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

        // 2. Library Statistics
        $totalBooks    = Book::count();
        $totalUsers    = User::where('role', 'member')->count();
        $totalBorrows  = Borrow::count();
        $openBorrows   = Borrow::where('status', 'open')->count();
        $closeBorrows  = Borrow::where('status', 'close')->count();

        $overdueBorrows = Borrow::where('status', 'open')
            ->whereDate('return_date', '<', now()->toDateString())
            ->count();

        $fineTypes = FineType::all()->map(fn($f) => "- {$f->name}: Rp " . number_format((float)$f->amount, 0, ',', '.') . " ({$f->description})")->join("\n");
        if (empty(trim($fineTypes))) {
            $fineTypes = "Tidak ada data tipe denda.";
        }

        // 3. Top Categories
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

        // 4. Book Stock & Availability (Recent/Featured Books)
        $bookStocks = Book::withCount(['copies', 'available_copies'])
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn($b) => "- {$b->title} (Slug: {$b->slug}): {$b->available_copies_count} tersedia dari total {$b->copies_count} eksemplar.")
            ->join("\n");

        // 5. Best Rated Books by Category/Genre
        $bestRatedBooks = Book::withAvg('reviews', 'rating')
            ->with(['categories', 'genres'])
            ->orderByDesc('reviews_avg_rating')
            ->limit(5)
            ->get()
            ->map(function($b) {
                $cats = $b->categories->pluck('name')->join(', ');
                $rating = number_format((float)$b->reviews_avg_rating, 1);
                return "- {$b->title} (Slug: {$b->slug}) (Rating: {$rating}/5). Kategori: {$cats}";
            })
            ->join("\n");

        $availableCopies = DB::table('book_copies')->where('status', 'available')->count();
        $totalCopies     = DB::table('book_copies')->count();
        $borrowedCopies  = $totalCopies - $availableCopies;

        // 6. User Specific Data (Active Borrows)
        $userContext = "";
        if ($user) {
            $activeBorrows = Borrow::where('user_id', $user->id)
                ->where('status', 'open')
                ->with(['details.book_copy.book'])
                ->get();

            if ($activeBorrows->isNotEmpty()) {
                $userContext = "\n📌 PEMINJAMAN AKTIF {$user->username}:\n";
                foreach ($activeBorrows as $borrow) {
                    foreach ($borrow->details as $detail) {
                        $bookTitle = $detail->book_copy->book->title;
                        $dueDate = $borrow->return_date->format('d M Y');
                        $userContext .= "- {$bookTitle} (Harus kembali: {$dueDate})\n";
                    }
                }
            } else {
                $userContext = "\n📌 Status: {$user->username} tidak memiliki peminjaman aktif saat ini.";
            }
        }

        return <<<CONTEXT
=== DATA REAL-TIME PERPUSTAKAAN BOOKERA ===

📚 Koleksi Buku:
- Total buku: {$totalBooks} judul
- Total eksemplar: {$totalCopies} eksemplar
- Eksemplar tersedia: {$availableCopies} eksemplar
- Eksemplar dipinjam: {$borrowedCopies} eksemplar

📦 Stok Buku (Sampel):
{$bookStocks}

🌟 Rekomendasi Buku Terbaik (Berdasarkan Rating & Ulasan):
{$bestRatedBooks}

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
{$userContext}
CONTEXT;
    }

    /**
     * Generate an AI response based on user message and real DB context.
     */
    public function generateResponse(string $message, ?User $user = null, string $locale = 'id'): string
    {
        $userName  = $user->profile->full_name ?? $user->username ?? 'Tamu';
        $dbContext = $this->buildDatabaseContext($user);

        // 1. Get recent chat history for context (last 5 exchanges)
        $history = $user ? AIChat::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->reverse() : collect();

        $messages = [
            [
                'role'    => 'system',
                'content' => AISystemPrompt::getBoteraPrompt($userName, $dbContext, $locale, $user->role ?? 'member'),
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

        // 4. Save to database for persistence if user is logged in
        if ($user) {
            AIChat::create([
                'user_id'  => $user->id,
                'message'  => $message,
                'response' => $aiReply,
            ]);
        }

        return $aiReply;
    }
}

