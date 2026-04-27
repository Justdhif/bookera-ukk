<?php

namespace App\Services\Complaint;

use App\Helpers\ActivityLogger;
use App\Helpers\SlugGenerator;
use App\Models\Complaint;
use App\Models\ComplaintImage;
use App\Models\ComplaintVote;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ComplaintService
{
    public function getAll(?User $authUser, array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Complaint::with(['user.profile', 'images']);
        
        if (!empty($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        if (!empty($filters['category'])) {
            $query->where('category', $filters['category']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('title', 'like', '%' . $filters['search'] . '%')
                    ->orWhere('description', 'like', '%' . $filters['search'] . '%');
            });
        }

        $totalVotes = ComplaintVote::count();
        $totalComplaintsCount = Complaint::count();
        $avgVotes = $totalComplaintsCount > 0 ? $totalVotes / $totalComplaintsCount : 0;

        $query->withCount('votes')
            ->orderByRaw('votes_count >= ? DESC', [$avgVotes])
            ->orderByDesc('votes_count')
            ->latest();

        $complaints = $query->paginate($perPage);

        $complaints->getCollection()->transform(function ($complaint) use ($avgVotes) {
            $complaint->setAttribute('is_priority', $complaint->votes_count >= $avgVotes);
            return $complaint;
        });

        return $this->attachAuthDataToComplaints($complaints, $authUser);
    }

    public function getBySlug(string $slug, ?User $authUser): Complaint
    {
        $complaint = Complaint::with(['user.profile', 'images'])
            ->withCount('votes')
            ->where('slug', $slug)
            ->firstOrFail();

        $totalVotes = ComplaintVote::count();
        $totalComplaintsCount = Complaint::count();
        $avgVotes = $totalComplaintsCount > 0 ? $totalVotes / $totalComplaintsCount : 0;
        
        $complaint->setAttribute('is_priority', $complaint->votes_count >= $avgVotes);

        $isVoted = $authUser
            ? ComplaintVote::where('user_id', $authUser->id)->where('complaint_id', $complaint->id)->exists()
            : false;

        $complaint->setAttribute('is_voted', $isVoted);

        return $complaint;
    }

    public function create(User $user, array $data): Complaint
    {
        return DB::transaction(function () use ($user, $data) {
            $complaint = Complaint::create([
                'user_id'     => $user->id,
                'title'       => $data['title'],
                'description' => $data['description'],
                'category'    => $data['category'] ?? 'other',
                'status'      => 'pending',
                'slug'        => SlugGenerator::generate('complaints', 'slug', $data['title']),
            ]);

            if (!empty($data['images'])) {
                foreach ($data['images'] as $index => $file) {
                    $path = $file->store('complaints/' . $complaint->id, 'public');

                    ComplaintImage::create([
                        'complaint_id' => $complaint->id,
                        'image_path'   => $path,
                        'order'        => $index,
                    ]);
                }
            }

            $complaint->load(['user.profile', 'images']);

            ActivityLogger::log(
                'create',
                'Complaint',
                'Complaint submitted successfully',
                null,
                null,
                $complaint
            );

            return $complaint;
        });
    }

    public function updateStatus(Complaint $complaint, string $status): Complaint
    {
        $complaint->update([
            'status' => $status,
            'resolved_at' => ($status === 'resolved') ? now() : $complaint->resolved_at,
        ]);

        ActivityLogger::log(
            'update',
            'Complaint',
            "Complaint #{$complaint->id} status updated to {$status}",
            null,
            null,
            $complaint
        );

        return $complaint;
    }

    public function delete(User $user, Complaint $complaint): void
    {
        // Admin or owner can delete
        if ($complaint->user_id !== $user->id && $user->role !== 'admin') {
            throw new \Exception('Unauthorized', 403);
        }

        DB::transaction(function () use ($complaint) {
            foreach ($complaint->images as $img) {
                Storage::disk('public')->delete($img->image_path);
            }

            $oldData = $complaint->toArray();
            $complaint->delete();

            ActivityLogger::log(
                'delete',
                'Complaint',
                "Complaint #{$oldData['id']} deleted successfully",
                null,
                $oldData,
                null
            );
        });
    }

    private function attachAuthDataToComplaints(LengthAwarePaginator $complaints, ?User $authUser): LengthAwarePaginator
    {
        $collection = $complaints->getCollection();

        if ($authUser && $collection->isNotEmpty()) {
            $votedIds = ComplaintVote::where('user_id', $authUser->id)
                ->whereIn('complaint_id', $collection->pluck('id'))
                ->pluck('complaint_id')
                ->flip();

            $collection->transform(function (Complaint $complaint) use ($votedIds) {
                $complaint->setAttribute('is_voted', $votedIds->has($complaint->id));
                return $complaint;
            });
        } else {
            $collection->transform(function (Complaint $complaint) {
                $complaint->setAttribute('is_voted', false);
                return $complaint;
            });
        }

        $complaints->setCollection($collection);

        return $complaints;
    }
}
