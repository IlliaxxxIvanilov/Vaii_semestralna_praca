<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    protected $fillable = [
        'user_id',
        'book_id',
        'status',
        'reserved_at',
        'due_date',
        'handled_by',
    ];

    protected $casts = [
        'reserved_at' => 'datetime',
        'due_date' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function book()
    {
        return $this->belongsTo(Book::class);
    }

    public function handler()
    {
        return $this->belongsTo(User::class, 'handled_by');
    }
}