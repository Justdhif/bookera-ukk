<?php

namespace App\Services\Save;

use App\Helpers\ActivityLogger;
use App\Helpers\SaveCoverHelper;
use App\Helpers\SlugGenerator;
use App\Models\Save;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class SaveService
{
    public function getUserSaves(?string $search = null, int $perPage = 10): LengthAwarePaginator
    {
        $saves = Save::query()
            ->with(['books' => function ($query) {
                $query->select('books.id', 'books.title', 'books.cover_image')
                    ->limit(4);
            }])
            ->where('user_id', auth()->id())
            ->when($search, function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate($perPage);

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

        return $saves;
    }

    public function getSaveByIdentifier(string $identifier): array
    {
        $query = Save::with(['books' => function ($query) {
            $query->with(['categories', 'copies'])
                ->select('books.*');
        }])
            ->where('user_id', auth()->id());

        if (is_numeric($identifier)) {
            $save = $query->findOrFail($identifier);
        } else {
            $save = $query->where('slug', $identifier)->firstOrFail();
        }

        $save->books->transform(function ($book) {
            $book->cover_image_url = storage_image($book->cover_image);
            $book->total_copies = $book->copies->count();
            $book->available_copies = $book->copies->where('status', 'available')->count();
            unset($book->copies);
            return $book;
        });

        $covers = $save->books->take(4)->map(function ($book) {
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
            'books' => $save->books,
            'created_at' => $save->created_at,
            'updated_at' => $save->updated_at,
        ];
    }

    public function createSave(array $data): Save
    {
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

        return $save;
    }

    public function updateSave(Save $save, array $data): Save
    {
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

        return $save;
    }

    public function deleteSave(Save $save): void
    {
        $saveName = $save->name;
        $oldData = $save->toArray();

        $save->delete();

        ActivityLogger::log(
            'delete',
            'save',
            "Deleted save: {$saveName}",
            null,
            $oldData
        );
    }

    public function addBookToSave(Save $save, int $bookId): void
    {
        $save->books()->attach($bookId);
        $this->updateSaveCover($save);

        ActivityLogger::log(
            'update',
            'save',
            "Added book to save: {$save->name}",
            ['save_id' => $save->id, 'book_id' => $bookId],
            null,
            $save
        );
    }

    public function removeBookFromSave(Save $save, int $bookId): void
    {
        $save->books()->detach($bookId);
        $this->updateSaveCover($save);

        ActivityLogger::log(
            'update',
            'save',
            "Removed book from save: {$save->name}",
            ['save_id' => $save->id, 'book_id' => $bookId],
            null,
            $save
        );
    }

    public function bookExistsInSave(Save $save, int $bookId): bool
    {
        return $save->books()->where('book_id', $bookId)->exists();
    }

    private function updateSaveCover(Save $save): void
    {
        $bookCovers = $save->books()
            ->take(4)
            ->pluck('cover_image')
            ->toArray();

        if ($save->cover) {
            SaveCoverHelper::deleteOldCover($save->cover);
        }

        $newCover = SaveCoverHelper::generateCollage($bookCovers, $save->id);

        $save->update(['cover' => $newCover]);
    }
}
