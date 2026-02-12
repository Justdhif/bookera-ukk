<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Helpers\ActivityLogger;
use App\Helpers\ApiResponse;
use App\Helpers\SlugGenerator;
use App\Helpers\SaveCoverHelper;
use App\Models\Save;
use App\Models\Book;
use Illuminate\Http\Request;

class SaveController extends Controller
{
    public function index(Request $request)
    {
        $saves = Save::query()
            ->with(['books' => function ($query) {
                $query->select('books.id', 'books.title', 'books.cover_image')
                    ->limit(4);
            }])
            ->where('user_id', auth()->id())
            ->when($request->search, function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%");
            })
            ->latest()
            ->paginate($request->per_page ?? 10);

        // Transform saves to include computed properties
        $saves->getCollection()->transform(function ($save) {
            $covers = $save->books->map(function ($book) {
                return storage_image($book->cover_image);
            })->filter()->values();

            return [
                'id' => $save->id,
                'name' => $save->name,
                'slug' => $save->slug,
                'description' => $save->description,
                'cover' => storage_image($save->cover),
                'covers' => $covers,
                'total_books' => $save->books->count(),
                'created_at' => $save->created_at,
                'updated_at' => $save->updated_at,
            ];
        });

        return ApiResponse::successResponse(
            'Data simpanan berhasil diambil',
            $saves
        );
    }

    public function show($identifier)
    {
        // Try to find by slug first, then by ID
        $query = Save::with(['books' => function ($query) {
            $query->with(['categories', 'copies'])
                ->select('books.*');
        }])
            ->where('user_id', auth()->id());

        // Check if identifier is numeric (ID) or string (slug)
        if (is_numeric($identifier)) {
            $save = $query->findOrFail($identifier);
        } else {
            $save = $query->where('slug', $identifier)->firstOrFail();
        }

        // Transform books to include cover URL and copy counts
        $save->books->transform(function ($book) {
            $book->cover_image_url = storage_image($book->cover_image);
            $book->total_copies = $book->copies->count();
            $book->available_copies = $book->copies->where('status', 'available')->count();
            // Remove copies collection to keep response clean
            unset($book->copies);
            return $book;
        });

        // Add covers array
        $covers = $save->books->take(4)->map(function ($book) {
            return storage_image($book->cover_image);
        })->filter()->values();

        $data = [
            'id' => $save->id,
            'name' => $save->name,
            'slug' => $save->slug,
            'description' => $save->description,
            'cover' => storage_image($save->cover),
            'covers' => $covers,
            'total_books' => $save->books->count(),
            'books' => $save->books,
            'created_at' => $save->created_at,
            'updated_at' => $save->updated_at,
        ];

        return ApiResponse::successResponse(
            'Detail simpanan berhasil diambil',
            $data
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $data['user_id'] = auth()->id();
        $data['slug'] = SlugGenerator::generate('saves', 'slug', $data['name']);

        $save = Save::create($data);

        ActivityLogger::log(
            'create',
            'save',
            "Created save: {$save->name}",
            $save->toArray(),
            null,
            $save
        );

        return ApiResponse::successResponse(
            'Simpanan berhasil dibuat',
            $save,
            201
        );
    }

    public function update(Request $request, $id)
    {
        $save = Save::where('user_id', auth()->id())
            ->findOrFail($id);

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        // Update slug if name changed
        if (isset($data['name']) && $data['name'] !== $save->name) {
            $data['slug'] = SlugGenerator::generate('saves', 'slug', $data['name'], $save->id);
        }

        $oldData = $save->toArray();

        $save->update($data);

        ActivityLogger::log(
            'update',
            'save',
            "Updated save: {$save->name}",
            $save->toArray(),
            $oldData,
            $save
        );

        return ApiResponse::successResponse(
            'Simpanan berhasil diperbarui',
            $save
        );
    }

    public function destroy($id)
    {
        $save = Save::where('user_id', auth()->id())
            ->findOrFail($id);

        $saveName = $save->name;

        $save->delete();

        ActivityLogger::log(
            'delete',
            'save',
            "Deleted save: {$saveName}",
            null,
            $save->toArray()
        );

        return ApiResponse::successResponse(
            'Simpanan berhasil dihapus',
            null
        );
    }

    public function addBook(Request $request, $id)
    {
        $data = $request->validate([
            'book_id' => 'required|exists:books,id',
        ]);

        $save = Save::where('user_id', auth()->id())
            ->findOrFail($id);

        // Check if book is already in save
        if ($save->books()->where('book_id', $data['book_id'])->exists()) {
            return ApiResponse::errorResponse(
                'Buku sudah ada di simpanan ini',
                null,
                400
            );
        }

        $save->books()->attach($data['book_id']);

        // Regenerate cover collage with new book
        $this->updateSaveCover($save);

        ActivityLogger::log(
            'update',
            'save',
            "Added book to save: {$save->name}",
            ['save_id' => $save->id, 'book_id' => $data['book_id']],
            null,
            $save
        );

        return ApiResponse::successResponse(
            'Buku berhasil ditambahkan ke simpanan',
            null
        );
    }

    public function removeBook($id, $bookId)
    {
        $save = Save::where('user_id', auth()->id())
            ->findOrFail($id);

        if (!$save->books()->where('book_id', $bookId)->exists()) {
            return ApiResponse::errorResponse(
                'Buku tidak ditemukan di simpanan ini',
                null,
                404
            );
        }

        $save->books()->detach($bookId);

        // Regenerate cover collage after removing book
        $this->updateSaveCover($save);

        ActivityLogger::log(
            'update',
            'save',
            "Removed book from save: {$save->name}",
            ['save_id' => $save->id, 'book_id' => $bookId],
            null,
            $save
        );

        return ApiResponse::successResponse(
            'Buku berhasil dihapus dari simpanan',
            null
        );
    }

    /**
     * Update save cover collage
     */
    protected function updateSaveCover(Save $save): void
    {
        // Get up to 4 book covers
        $bookCovers = $save->books()
            ->take(4)
            ->pluck('cover_image')
            ->toArray();

        // Delete old cover if exists
        if ($save->cover) {
            SaveCoverHelper::deleteOldCover($save->cover);
        }

        // Generate new collage
        $newCover = SaveCoverHelper::generateCollage($bookCovers, $save->id);

        // Update save with new cover
        $save->update(['cover' => $newCover]);
    }
}
