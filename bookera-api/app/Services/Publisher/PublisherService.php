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
    public function getPublishers(array $filters): LengthAwarePaginator
    {
        $publishers = Publisher::query()
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->when(isset($filters['is_active']), function ($query) use ($filters) {
                $query->where('is_active', $filters['is_active']);
            })
            ->latest()
            ->paginate($filters['per_page'] ?? 10);

        $publishers->getCollection()->transform(function ($publisher) {
            $publisher->photo_url = storage_image($publisher->photo);
            return $publisher;
        });

        return $publishers;
    }

    public function getAllPublishers(): \Illuminate\Database\Eloquent\Collection
    {
        return Publisher::where('is_active', true)
            ->latest()
            ->get()
            ->transform(function ($publisher) {
                $publisher->photo_url = storage_image($publisher->photo);
                return $publisher;
            });
    }

    public function getPublisherById(int $id): ?Publisher
    {
        $publisher = Publisher::find($id);

        if (!$publisher) {
            return null;
        }

        $publisher->photo_url = storage_image($publisher->photo);

        return $publisher;
    }

    public function createPublisher(array $data, UploadedFile $photo): Publisher
    {
        $data['slug'] = SlugGenerator::generate('publishers', 'slug', $data['name']);
        $data['photo'] = $photo->store('publishers/photos', 'public');

        $publisher = Publisher::create($data);

        $publisher->photo_url = storage_image($publisher->photo);

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

    public function updatePublisher(Publisher $publisher, array $data, ?UploadedFile $photo = null): Publisher
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

        $publisher->photo_url = storage_image($publisher->photo);

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

    public function deletePublisher(Publisher $publisher): array
    {
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
