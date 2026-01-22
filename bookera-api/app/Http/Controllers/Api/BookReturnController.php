<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Loan;
use App\Models\BookReturn;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BookReturnController extends Controller
{
    public function store(Request $request, Loan $loan)
    {
        $data = $request->validate([
            'copies' => 'required|array'
        ]);

        return DB::transaction(function () use ($loan, $data) {

            $return = BookReturn::create([
                'loan_id' => $loan->id,
                'return_date' => now()
            ]);

            foreach ($data['copies'] as $copy) {
                $return->details()->create([
                    'book_copy_id' => $copy['book_copy_id'],
                    'condition' => $copy['condition'] ?? 'good'
                ]);

                $returnCopy = $loan->details()
                    ->where('book_copy_id', $copy['book_copy_id'])
                    ->firstOrFail()
                    ->bookCopy;

                $returnCopy->update([
                    'status' => $copy['condition'] === 'lost'
                        ? 'lost'
                        : 'available'
                ]);
            }

            $loan->update(['status' => 'returned']);

            return $return->load('details.bookCopy.book');
        });
    }
}
