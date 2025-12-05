<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use Illuminate\Http\Request;

class ReservationController extends Controller
{
    public function index()
    {
        return response()->json(Reservation::with(['user', 'book'])->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'book_id' => 'required|exists:books,id',
            'reserved_from' => 'required|date',
            'reserved_to' => 'required|date|after_or_equal:reserved_from',
        ]);
        $reservation = Reservation::create($validated);
        return response()->json($reservation, 201);
    }

    public function show($id)
    {
        return Reservation::with(['user', 'book'])->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $reservation = Reservation::findOrFail($id);
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'book_id' => 'required|exists:books,id',
            'reserved_from' => 'required|date',
            'reserved_to' => 'required|date|after_or_equal:reserved_from',
        ]);
        $reservation->update($validated);
        return response()->json($reservation);
    }

    public function destroy($id)
    {
        Reservation::destroy($id);
        return response()->json(null, 204);
    }
}
