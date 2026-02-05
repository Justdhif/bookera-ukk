<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\TermsOfService;

class TermsOfServiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $termsOfServices = [
            [
                'title' => '1. Acceptance of Terms',
                'content' => '<p>By accessing and using Bookera library management system, you accept and agree to be bound by the terms and provision of this agreement.</p>',
            ],
            [
                'title' => '2. Use License',
                'content' => '<p>Permission is granted to temporarily access the materials (information or software) on Bookera for personal, non-commercial transitory viewing only.</p>
<ul>
<li>You must not modify or copy the materials</li>
<li>You must not use the materials for any commercial purpose</li>
<li>You must not attempt to decompile or reverse engineer any software contained on Bookera</li>
<li>You must not remove any copyright or other proprietary notations from the materials</li>
</ul>',
            ],
            [
                'title' => '3. User Account',
                'content' => '<p>When you create an account with us, you must provide accurate, complete, and current information. Failure to do so constitutes a breach of the Terms.</p>
<ul>
<li>You are responsible for safeguarding the password</li>
<li>You must notify us immediately of any unauthorized use of your account</li>
<li>We reserve the right to terminate accounts that violate these terms</li>
</ul>',
            ],
            [
                'title' => '4. Book Borrowing Rules',
                'content' => '<p>Users agree to follow all borrowing rules including:</p>
<ul>
<li>Returning books on or before the due date</li>
<li>Taking care of borrowed materials</li>
<li>Paying any late fees or damages as applicable</li>
<li>Not lending borrowed books to others</li>
</ul>',
            ],
            [
                'title' => '5. Limitation of Liability',
                'content' => '<p>Bookera shall not be held liable for any damages arising from the use or inability to use the materials on our platform.</p>',
            ],
            [
                'title' => '6. Modifications',
                'content' => '<p>Bookera may revise these terms of service at any time without notice. By using this system, you agree to be bound by the current version of these terms.</p>',
            ],
            [
                'title' => '7. Contact Information',
                'content' => '<p>For questions about these Terms, please contact us at support@bookera.com</p>',
            ],
        ];

        foreach ($termsOfServices as $terms) {
            TermsOfService::create($terms);
        }
    }
}
