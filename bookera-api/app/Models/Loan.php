<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Loan extends Model
{
    protected $table = 'loans';

    protected $fillable = [
        'user_id',
        'loan_date',
        'due_date',
        'status',
    ];

    protected $appends = ['approval_status'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function loanDetails()
    {
        return $this->hasMany(LoanDetail::class);
    }

    public function details()
    {
        return $this->loanDetails();
    }

    public function bookReturns()
    {
        return $this->hasMany(BookReturn::class);
    }

    public function fines()
    {
        return $this->hasMany(Fine::class);
    }

    public function lostBook()
    {
        return $this->hasOne(LostBook::class);
    }

    public function lostBooks()
    {
        return $this->hasMany(LostBook::class);
    }

    public function getApprovalStatusAttribute(): string
    {
        $details = $this->loanDetails;
        
        if ($details->isEmpty()) {
            return 'pending';
        }

        $totalDetails = $details->count();
        $approvedCount = $details->where('approval_status', 'approved')->count();
        $rejectedCount = $details->where('approval_status', 'rejected')->count();
        $pendingCount = $details->where('approval_status', 'pending')->count();

        if ($pendingCount === $totalDetails) {
            return 'pending';
        }

        if ($approvedCount === $totalDetails) {
            return 'approved';
        }

        if ($rejectedCount === $totalDetails) {
            return 'rejected';
        }

        if ($pendingCount > 0) {
            return 'processing';
        }

        return 'partial';
    }

    public function scopeWithApprovalStatus($query, $status)
    {
        return $query->whereHas('loanDetails', function ($q) use ($status) {
            if ($status === 'pending') {
                $q->where('approval_status', 'pending');
            } elseif ($status === 'approved') {
                $q->where('approval_status', 'approved')
                  ->havingRaw('COUNT(*) = (SELECT COUNT(*) FROM loan_details WHERE loan_id = loans.id)');
            } elseif ($status === 'rejected') {
                $q->where('approval_status', 'rejected')
                  ->havingRaw('COUNT(*) = (SELECT COUNT(*) FROM loan_details WHERE loan_id = loans.id)');
            }
        });
    }
}
