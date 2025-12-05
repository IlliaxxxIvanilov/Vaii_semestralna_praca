<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $allowedRoles = ['user', 'librarian'];

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6|confirmed',
            'role' => 'nullable|string|in:' . implode(',', $allowedRoles),
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $email = $request->input('email');
        $parts = explode('@', $email);
        if (count($parts) === 2) {
            $domain = $parts[1];
            $hasMx = false;
            if (function_exists('checkdnsrr')) {
                $hasMx = checkdnsrr($domain, 'MX');
            } elseif (function_exists('getmxrr')) {
                $hosts = [];
                $hasMx = getmxrr($domain, $hosts);
            }

            if (! $hasMx) {
                return response()->json(['message' => 'Email domain has no MX records or is not reachable'], 422);
            }
        }

        $requestedRole = $request->input('role', 'user');
        $role = 'user';

        $actor = $request->user();
        if ($actor && $actor->role === 'librarian') {
            if (in_array($requestedRole, $allowedRoles)) {
                $role = $requestedRole;
            }
        } else {
            $role = 'user';
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => $request->password,
            'role' => $role,
        ]);

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json(['user' => $user, 'token' => $token], 201);
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        // Revoke previous tokens (optional)
        $user->tokens()->delete();

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json(['user' => $user, 'token' => $token], 200);
    }

    public function logout(Request $request)
    {
        $user = $request->user();
        if ($user) {
            $user->tokens()->delete();
        }

        return response()->json(['message' => 'Logged out'], 200);
    }
}
