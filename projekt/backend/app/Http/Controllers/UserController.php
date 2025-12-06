<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index()
    {
        return response()->json(User::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'required|in:visitor,user,librarian,admin',
        ]);
        $validated['password'] = Hash::make($validated['password']);
        $user = User::create($validated);
        return response()->json($user, 201);
    }

    public function show($id)
    {
        return User::findOrFail($id);
    }

    public function update(Request $request, $id)
{
    $user = User::findOrFail($id);

    // Admin môže meniť čokoľvek okrem vlastného účtu (voliteľné)
    if (auth()->id() == $user->id) {
        return response()->json(['message' => 'Nemôžeš upraviť sám seba'], 403);
    }

    $validated = $request->validate([
        'name'  => 'sometimes|required|string|max:255',
        'email' => 'sometimes|required|email|unique:users,email,'.$id,
        'role'  => 'sometimes|required|in:user,librarian,admin', // pridaj librarian
    ]);

    $user->update($validated);

    return response()->json($user);
}

public function toggleLibrarian($id)
{
    $user = User::findOrFail($id);

    if (auth()->id() == $user->id || $user->role_id === 3) {
        return response()->json(['message' => 'Nemôžeš zmeniť túto rolu'], 403);
    }

    // Prepnutie 1 ↔ 2
    $user->role_id = $user->role_id === 2 ? 1 : 2;
    $user->save();

    // Načítaj reláciu a vráť aj názov role
    $user->load('role');

    $roleName = $user->role?->name ?? ($user->role_id === 1 ? 'user' : 'librarian');

    return response()->json([
        'message' => 'Rola bola zmenená',
        'user' => $user,
        'role_name' => $roleName   // ← toto je kľúčové!
    ]);
}

public function destroy($id)
{
    $user = User::findOrFail($id);

    // Nepovoliť zmazanie samého seba
    if (auth()->id() == $user->id) {
        return response()->json(['message' => 'Nemôžeš zmazať sám seba'], 403);
    }

    $user->tokens()->delete(); // zmaž všetky tokeny
    $user->delete();

    return response()->json(null, 204);
}
}
