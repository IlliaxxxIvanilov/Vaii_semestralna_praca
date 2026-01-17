<?php

namespace App\Http\Controllers;

use App\Models\Rating;
use App\Models\Book;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RatingController extends Controller
{
    public function index($bookId)
    {
        $ratings = Rating::with('user:id,name')
            ->where('book_id', $bookId)
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json($ratings, 200);
    }

    public function store(Request $request, $bookId)
    {
        $validator = Validator::make($request->all(), [
            'rating' => 'required|numeric|min:0|max:5',
            'review' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $book = Book::find($bookId);
        if (!$book) {
            return response()->json(['message' => 'Book not found'], 404);
        }

        $rating = Rating::updateOrCreate(
            [
                'book_id' => $bookId,
                'user_id' => $request->user()->id,
            ],
            [
                'rating' => $request->rating,
                'review' => $request->review,
            ]
        );

        return response()->json([
            'message' => 'Rating saved successfully',
            'rating' => $rating,
            'average_rating' => $book->getAverageRating(),
        ], 200);
    }

    public function destroy($bookId, Request $request)
    {
        $rating = Rating::where('book_id', $bookId)
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$rating) {
            return response()->json(['message' => 'Rating not found'], 404);
        }

        $rating->delete();

        return response()->json(['message' => 'Rating deleted successfully'], 200);
    }
}