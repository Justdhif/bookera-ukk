<?php

namespace Database\Seeders;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Database\Seeder;

class ActivityLogSeeder extends Seeder
{
    public function run(): void
    {
        if ($this->command->confirm('Apakah Anda ingin membuat data Log Aktivitas?', true)) {
            $users = User::all();

            if ($users->isEmpty()) {
                $this->command->warn('Gagal membuat log aktivitas: Tabel User masih kosong.');
                return;
            }

            $activityData = [];
            $now = now();
            $faker = \Faker\Factory::create('id_ID');

            foreach ($users as $user) {

                $activityData[] = [
                    'user_id' => $user->id,
                    'action' => 'register',
                    'module' => 'Auth',
                    'description' => 'User baru berhasil mendaftar',
                    'subject_type' => get_class($user),
                    'subject_id' => $user->id,
                    'old_data' => null,
                    'new_data' => json_encode(['email' => $user->email, 'username' => $user->username]),
                    'ip_address' => $faker->ipv4(),
                    'user_agent' => $faker->userAgent(),
                    'created_at' => $user->created_at,
                    'updated_at' => $user->created_at,
                ];

                $loginCount = rand(1, 3);
                for ($i = 0; $i < $loginCount; $i++) {
                    $activityData[] = [
                        'user_id' => $user->id,
                        'action' => 'login',
                        'module' => 'Auth',
                        'description' => 'User berhasil login',
                        'subject_type' => get_class($user),
                        'subject_id' => $user->id,
                        'old_data' => null,
                        'new_data' => null,
                        'ip_address' => $faker->ipv4(),
                        'user_agent' => $faker->userAgent(),
                        'created_at' => $now->copy()->subDays(rand(1, 10)),
                        'updated_at' => $now->copy()->subDays(rand(1, 10)),
                    ];
                }
            }

            $adminOrStaff = $users->filter(fn($u) => in_array($u->role, [
                'admin',
                'officer:catalog',
                'officer:management'
            ]))->random();
            if ($adminOrStaff) {
                $categories = \App\Models\Category::all();
                foreach ($categories as $category) {
                    $activityData[] = [
                        'user_id' => $adminOrStaff->id,
                        'action' => 'create',
                        'module' => 'Category',
                        'description' => "Kategori {$category->name} berhasil ditambahkan",
                        'subject_type' => get_class($category),
                        'subject_id' => $category->id,
                        'old_data' => null,
                        'new_data' => json_encode(['name' => $category->name]),
                        'ip_address' => $faker->ipv4(),
                        'user_agent' => $faker->userAgent(),
                        'created_at' => $category->created_at,
                        'updated_at' => $category->created_at,
                    ];
                }

                $books = \App\Models\Book::all();
                foreach ($books as $book) {
                    $activityData[] = [
                        'user_id' => $adminOrStaff->id,
                        'action' => 'create',
                        'module' => 'Book',
                        'description' => "Buku {$book->title} berhasil ditambahkan",
                        'subject_type' => get_class($book),
                        'subject_id' => $book->id,
                        'old_data' => null,
                        'new_data' => json_encode(['title' => $book->title, 'isbn' => $book->isbn]),
                        'ip_address' => $faker->ipv4(),
                        'user_agent' => $faker->userAgent(),
                        'created_at' => $book->created_at,
                        'updated_at' => $book->created_at,
                    ];
                }
            }

            $chunks = array_chunk($activityData, 500);
            foreach ($chunks as $chunk) {
                ActivityLog::insert($chunk);
            }

            $this->command->info('✅ Berhasil membuat ' . count($activityData) . ' data Log Aktivitas.');
        } else {
            $this->command->info('⏭️ Melewati pembuatan Log Aktivitas.');
        }
    }
}
