<?php

namespace App\Services\Author;

use App\Helpers\ActivityLogger;
use App\Helpers\SlugGenerator;
use App\Models\Author;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class AuthorService
{
    public function getAll(array $filters): LengthAwarePaginator
    {
        $query = Author::query()
            ->latest()
            ->orderByDesc('id');

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where('name', 'like', "%{$search}%");
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', filter_var($filters['is_active'], FILTER_VALIDATE_BOOLEAN));
        }

        $perPage = $filters['per_page'] ?? 15;
        if ($perPage === 'all') {
            $perPage = max(1, (clone $query)->count());
        }

        return $query->paginate((int) $perPage);
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
            throw new \Exception('Cannot delete an author who still has books. Remove or reassign the books first.', 422);
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
