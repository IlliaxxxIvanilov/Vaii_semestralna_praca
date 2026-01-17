<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Http\Resources\BookResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BookController extends Controller
{
    public function index(Request $request)
    {
        $query = Book::with('files', 'categories', 'ratings');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('author', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('isbn', 'like', "%{$search}%");
            });
        }

        if ($request->has('author')) {
            $query->where('author', 'like', "%{$request->author}%");
        }

        if ($request->has('category')) {
            $query->whereHas('categories', function($q) use ($request) {
                $q->where('categories.id', $request->category);
            });
        }

        if ($request->has('sort')) {
            $sortField = $request->sort;
            $sortOrder = $request->get('order', 'asc');
            $query->orderBy($sortField, $sortOrder);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $books = $query->paginate(12);

        return BookResource::collection($books);
    }

    public function show($id)
    {
        $book = Book::with('files', 'reservations', 'categories', 'ratings')->find($id);

        if (!$book) {
            return response()->json(['message' => 'Book not found'], 404);
        }

        return new BookResource($book);
    }

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
            'book' => new BookResource($book->load('categories'))
        ], 201);
    }

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
            'book' => new BookResource($book->load('categories'))
        ], 200);
    }

    public function destroy($id)
    {
        $book = Book::find($id);

        if (!$book) {
            return response()->json(['message' => 'Book not found'], 404);
        }

        $book->delete();

        return response()->json(['message' => 'Book deleted successfully'], 200);
    }

    public function popular()
    {
        $books = Book::with('files', 'ratings', 'categories')
            ->withCount('ratings')
            ->withAvg('ratings', 'rating')
            ->orderBy('ratings_count', 'desc')
            ->orderBy('ratings_avg_rating', 'desc')
            ->limit(8)
            ->get();

        return BookResource::collection($books);
    }

    public function newBooks()
    {
        $books = Book::with('files', 'ratings', 'categories')
            ->orderBy('created_at', 'desc')
            ->limit(8)
            ->get();

        return BookResource::collection($books);
    }
}