<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'author' => $this->author,
            'description' => $this->description,
            'isbn' => $this->isbn,
            'available_copies' => $this->available_copies,
            'total_copies' => $this->total_copies,
            'is_available' => $this->isAvailable(),
            'cover_url' => $this->getCoverUrl(),
            'has_pdf' => $this->hasPdf(),
            'average_rating' => round($this->getAverageRating(), 1),
            'ratings_count' => $this->getRatingsCount(),
            'categories' => $this->whenLoaded('categories', function() {
                return $this->categories->map(function($category) {
                    return [
                        'id' => $category->id,
                        'name' => $category->name,
                    ];
                });
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}