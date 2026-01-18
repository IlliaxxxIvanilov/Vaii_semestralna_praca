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
            'cover' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120', // Zvýšená veľkosť na 5MB
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $book = Book::find($bookId);
        if (!$book) {
            return response()->json(['message' => 'Book not found'], 404);
        }

        // Vymazať starý cover
        $oldCover = File::where('book_id', $bookId)->where('type', 'cover')->first();
        if ($oldCover) {
            Storage::disk('public')->delete($oldCover->path);
            $oldCover->delete();
        }

        $coverFile = $request->file('cover');
        
        // Generovať unique názov súboru
        $fileName = time() . '_' . uniqid() . '.' . $coverFile->getClientOriginalExtension();
        
        // Uložiť do storage/app/public/covers/
        $path = $coverFile->storeAs('covers', $fileName, 'public');

        $file = File::create([
            'book_id' => $bookId,
            'type' => 'cover',
            'path' => $path,
            'mime_type' => $coverFile->getMimeType(),
            'size' => $coverFile->getSize(),
            'uploaded_at' => now(),
        ]);

        // Vrátiť absolútnu URL
        $fullUrl = url('storage/' . $path);

        return response()->json([
            'message' => 'Cover uploaded successfully',
            'file' => $file,
            'url' => $fullUrl,
            'path' => $path,
            'debug' => [
                'storage_path' => storage_path('app/public/' . $path),
                'file_exists' => file_exists(storage_path('app/public/' . $path)),
                'public_link_exists' => file_exists(public_path('storage')),
                'app_url' => config('app.url'),
            ]
        ], 201);
    }

    public function uploadPdf(Request $request, $bookId)
    {
        $validator = Validator::make($request->all(), [
            'pdf' => 'required|file|mimes:pdf|max:20480', // 20MB
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
        
        // Generovať unique názov súboru
        $fileName = time() . '_' . uniqid() . '.pdf';
        
        $path = $pdfFile->storeAs('pdfs', $fileName, 'public');

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
            'url' => url('storage/' . $path)
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

    // NOVÁ METÓDA: Priame zobrazenie cover obrázka
    public function getCover($bookId)
    {
        $file = File::where('book_id', $bookId)
            ->where('type', 'cover')
            ->first();

        if (!$file) {
            // Vrátiť placeholder obrázok alebo 404
            return response()->json(['message' => 'Cover not found'], 404);
        }

        $filePath = storage_path('app/public/' . $file->path);

        if (!file_exists($filePath)) {
            return response()->json([
                'message' => 'File not found on server',
                'path' => $file->path,
                'expected_location' => $filePath
            ], 404);
        }

        // Vrátiť obrázok s správnymi headers
        return response()->file($filePath, [
            'Content-Type' => $file->mime_type,
            'Cache-Control' => 'public, max-age=31536000',
        ]);
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

    // DEBUGOVACIA METÓDA - odstráňte po oprave
    public function debugStorage()
    {
        $covers = File::where('type', 'cover')->get();
        
        $debug = [
            'storage_link_exists' => is_link(public_path('storage')),
            'storage_path' => storage_path('app/public'),
            'public_storage_path' => public_path('storage'),
            'app_url' => config('app.url'),
            'covers' => $covers->map(function($file) {
                $path = storage_path('app/public/' . $file->path);
                return [
                    'id' => $file->id,
                    'book_id' => $file->book_id,
                    'path' => $file->path,
                    'full_path' => $path,
                    'exists' => file_exists($path),
                    'url' => url('storage/' . $file->path),
                    'size' => $file->size,
                    'readable' => is_readable($path),
                ];
            }),
        ];

        return response()->json($debug);
    }
}