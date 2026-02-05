<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PrivacyPolicy;

class PrivacyPolicySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $privacyPolicies = [
            [
                'title' => '1. Information We Collect',
                'content' => '<p>We collect information that you provide directly to us when you:</p>
<ul>
<li>Create an account</li>
<li>Borrow books</li>
<li>Contact customer support</li>
<li>Participate in surveys or promotions</li>
</ul>

<h3>Personal Information:</h3>
<ul>
<li>Name and contact information</li>
<li>Student/Member ID</li>
<li>Email address</li>
<li>Profile information</li>
</ul>

<h3>Usage Information:</h3>
<ul>
<li>Borrowing history</li>
<li>Search queries</li>
<li>Reading preferences</li>
<li>Device information</li>
</ul>',
            ],
            [
                'title' => '2. How We Use Your Information',
                'content' => '<p>We use the information we collect to:</p>
<ul>
<li>Provide, maintain, and improve our services</li>
<li>Process book loans and returns</li>
<li>Send you technical notices and support messages</li>
<li>Communicate with you about books, recommendations, and library updates</li>
<li>Monitor and analyze trends, usage, and activities</li>
<li>Detect, investigate and prevent fraudulent activities</li>
</ul>',
            ],
            [
                'title' => '3. Information Sharing',
                'content' => '<p>We do not share your personal information with third parties except:</p>
<ul>
<li>With your consent</li>
<li>To comply with legal obligations</li>
<li>To protect our rights and safety</li>
<li>In connection with a merger or acquisition</li>
</ul>',
            ],
            [
                'title' => '4. Data Security',
                'content' => '<p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>',
            ],
            [
                'title' => '5. Your Rights',
                'content' => '<p>You have the right to:</p>
<ul>
<li>Access your personal information</li>
<li>Correct inaccurate data</li>
<li>Request deletion of your data</li>
<li>Object to processing of your data</li>
<li>Export your data</li>
</ul>',
            ],
            [
                'title' => '6. Cookies and Tracking',
                'content' => '<p>We use cookies and similar tracking technologies to track activity on our service and hold certain information to improve our service.</p>',
            ],
            [
                'title' => '7. Children\'s Privacy',
                'content' => '<p>Our service is intended for users aged 13 and above. We do not knowingly collect information from children under 13.</p>',
            ],
            [
                'title' => '8. Changes to Privacy Policy',
                'content' => '<p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the effective date.</p>',
            ],
            [
                'title' => '9. Contact Us',
                'content' => '<p>If you have questions about this Privacy Policy, please contact us at:</p>
<ul>
<li>Email: privacy@bookera.com</li>
<li>Phone: +62 xxx xxxx xxxx</li>
</ul>',
            ],
        ];

        foreach ($privacyPolicies as $policy) {
            PrivacyPolicy::create($policy);
        }
    }
}
