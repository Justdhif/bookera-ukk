<?php

namespace App\Services\Complaint;

use App\Models\Complaint;
use App\Models\ComplaintVote;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ComplaintVoteService
{
    public function toggleVote(User $user, Complaint $complaint): array
    {
        return DB::transaction(function () use ($user, $complaint) {
            $existingVote = ComplaintVote::where('user_id', $user->id)
                ->where('complaint_id', $complaint->id)
                ->first();

            if ($existingVote) {
                $existingVote->delete();
                $isVoted = false;
            } else {
                ComplaintVote::create([
                    'user_id'      => $user->id,
                    'complaint_id'   => $complaint->id,
                ]);
                $isVoted = true;
            }

            $votesCount = $complaint->votes()->count();
            
            $totalVotes = ComplaintVote::count();
            $totalComplaintsCount = Complaint::count();
            $avgVotes = $totalComplaintsCount > 0 ? $totalVotes / $totalComplaintsCount : 0;
            $isPriority = $votesCount >= $avgVotes;

            return [
                'is_voted'      => $isVoted,
                'helpful_count' => $votesCount,
                'is_priority'   => $isPriority,
            ];
        });
    }
}
