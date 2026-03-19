<?php

namespace App\Services\Publisher;

use App\Helpers\ActivityLogger;
use App\Helpers\SlugGenerator;
use App\Models\Publisher;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class PublisherService
{
    public function getAll(array $filters): LengthAwarePaginator|Collection
    {
        $query = Publisher::query()
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

    public function getById(int $id): ?Publisher
    {
        return Publisher::find($id);
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
            throw new \Exception('Tidak dapat menghapus penerbit yang masih memiliki buku. Hapus atau pindahkan buku terlebih dahulu.', 422);
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
