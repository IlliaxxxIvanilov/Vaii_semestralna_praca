<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class File extends Model
{
    protected $fillable = [
        'book_id',
        'type',
        'path',
        'mime_type',
        'size',
        'uploaded_at',
    ];

    protected $casts = [
        'uploaded_at' => 'datetime',
    ];

    public function book()
    {
        return $this->belongsTo(Book::class);
    }
}