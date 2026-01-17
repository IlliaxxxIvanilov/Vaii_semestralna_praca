<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Models\Book;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ReservationController extends Controller
{
    public function index(Request $request)
    {
        $query = Reservation::with('user', 'book', 'handler');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $reservations = $query->orderBy('reserved_at', 'desc')->paginate(20);

        return response()->json($reservations, 200);
    }

    public function myReservations(Request $request)
    {
        $reservations = Reservation::with('book')
            ->where('user_id', $request->user()->id)
            ->orderBy('reserved_at', 'desc')
            ->get();

        return response()->json($reservations, 200);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'book_id' => 'required|exists:books,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $book = Book::find($request->book_id);

        if (!$book->isAvailable()) {
            return response()->json(['message' => 'Book is not available'], 400);
        }

        $existingReservation = Reservation::where('user_id', $request->user()->id)
            ->where('book_id', $request->book_id)
            ->whereIn('status', ['pending', 'approved'])
            ->first();

        if ($existingReservation) {
            return response()->json(['message' => 'You already have an active reservation for this book'], 400);
        }

        $reservation = Reservation::create([
            'user_id' => $request->user()->id,
            'book_id' => $request->book_id,
            'status' => 'pending',
            'reserved_at' => now(),
        ]);

        $book->decrement('available_copies');

        return response()->json([
            'message' => 'Reservation created successfully',
            'reservation' => $reservation->load('book')
        ], 201);
    }

    public function show($id)
    {
        $reservation = Reservation::with('user', 'book', 'handler')->find($id);

        if (!$reservation) {
            return response()->json(['message' => 'Reservation not found'], 404);
        }

        return response()->json($reservation, 200);
    }

    public function updateStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:approved,rejected,returned',
            'due_date' => 'nullable|date|after:today',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $reservation = Reservation::find($id);

        if (!$reservation) {
            return response()->json(['message' => 'Reservation not found'], 404);
        }

        $oldStatus = $reservation->status;
        $newStatus = $request->status;

        $reservation->update([
            'status' => $newStatus,
            'due_date' => $request->due_date,
            'handled_by' => $request->user()->id,
        ]);

        $book = $reservation->book;

        if ($oldStatus === 'pending' && $newStatus === 'rejected') {
            $book->increment('available_copies');
        } elseif ($newStatus === 'returned') {
            $book->increment('available_copies');
        }

        return response()->json([
            'message' => 'Reservation status updated successfully',
            'reservation' => $reservation->load('user', 'book', 'handler')
        ], 200);
    }

    public function cancel($id, Request $request)
    {
        $reservation = Reservation::find($id);

        if (!$reservation) {
            return response()->json(['message' => 'Reservation not found'], 404);
        }

        if ($reservation->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($reservation->status !== 'pending') {
            return response()->json(['message' => 'Cannot cancel this reservation'], 400);
        }

        $reservation->update(['status' => 'rejected']);

        $reservation->book->increment('available_copies');

        return response()->json(['message' => 'Reservation cancelled successfully'], 200);
    }

    public function destroy($id)
    {
        $reservation = Reservation::find($id);

        if (!$reservation) {
            return response()->json(['message' => 'Reservation not found'], 404);
        }

        $reservation->delete();

        return response()->json(['message' => 'Reservation deleted successfully'], 200);
    }
}