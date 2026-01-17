<?php

namespace App\Http\Controllers;

use App\Models\File;
use App\Models\Book;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class FileController extends Controller
{
    public function uploadCover(Request $request, $bookId)
    {
        $validator = Validator::make($request->all(), [
            'cover' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $book = Book::find($bookId);
        if (!$book) {
            return response()->json(['message' => 'Book not found'], 404);
        }

        $oldCover = File::where('book_id', $bookId)->where('type', 'cover')->first();
        if ($oldCover) {
            Storage::disk('public')->delete($oldCover->path);
            $oldCover->delete();
        }

        $coverFile = $request->file('cover');
        $path = $coverFile->store('covers', 'public');

        $file = File::create([
            'book_id' => $bookId,
            'type' => 'cover',
            'path' => $path,
            'mime_type' => $coverFile->getMimeType(),
            'size' => $coverFile->getSize(),
            'uploaded_at' => now(),
        ]);

        return response()->json([
            'message' => 'Cover uploaded successfully',
            'file' => $file,
            'url' => Storage::url($path)
        ], 201);
    }

    public function uploadPdf(Request $request, $bookId)
    {
        $validator = Validator::make($request->all(), [
            'pdf' => 'required|file|mimes:pdf|max:10240',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $book = Book::find($bookId);
        if (!$book) {
            return response()->json(['message' => 'Book not found'], 404);
        }

        $oldPdf = File::where('book_id', $bookId)->where('type', 'pdf')->first();
        if ($oldPdf) {
            Storage::disk('public')->delete($oldPdf->path);
            $oldPdf->delete();
        }

        $pdfFile = $request->file('pdf');
        $path = $pdfFile->store('pdfs', 'public');

        $file = File::create([
            'book_id' => $bookId,
            'type' => 'pdf',
            'path' => $path,
            'mime_type' => $pdfFile->getMimeType(),
            'size' => $pdfFile->getSize(),
            'uploaded_at' => now(),
        ]);

        return response()->json([
            'message' => 'PDF uploaded successfully',
            'file' => $file,
            'url' => Storage::url($path)
        ], 201);
    }

    public function downloadPdf($bookId)
    {
        $file = File::where('book_id', $bookId)->where('type', 'pdf')->first();

        if (!$file) {
            return response()->json(['message' => 'PDF not found'], 404);
        }

        $filePath = storage_path('app/public/' . $file->path);

        if (!file_exists($filePath)) {
            return response()->json(['message' => 'File not found on server'], 404);
        }

        return response()->download($filePath);
    }

    public function destroy($fileId)
    {
        $file = File::find($fileId);

        if (!$file) {
            return response()->json(['message' => 'File not found'], 404);
        }

        Storage::disk('public')->delete($file->path);
        $file->delete();

        return response()->json(['message' => 'File deleted successfully'], 200);
    }
}