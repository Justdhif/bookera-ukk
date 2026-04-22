<?php

namespace Database\Seeders;

use App\Models\Complaint;
use App\Models\User;
use App\Models\ComplaintVote;
use App\Models\ComplaintComment;
use App\Models\ComplaintImage;
use Illuminate\Database\Seeder;

class ComplaintSeeder extends Seeder
{
    public function run(): void
    {
        $count = (int) $this->command->ask('Berapa banyak pengaduan yang ingin dibuat?', 20);

        if ($count > 0) {
            $users = User::all();
            if ($users->isEmpty()) {
                $this->command->error('Tidak ada user ditemukan. Silakan jalankan UserSeeder terlebih dahulu.');
                return;
            }

            Complaint::factory()->count($count)->create()->each(function ($complaint) use ($users) {
                $voters = $users->random(rand(0, min(10, $users->count())));
                foreach ($voters as $voter) {
                    ComplaintVote::create([
                        'complaint_id' => $complaint->id,
                        'user_id'      => $voter->id,
                    ]);
                }

                $commenters = $users->random(rand(0, min(5, $users->count())));
                foreach ($commenters as $commenter) {
                    ComplaintComment::create([
                        'complaint_id' => $complaint->id,
                        'user_id'      => $commenter->id,
                        'content'      => fake()->sentence(),
                    ]);
                }

                for ($i = 0; $i < rand(1, 3); $i++) {
                    ComplaintImage::create([
                        'complaint_id' => $complaint->id,
                        'image_path'   => "https://picsum.photos/seed/{$complaint->id}_{$i}/800/600",
                        'order'        => $i,
                    ]);
                }
            });

            $this->command->info('✅ Berhasil membuat data pengaduan!');
        }
    }
}
