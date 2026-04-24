<?php

namespace App\Services\Genre;

use App\Helpers\ActivityLogger;
use App\Helpers\SlugGenerator;
use App\Models\Genre;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class GenreService
{
    public function getAll(array $filters): LengthAwarePaginator
    {
        $query = Genre::query();

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where('name', 'like', "%{$search}%");
        }

        return $query->latest()->orderByDesc('id')->paginate($filters['per_page'] ?? 15);
    }

    public function create(array $data): Genre
    {
        $data['slug'] = SlugGenerator::generate('genres', 'name', $data['name']);

        $genre = Genre::create($data);

        ActivityLogger::log(
            'create',
            'genre',
            "Created genre: {$genre->name}",
            $genre->toArray(),
            null,
            $genre
        );

        return $genre;
    }

    public function update(Genre $genre, array $data): Genre
    {
        $data['slug'] = SlugGenerator::generate('genres', 'name', $data['name']);

        $oldData = $genre->toArray();

        $genre->update($data);

        ActivityLogger::log(
            'update',
            'genre',
            "Updated genre: {$genre->name}",
            $genre->toArray(),
            $oldData,
            $genre
        );

        return $genre;
    }

    public function delete(Genre $genre): array
    {
        if ($genre->books()->count() > 0) {
            throw new \Exception('Cannot delete a genre that still has books. Remove or reassign the books first.', 422);
        }

        $deletedGenreId = $genre->id;
        $genreData = $genre->toArray();
        $genreName = $genre->name;

        $genre->delete();

        ActivityLogger::log(
            'delete',
            'genre',
            "Deleted genre: {$genreName}",
            null,
            $genreData,
            null
        );

        return ['deleted_genre_id' => $deletedGenreId];
    }
}
