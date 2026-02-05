<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ActivityLog;
use App\Models\User;
use App\Models\Book;
use App\Models\Loan;
use App\Models\BookCopy;
use App\Models\Category;
use App\Models\BookReturn;
use Carbon\Carbon;

class ActivityLogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::all();
        $books = Book::all();
        $loans = Loan::all();
        $bookCopies = BookCopy::all();
        $categories = Category::all();
        $bookReturns = BookReturn::all();

        if ($users->isEmpty()) {
            $this->command->warn('No users found. Please run UserSeeder first.');
            return;
        }

        $activities = [];
        $ipAddresses = ['192.168.1.1', '192.168.1.2', '10.0.0.1', '172.16.0.1', '192.168.0.100'];
        $userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
        ];

        // Login activities
        foreach ($users->take(10) as $index => $user) {
            $activities[] = [
                'user_id' => $user->id,
                'action' => 'login',
                'module' => 'auth',
                'description' => "User login",
                'subject_type' => User::class,
                'subject_id' => $user->id,
                'old_data' => null,
                'new_data' => null,
                'ip_address' => $ipAddresses[array_rand($ipAddresses)],
                'user_agent' => $userAgents[array_rand($userAgents)],
                'created_at' => Carbon::now()->subDays(rand(1, 30))->subHours(rand(0, 23)),
                'updated_at' => Carbon::now()->subDays(rand(1, 30))->subHours(rand(0, 23)),
            ];
        }

        // Book creation activities
        if ($books->isNotEmpty()) {
            foreach ($books->take(10) as $book) {
                $admin = $users->where('role', 'admin')->first() ?? $users->first();
                $activities[] = [
                    'user_id' => $admin->id,
                    'action' => 'create',
                    'module' => 'book',
                    'description' => "Created book: {$book->title}",
                    'subject_type' => Book::class,
                    'subject_id' => $book->id,
                    'old_data' => null,
                    'new_data' => json_encode([
                        'title' => $book->title,
                        'author' => $book->author,
                        'isbn' => $book->isbn,
                    ]),
                    'ip_address' => $ipAddresses[array_rand($ipAddresses)],
                    'user_agent' => $userAgents[array_rand($userAgents)],
                    'created_at' => $book->created_at,
                    'updated_at' => $book->created_at,
                ];
            }
        }

        // Loan activities
        if ($loans->isNotEmpty()) {
            foreach ($loans->take(10) as $loan) {
                $activities[] = [
                    'user_id' => $loan->user_id,
                    'action' => 'create',
                    'module' => 'loan',
                    'description' => "Created loan request #{$loan->id}",
                    'subject_type' => Loan::class,
                    'subject_id' => $loan->id,
                    'old_data' => null,
                    'new_data' => json_encode([
                        'loan_id' => $loan->id,
                        'loan_date' => $loan->loan_date,
                        'due_date' => $loan->due_date,
                        'status' => $loan->status,
                    ]),
                    'ip_address' => $ipAddresses[array_rand($ipAddresses)],
                    'user_agent' => $userAgents[array_rand($userAgents)],
                    'created_at' => $loan->created_at,
                    'updated_at' => $loan->created_at,
                ];

                // Loan approval activity
                if ($loan->approval_status === 'approved') {
                    $officer = $users->where('role', 'officer')->first() ?? $users->first();
                    $activities[] = [
                        'user_id' => $officer->id,
                        'action' => 'update',
                        'module' => 'loan',
                        'description' => "Loan #{$loan->id} approved by admin - waiting for book handover",
                        'subject_type' => Loan::class,
                        'subject_id' => $loan->id,
                        'old_data' => json_encode(['approval_status' => 'pending']),
                        'new_data' => json_encode(['approval_status' => 'approved']),
                        'ip_address' => $ipAddresses[array_rand($ipAddresses)],
                        'user_agent' => $userAgents[array_rand($userAgents)],
                        'created_at' => $loan->created_at->addMinutes(rand(10, 60)),
                        'updated_at' => $loan->created_at->addMinutes(rand(10, 60)),
                    ];
                }
            }
        }

        // Book copy status update activities
        if ($bookCopies->isNotEmpty()) {
            foreach ($bookCopies->where('status', 'borrowed')->take(5) as $bookCopy) {
                $officer = $users->where('role', 'officer')->first() ?? $users->first();
                $activities[] = [
                    'user_id' => $officer->id,
                    'action' => 'update',
                    'module' => 'book_copy',
                    'description' => "Book copy #{$bookCopy->id} status changed to borrowed",
                    'subject_type' => BookCopy::class,
                    'subject_id' => $bookCopy->id,
                    'old_data' => json_encode(['status' => 'available']),
                    'new_data' => json_encode(['status' => 'borrowed']),
                    'ip_address' => $ipAddresses[array_rand($ipAddresses)],
                    'user_agent' => $userAgents[array_rand($userAgents)],
                    'created_at' => $bookCopy->updated_at,
                    'updated_at' => $bookCopy->updated_at,
                ];
            }
        }

        // Profile update activities
        foreach ($users->take(5) as $user) {
            $activities[] = [
                'user_id' => $user->id,
                'action' => 'update',
                'module' => 'user',
                'description' => "Updated user: {$user->email} (Role: {$user->role})",
                'subject_type' => User::class,
                'subject_id' => $user->id,
                'old_data' => json_encode(['phone_number' => '0800000000']),
                'new_data' => json_encode(['phone_number' => $user->profile->phone_number]),
                'ip_address' => $ipAddresses[array_rand($ipAddresses)],
                'user_agent' => $userAgents[array_rand($userAgents)],
                'created_at' => Carbon::now()->subDays(rand(5, 20)),
                'updated_at' => Carbon::now()->subDays(rand(5, 20)),
            ];
        }

        // Category creation activities
        if ($categories->isNotEmpty()) {
            foreach ($categories->take(5) as $category) {
                $admin = $users->where('role', 'admin')->first() ?? $users->first();
                $activities[] = [
                    'user_id' => $admin->id,
                    'action' => 'create',
                    'module' => 'category',
                    'description' => "Created category: {$category->name}",
                    'subject_type' => Category::class,
                    'subject_id' => $category->id,
                    'old_data' => null,
                    'new_data' => json_encode([
                        'name' => $category->name,
                        'slug' => $category->slug,
                        'icon' => $category->icon,
                    ]),
                    'ip_address' => $ipAddresses[array_rand($ipAddresses)],
                    'user_agent' => $userAgents[array_rand($userAgents)],
                    'created_at' => $category->created_at,
                    'updated_at' => $category->created_at,
                ];
            }

            // Category update activities
            foreach ($categories->take(3) as $category) {
                $admin = $users->where('role', 'admin')->first() ?? $users->first();
                $activities[] = [
                    'user_id' => $admin->id,
                    'action' => 'update',
                    'module' => 'category',
                    'description' => "Updated category: {$category->name}",
                    'subject_type' => Category::class,
                    'subject_id' => $category->id,
                    'old_data' => json_encode(['name' => 'Old Category Name']),
                    'new_data' => json_encode(['name' => $category->name]),
                    'ip_address' => $ipAddresses[array_rand($ipAddresses)],
                    'user_agent' => $userAgents[array_rand($userAgents)],
                    'created_at' => $category->updated_at,
                    'updated_at' => $category->updated_at,
                ];
            }
        }

        // Book return activities
        if ($bookReturns->isNotEmpty()) {
            foreach ($bookReturns->take(5) as $bookReturn) {
                // Create return request
                $activities[] = [
                    'user_id' => $bookReturn->loan->user_id,
                    'action' => 'create',
                    'module' => 'book_return',
                    'description' => "Processed return request for loan #{$bookReturn->loan_id} - Waiting for approval",
                    'subject_type' => BookReturn::class,
                    'subject_id' => $bookReturn->id,
                    'old_data' => null,
                    'new_data' => json_encode([
                        'return_id' => $bookReturn->id,
                        'loan_id' => $bookReturn->loan_id,
                        'return_date' => $bookReturn->return_date,
                        'approval_status' => $bookReturn->approval_status,
                    ]),
                    'ip_address' => $ipAddresses[array_rand($ipAddresses)],
                    'user_agent' => $userAgents[array_rand($userAgents)],
                    'created_at' => $bookReturn->created_at,
                    'updated_at' => $bookReturn->created_at,
                ];

                // Approval activities
                if ($bookReturn->approval_status === 'approved') {
                    $officer = $users->where('role', 'officer')->first() ?? $users->first();
                    $activities[] = [
                        'user_id' => $officer->id,
                        'action' => 'update',
                        'module' => 'book_return',
                        'description' => "Book return #{$bookReturn->id} approved by admin",
                        'subject_type' => BookReturn::class,
                        'subject_id' => $bookReturn->id,
                        'old_data' => json_encode(['approval_status' => 'pending']),
                        'new_data' => json_encode(['approval_status' => 'approved']),
                        'ip_address' => $ipAddresses[array_rand($ipAddresses)],
                        'user_agent' => $userAgents[array_rand($userAgents)],
                        'created_at' => $bookReturn->updated_at,
                        'updated_at' => $bookReturn->updated_at,
                    ];
                }
            }
        }

        // Logout activities
        foreach ($users->take(8) as $user) {
            $activities[] = [
                'user_id' => $user->id,
                'action' => 'logout',
                'module' => 'auth',
                'description' => "User logout",
                'subject_type' => User::class,
                'subject_id' => $user->id,
                'old_data' => null,
                'new_data' => null,
                'ip_address' => $ipAddresses[array_rand($ipAddresses)],
                'user_agent' => $userAgents[array_rand($userAgents)],
                'created_at' => Carbon::now()->subDays(rand(1, 15))->subHours(rand(1, 10)),
                'updated_at' => Carbon::now()->subDays(rand(1, 15))->subHours(rand(1, 10)),
            ];
        }

        // Insert all activities
        foreach ($activities as $activity) {
            ActivityLog::create($activity);
        }

        $this->command->info('Created ' . count($activities) . ' activity logs.');
    }
}
