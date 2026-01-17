<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Http\Resources\BookResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BookController extends Controller
{
    // get all books with pagination
    public function index(Request $request)
    {
        $query = Book::with('files', 'categories', 'ratings');

        // search by title, author, or description
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('author', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('isbn', 'like', "%{$search}%");
            });
        }

        // filter by author
        if ($request->has('author')) {
            $query->where('author', 'like', "%{$request->author}%");
        }

        // OPRAVA: filter by category - SPRÁVNA SYNTAX
        if ($request->has('category') && $request->category != '') {
            $query->whereHas('categories', function($q) use ($request) {
                $q->where('category_id', $request->category);
            });
        }

        // sort by
        if ($request->has('sort')) {
            $sortField = $request->sort;
            $sortOrder = $request->get('order', 'asc');
            $query->orderBy($sortField, $sortOrder);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $books = $query->paginate(12);

        // Transform data
        $books->getCollection()->transform(function($book) {
            return [
                'id' => $book->id,
                'title' => $book->title,
                'author' => $book->author,
                'description' => $book->description,
                'isbn' => $book->isbn,
                'available_copies' => $book->available_copies,
                'total_copies' => $book->total_copies,
                'is_available' => $book->isAvailable(),
                'cover_url' => $book->getCoverUrl(),
                'has_pdf' => $book->hasPdf(),
                'average_rating' => (float) round($book->getAverageRating(), 1),
                'ratings_count' => (int) $book->getRatingsCount(),
                'categories' => $book->categories,
            ];
        });

        return response()->json($books, 200);
    }

    // get single book detail
    public function show($id)
    {
        $book = Book::with('files', 'reservations', 'categories', 'ratings')->find($id);

        if (!$book) {
            return response()->json(['message' => 'Book not found'], 404);
        }

        $response = [
            'id' => $book->id,
            'title' => $book->title,
            'author' => $book->author,
            'description' => $book->description,
            'isbn' => $book->isbn,
            'available_copies' => $book->available_copies,
            'total_copies' => $book->total_copies,
            'is_available' => $book->isAvailable(),
            'cover_url' => $book->getCoverUrl(),
            'has_pdf' => $book->hasPdf(),
            'average_rating' => (float) round($book->getAverageRating(), 1),
            'ratings_count' => (int) $book->getRatingsCount(),
            'categories' => $book->categories->map(function($cat) {
                return [
                    'id' => $cat->id,
                    'name' => $cat->name,
                ];
            }),
            'created_at' => $book->created_at,
            'updated_at' => $book->updated_at,
        ];

        return response()->json($response, 200);
    }

    // create new book (admin only)
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'author' => 'required|string|max:255',
            'description' => 'nullable|string',
            'isbn' => 'nullable|string',
            'total_copies' => 'required|integer|min:0',
            'categories' => 'nullable|array',
            'categories.*' => 'exists:categories,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $book = Book::create([
            'title' => $request->title,
            'author' => $request->author,
            'description' => $request->description,
            'isbn' => $request->isbn,
            'total_copies' => $request->total_copies,
            'available_copies' => $request->total_copies,
        ]);

        if ($request->has('categories')) {
            $book->categories()->attach($request->categories);
        }

        return response()->json([
            'message' => 'Book created successfully',
            'book' => $book->load('categories')
        ], 201);
    }

    // update book (admin only)
    public function update(Request $request, $id)
    {
        $book = Book::find($id);

        if (!$book) {
            return response()->json(['message' => 'Book not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string|max:255',
            'author' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'isbn' => 'nullable|string',
            'total_copies' => 'sometimes|integer|min:0',
            'categories' => 'nullable|array',
            'categories.*' => 'exists:categories,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $book->update($request->all());

        if ($request->has('categories')) {
            $book->categories()->sync($request->categories);
        }

        return response()->json([
            'message' => 'Book updated successfully',
            'book' => $book->load('categories')
        ], 200);
    }

    // delete book (admin only)
    public function destroy($id)
    {
        $book = Book::find($id);

        if (!$book) {
            return response()->json(['message' => 'Book not found'], 404);
        }

        $book->delete();

        return response()->json(['message' => 'Book deleted successfully'], 200);
    }

    // get popular books (most rated/borrowed)
    public function popular()
    {
        $books = Book::with('files', 'ratings', 'categories')
            ->withCount('ratings')
            ->withAvg('ratings', 'rating')
            ->orderBy('ratings_count', 'desc')
            ->orderBy('ratings_avg_rating', 'desc')
            ->limit(8)
            ->get()
            ->map(function($book) {
                return [
                    'id' => $book->id,
                    'title' => $book->title,
                    'author' => $book->author,
                    'description' => $book->description,
                    'isbn' => $book->isbn,
                    'available_copies' => $book->available_copies,
                    'total_copies' => $book->total_copies,
                    'is_available' => $book->isAvailable(),
                    'cover_url' => $book->getCoverUrl(),
                    'has_pdf' => $book->hasPdf(),
                    'average_rating' => (float) round($book->getAverageRating(), 1),
                    'ratings_count' => (int) $book->getRatingsCount(),
                    'categories' => $book->categories,
                ];
            });

        return response()->json($books, 200);
    }

    // get new books
    public function newBooks()
    {
        $books = Book::with('files', 'ratings', 'categories')
            ->orderBy('created_at', 'desc')
            ->limit(12)
            ->get()
            ->map(function($book) {
                return [
                    'id' => $book->id,
                    'title' => $book->title,
                    'author' => $book->author,
                    'description' => $book->description,
                    'isbn' => $book->isbn,
                    'available_copies' => $book->available_copies,
                    'total_copies' => $book->total_copies,
                    'is_available' => $book->isAvailable(),
                    'cover_url' => $book->getCoverUrl(),
                    'has_pdf' => $book->hasPdf(),
                    'average_rating' => (float) round($book->getAverageRating(), 1),
                    'ratings_count' => (int) $book->getRatingsCount(),
                    'categories' => $book->categories,
                ];
            });

        return response()->json($books, 200);
    }
}