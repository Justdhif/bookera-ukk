<?php

namespace App\Services\Complaint;

use App\Models\Complaint;
use App\Models\User;
use App\Services\BaseNotificationService;

class ComplaintNotificationService extends BaseNotificationService
{
    /**
     * Notify admins when a new complaint is submitted.
     */
    public function notifyComplaintCreated(Complaint $complaint): void
    {
        $complaint->loadMissing(['user.profile']);
        
        $userName = $complaint->user?->profile?->full_name ?? $complaint->user?->email ?? $this->t('User');
        $title = $this->t('New Complaint Received');
        $message = $this->t(':name has submitted a new complaint: :title', [
            'name' => $userName,
            'title' => $complaint->title,
        ]);

        $admins = User::where('role', 'admin')->get();

        foreach ($admins as $admin) {
            $this->dispatchNotification(
                $admin,
                $title,
                $message,
                'complaint_created',
                'complaint',
                [
                    'complaint_id' => $complaint->id,
                    'slug' => $complaint->slug,
                    'user_name' => $userName,
                ],
                null, // No email factory for now
                null, // No whatsapp message for now
                false, // Don't send mail
                false  // Don't send whatsapp
            );
        }
    }

    /**
     * Notify user when their complaint status is updated by admin.
     */
    public function notifyComplaintStatusUpdated(Complaint $complaint): void
    {
        $complaint->loadMissing(['user.profile']);
        
        $user = $complaint->user;
        if (!$user) return;

        $status = ucfirst($complaint->status);
        $title = $this->t('Complaint Status Updated');
        $message = $this->t('Your complaint ":title" has been updated to :status.', [
            'title' => $complaint->title,
            'status' => $this->t($status),
        ]);

        $this->dispatchNotification(
            $user,
            $title,
            $message,
            'complaint_updated',
            'complaint',
            [
                'complaint_id' => $complaint->id,
                'slug' => $complaint->slug,
                'status' => $complaint->status,
            ],
            null,
            null,
            false,
            false
        );
    }

    /**
     * Notify user when an admin comments on their complaint.
     */
    public function notifyComplaintCommentedByAdmin(Complaint $complaint, \App\Models\ComplaintComment $comment): void
    {
        $user = $complaint->user;
        if (!$user) return;

        $title = $this->t('New Admin Response');
        $message = $this->t('An admin has responded to your complaint: ":title"', [
            'title' => $complaint->title,
        ]);

        $this->dispatchNotification(
            $user,
            $title,
            $message,
            'complaint_commented',
            'complaint',
            [
                'complaint_id' => $complaint->id,
                'slug' => $complaint->slug,
                'comment_id' => $comment->id,
            ],
            null,
            null,
            false,
            false
        );
    }
}
