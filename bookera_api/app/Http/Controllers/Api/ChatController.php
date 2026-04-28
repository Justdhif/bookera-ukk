<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use App\Events\MessageSent;
use App\Services\NotificationService;
use App\Services\AI\ChatModerationService;
use Illuminate\Support\Facades\DB;

class ChatController extends Controller
{
    /**
     * Get a list of users the authenticated user has chatted with.
     */
    public function getConversations(Request $request)
    {
        $userId = $request->user()->id;

        // Get the latest message for each user we have chatted with
        $subquery = Message::where(function($query) use ($userId) {
            $query->where('sender_id', $userId)
                  ->orWhere('receiver_id', $userId);
        })
            ->groupBy(DB::raw('LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id)'))
            ->selectRaw('MAX(id) as max_id')
            ->pluck('max_id');

        $latestMessages = Message::whereIn('id', $subquery)
            ->with(['sender.profile', 'receiver.profile'])
            ->orderBy('created_at', 'desc')
            ->get();

        $conversations = $latestMessages->map(function ($message) use ($userId) {
            $otherUser = $message->sender_id === $userId ? $message->receiver : $message->sender;
            
            // Get unread count from this user
            $unreadCount = Message::where('sender_id', $otherUser->id)
                ->where('receiver_id', $userId)
                ->where('is_read', false)
                ->count();

            return [
                'user' => $otherUser,
                'last_message' => [
                    'id' => $message->id,
                    'message' => $message->message,
                    'is_read' => $message->is_read,
                    'created_at' => $message->created_at,
                    'is_sender' => $message->sender_id === $userId
                ],
                'unread_count' => $unreadCount
            ];
        });

        return response()->json($conversations);
    }

    /**
     * Get chat messages with a specific user.
     */
    public function getMessages(Request $request, $userSlug)
    {
        $otherUser = User::where('slug', $userSlug)->with('profile')->firstOrFail();
        $authUserId = $request->user()->id;

        $messages = Message::where(function ($query) use ($authUserId, $otherUser) {
                $query->where('sender_id', $authUserId)
                      ->where('receiver_id', $otherUser->id);
            })
            ->orWhere(function ($query) use ($authUserId, $otherUser) {
                $query->where('sender_id', $otherUser->id)
                      ->where('receiver_id', $authUserId);
            })
            ->with(['sender.profile'])
            ->orderBy('created_at', 'asc')
            ->get();

        $transformedMessages = $messages->map(function ($message) use ($authUserId) {
            return [
                'id' => $message->id,
                'message' => $message->message,
                'is_read' => $message->is_read,
                'created_at' => $message->created_at,
                'is_sender' => $message->sender_id === $authUserId,
            ];
        });

        return response()->json([
            'user' => $otherUser,
            'messages' => $transformedMessages
        ]);
    }

    /**
     * Moderate a chat message using AI before sending.
     */
    public function moderateMessage(Request $request)
    {
        $request->validate([
            'message' => 'required|string|max:1000',
        ]);

        $moderationService = new ChatModerationService();
        $result = $moderationService->moderate($request->message, app()->getLocale());

        return response()->json([
            'is_inappropriate' => $result['is_inappropriate'],
            'reason'           => $result['reason'],
        ]);
    }

    /**
     * Send a new message to a specific user.
     */
    public function sendMessage(Request $request, $userSlug)
    {
        $request->validate([
            'message' => 'required|string|max:1000',
        ]);

        $receiver = User::where('slug', $userSlug)->firstOrFail();
        $sender = $request->user();

        // AI moderation check
        $moderationService = new ChatModerationService();
        $moderation = $moderationService->moderate($request->message, app()->getLocale());


        if ($moderation['is_inappropriate']) {
            return response()->json([
                'flagged'  => true,
                'reason'   => $moderation['reason'],
                'message'  => __('Message contains inappropriate content.'),
            ], 422);
        }

        $message = Message::create([
            'sender_id' => $sender->id,
            'receiver_id' => $receiver->id,
            'message' => $request->message,
            'is_read' => false,
        ]);

        $message->load('sender.profile');

        // Broadcast the event
        broadcast(new MessageSent($message));

        // Create web notification
        NotificationService::send(
            $receiver->id,
            __('New Message'),
            __('You have a new message from :name', ['name' => ($sender->profile->full_name ?? $sender->username ?? __('Someone'))]),
            'info',
            'chat',
            [
                'url' => '/chat?user=' . $sender->slug,
                'sender_slug' => $sender->slug
            ]
        );

        return response()->json([
            'id' => $message->id,
            'message' => $message->message,
            'is_read' => $message->is_read,
            'created_at' => $message->created_at,
            'is_sender' => true,
        ], 201);
    }

    /**
     * Mark messages from a specific user as read.
     */
    public function markAsRead(Request $request, $userSlug)
    {
        $sender = User::where('slug', $userSlug)->firstOrFail();
        $receiverId = $request->user()->id;

        Message::where('sender_id', $sender->id)
            ->where('receiver_id', $receiverId)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json(['message' => __('Messages marked as read')]);
    }

    /**
     * Delete all messages between the authenticated user and a specific user.
     */
    public function deleteConversation(Request $request, $userSlug)
    {
        $otherUser = User::where('slug', $userSlug)->firstOrFail();
        $authUserId = $request->user()->id;

        Message::where(function ($query) use ($authUserId, $otherUser) {
                $query->where('sender_id', $authUserId)
                      ->where('receiver_id', $otherUser->id);
            })
            ->orWhere(function ($query) use ($authUserId, $otherUser) {
                $query->where('sender_id', $otherUser->id)
                      ->where('receiver_id', $authUserId);
            })
            ->delete();

        return response()->json(['message' => __('Conversation deleted successfully')]);
    }

    /**
     * Clear messages between the authenticated user and a specific user.
     */
    public function clearMessages(Request $request, $userSlug)
    {
        return $this->deleteConversation($request, $userSlug);
    }
}

