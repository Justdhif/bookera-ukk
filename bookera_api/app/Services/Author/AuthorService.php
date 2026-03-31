<?php

namespace App\Services\Author;

use App\Helpers\ActivityLogger;
use App\Helpers\SlugGenerator;
use App\Models\Author;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class AuthorService
{
    public function getAll(array $filters): LengthAwarePaginator|Collection
    {
        $query = Author::query()
            ->withCount('books')
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->when(isset($filters['is_active']), function ($query) use ($filters) {
                $query->where('is_active', $filters['is_active']);
            })
            ->latest()
            ->orderByDesc('id');

        if (isset($filters['per_page']) && $filters['per_page'] === 'all') {
            return $query->get();
        }

        return $query->paginate($filters['per_page'] ?? 10);
    }

    public function getById(int $id): ?Author
    {
        return Author::find($id);
    }

    public function create(array $data, UploadedFile $photo): Author
    {
        $data['slug'] = SlugGenerator::generate('authors', 'slug', $data['name']);
        $data['photo'] = $photo->store('authors/photos', 'public');

        $author = Author::create($data);

        ActivityLogger::log(
            'create',
            'author',
            "Created author: {$author->name}",
            $author->toArray(),
            null,
            $author
        );

        return $author;
    }

    public function update(Author $author, array $data, ?UploadedFile $photo = null): Author
    {
        if ($data['name'] !== $author->name) {
            $data['slug'] = SlugGenerator::generate('authors', 'slug', $data['name'], $author->id);
        }

        if ($photo) {
            if ($author->photo) {
                Storage::disk('public')->delete($author->photo);
            }
            $data['photo'] = $photo->store('authors/photos', 'public');
        }

        $oldData = $author->toArray();

        $author->update($data);

        ActivityLogger::log(
            'update',
            'author',
            "Updated author: {$author->name}",
            $author->toArray(),
            $oldData,
            $author
        );

        return $author;
    }

    public function delete(Author $author): array
    {
        if ($author->books()->count() > 0) {
            throw new \Exception('Tidak dapat menghapus penulis yang masih memiliki buku. Hapus atau pindahkan buku terlebih dahulu.', 422);
        }

        $deletedAuthorId = $author->id;
        $authorData = $author->toArray();
        $authorName = $author->name;

        if ($author->photo) {
            Storage::disk('public')->delete($author->photo);
        }

        $author->delete();

        ActivityLogger::log(
            'delete',
            'author',
            "Deleted author: {$authorName}",
            null,
            $authorData,
            null
        );

        return ['deleted_author_id' => $deletedAuthorId];
    }
}
