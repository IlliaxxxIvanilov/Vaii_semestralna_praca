<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    protected $fillable = [
        'title',
        'author',
        'description',
        'isbn',
        'available_copies',
        'total_copies',
    ];

    public function files()
    {
        return $this->hasMany(File::class);
    }

    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }

    public function ratings()
    {
        return $this->hasMany(Rating::class);
    }

    public function categories()
    {
        return $this->belongsToMany(Category::class, 'book_category');
    }

    public function isAvailable()
    {
        return $this->available_copies > 0;
    }

    public function getCoverUrl()
    {
        $cover = $this->files()->where('type', 'cover')->first();
        return $cover ? asset('storage/' . $cover->path) : null;
    }

    public function hasPdf()
    {
        return $this->files()->where('type', 'pdf')->exists();
    }

    public function getAverageRating()
    {
        return $this->ratings()->avg('rating') ?? 0;
    }

    public function getRatingsCount()
    {
        return $this->ratings()->count();
    }
}