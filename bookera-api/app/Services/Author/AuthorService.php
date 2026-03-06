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
    public function getAuthors(array $filters): LengthAwarePaginator
    {
        $authors = Author::query()
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->when(isset($filters['is_active']), function ($query) use ($filters) {
                $query->where('is_active', $filters['is_active']);
            })
            ->latest()
            ->orderByDesc('id')
            ->paginate($filters['per_page'] ?? 10);

        $authors->getCollection()->transform(function ($author) {
            $author->photo_url = storage_image($author->photo);
            return $author;
        });

        return $authors;
    }

    public function getAllAuthors(): Collection
    {
        return Author::where('is_active', true)
            ->latest()
            ->orderByDesc('id')
            ->get()
            ->transform(function ($author) {
                $author->photo_url = storage_image($author->photo);
                return $author;
            });
    }

    public function getAuthorById(int $id): ?Author
    {
        $author = Author::find($id);

        if (!$author) {
            return null;
        }

        $author->photo_url = storage_image($author->photo);

        return $author;
    }

    public function createAuthor(array $data, UploadedFile $photo): Author
    {
        $data['slug'] = SlugGenerator::generate('authors', 'slug', $data['name']);
        $data['photo'] = $photo->store('authors/photos', 'public');

        $author = Author::create($data);

        $author->photo_url = storage_image($author->photo);

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

    public function updateAuthor(Author $author, array $data, ?UploadedFile $photo = null): Author
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

        $author->photo_url = storage_image($author->photo);

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

    public function deleteAuthor(Author $author): array
    {
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
