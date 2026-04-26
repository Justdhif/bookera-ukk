<?php

namespace App\Services\Publisher;

use App\Helpers\ActivityLogger;
use App\Helpers\SlugGenerator;
use App\Models\Publisher;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class PublisherService
{
    public function getAll(array $filters): LengthAwarePaginator
    {
        $query = Publisher::query()
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

    public function create(array $data, UploadedFile $photo): Publisher
    {
        $data['slug'] = SlugGenerator::generate('publishers', 'slug', $data['name']);
        $data['photo'] = $photo->store('publishers/photos', 'public');

        $publisher = Publisher::create($data);

        ActivityLogger::log(
            'create',
            'publisher',
            "Created publisher: {$publisher->name}",
            $publisher->toArray(),
            null,
            $publisher
        );

        return $publisher;
    }

    public function update(Publisher $publisher, array $data, ?UploadedFile $photo = null): Publisher
    {
        if ($data['name'] !== $publisher->name) {
            $data['slug'] = SlugGenerator::generate('publishers', 'slug', $data['name'], $publisher->id);
        }

        if ($photo) {
            if ($publisher->photo) {
                Storage::disk('public')->delete($publisher->photo);
            }
            $data['photo'] = $photo->store('publishers/photos', 'public');
        }

        $oldData = $publisher->toArray();

        $publisher->update($data);

        ActivityLogger::log(
            'update',
            'publisher',
            "Updated publisher: {$publisher->name}",
            $publisher->toArray(),
            $oldData,
            $publisher
        );

        return $publisher;
    }

    public function delete(Publisher $publisher): array
    {
        if ($publisher->books()->count() > 0) {
            throw new \Exception('Cannot delete a publisher that still has books. Remove or reassign the books first.', 422);
        }

        $deletedPublisherId = $publisher->id;
        $publisherData = $publisher->toArray();
        $publisherName = $publisher->name;

        if ($publisher->photo) {
            Storage::disk('public')->delete($publisher->photo);
        }

        $publisher->delete();

        ActivityLogger::log(
            'delete',
            'publisher',
            "Deleted publisher: {$publisherName}",
            null,
            $publisherData,
            null
        );

        return ['deleted_publisher_id' => $deletedPublisherId];
    }
}
