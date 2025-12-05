<?php

namespace App\Http\Controllers;

use App\Models\Book;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BookController extends Controller
{
    public function index(Request $request)
    {
        $query = Book::query();
        if ($request->has('search')) {
            $query->where('title', 'like', '%'.$request->search.'%');
        }
        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'author' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);
        $book = Book::create($validated);
        return response()->json($book, 201);
    }

    public function show($id)
    {
        return Book::findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $book = Book::findOrFail($id);
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'author' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);
        $book->update($validated);
        return response()->json($book);
    }

    public function destroy($id)
    {
        Book::destroy($id);
        return response()->json(null, 204);
    }
}
