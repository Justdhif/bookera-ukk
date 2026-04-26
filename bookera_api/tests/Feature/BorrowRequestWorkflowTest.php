<?php

namespace Tests\Feature;

use App\Models\Book;
use App\Models\BookCopy;
use App\Models\BorrowRequest;
use App\Models\User;
use App\Services\BorrowRequest\BorrowRequestService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class BorrowRequestWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_creates_borrow_only_after_an_approved_item_is_assigned_copy(): void
    {
        $user = User::query()->create([
            'email' => 'member@example.com',
            'slug' => 'member-example',
            'password' => Hash::make('password'),
            'role' => 'user',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        $bookOne = Book::factory()->create();
        $bookTwo = Book::factory()->create();
        $copyOne = BookCopy::factory()->available()->create(['book_id' => $bookOne->id]);
        $copyTwo = BookCopy::factory()->available()->create(['book_id' => $bookTwo->id]);

        $request = BorrowRequest::create([
            'user_id' => $user->id,
            'borrow_date' => now()->toDateString(),
            'return_date' => now()->addDays(5)->toDateString(),
            'approval_status' => 'processing',
        ]);

        $detailOne = $request->borrowRequestDetails()->create([
            'book_id' => $bookOne->id,
        ]);
        $detailTwo = $request->borrowRequestDetails()->create([
            'book_id' => $bookTwo->id,
        ]);

        /** @var BorrowRequestService $service */
        $service = app(BorrowRequestService::class);

        $approvedRequest = $service->approve($request, $detailOne->id);

        $this->assertSame('approved', $approvedRequest->approval_status);
        $this->assertDatabaseMissing('borrows', [
            'borrow_request_id' => $request->id,
        ]);

        $borrow = $service->assignBorrow($request, [$copyOne->id]);

        $this->assertDatabaseHas('borrows', [
            'id' => $borrow->id,
            'borrow_request_id' => $request->id,
        ]);
        $this->assertDatabaseHas('borrow_details', [
            'borrow_id' => $borrow->id,
            'book_copy_id' => $copyOne->id,
            'status' => 'borrowed',
        ]);
        $this->assertDatabaseHas('borrow_request_details', [
            'id' => $detailOne->id,
            'approval_status' => 'approved',
            'book_copy_id' => $copyOne->id,
        ]);
        $this->assertDatabaseHas('borrow_request_details', [
            'id' => $detailTwo->id,
            'approval_status' => 'processing',
            'book_copy_id' => null,
        ]);
        $this->assertSame('borrowed', $copyOne->fresh()->status);
        $this->assertSame('approved', $request->fresh()->approval_status);
    }

    public function test_it_marks_the_request_rejected_when_all_items_are_rejected(): void
    {
        $user = User::query()->create([
            'email' => 'reject@example.com',
            'slug' => 'reject-example',
            'password' => Hash::make('password'),
            'role' => 'user',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        $bookOne = Book::factory()->create();
        $bookTwo = Book::factory()->create();

        $request = BorrowRequest::create([
            'user_id' => $user->id,
            'borrow_date' => now()->toDateString(),
            'return_date' => now()->addDays(5)->toDateString(),
            'approval_status' => 'processing',
        ]);

        $detailOne = $request->borrowRequestDetails()->create([
            'book_id' => $bookOne->id,
        ]);
        $detailTwo = $request->borrowRequestDetails()->create([
            'book_id' => $bookTwo->id,
        ]);

        /** @var BorrowRequestService $service */
        $service = app(BorrowRequestService::class);

        $service->reject($request, $detailOne->id, 'First reason');
        $service->reject($request, $detailTwo->id, 'Second reason');

        $freshRequest = $request->fresh();

        $this->assertSame('rejected', $freshRequest->approval_status);
        $this->assertStringContainsString($bookOne->title, (string) $freshRequest->reject_reason);
        $this->assertStringContainsString('First reason', (string) $freshRequest->reject_reason);
        $this->assertStringContainsString($bookTwo->title, (string) $freshRequest->reject_reason);
        $this->assertStringContainsString('Second reason', (string) $freshRequest->reject_reason);
        $this->assertDatabaseMissing('borrows', [
            'borrow_request_id' => $request->id,
        ]);
    }
}
