<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BookController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RatingController;
use App\Http\Controllers\FileController;
use App\Http\Controllers\CategoryController;

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

Route::prefix('books')->group(function () {
    Route::get('/', [BookController::class, 'index']);
    Route::get('/popular', [BookController::class, 'popular']);
    Route::get('/new', [BookController::class, 'newBooks']);
    Route::get('/{id}', [BookController::class, 'show']);
});

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{id}', [CategoryController::class, 'show']);

Route::get('/books/{bookId}/ratings', [RatingController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {
    
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    
    Route::get('/profile', [UserController::class, 'profile']);
    Route::put('/profile', [UserController::class, 'update']);
    
    Route::prefix('reservations')->group(function () {
        Route::get('/my', [ReservationController::class, 'myReservations']);
        Route::post('/', [ReservationController::class, 'store']);
        Route::put('/{id}/cancel', [ReservationController::class, 'cancel']);
    });

    Route::post('/books/{bookId}/ratings', [RatingController::class, 'store']);
    Route::delete('/books/{bookId}/ratings', [RatingController::class, 'destroy']);

    Route::get('/books/{bookId}/download-pdf', [FileController::class, 'downloadPdf']);
    
    Route::middleware('role:librarian,admin')->group(function () {
        Route::get('/reservations', [ReservationController::class, 'index']);
        Route::get('/reservations/{id}', [ReservationController::class, 'show']);
        Route::put('/reservations/{id}/status', [ReservationController::class, 'updateStatus']);
    });
    
    Route::middleware('role:admin')->group(function () {
        
        Route::post('/books', [BookController::class, 'store']);
        Route::put('/books/{id}', [BookController::class, 'update']);
        Route::delete('/books/{id}', [BookController::class, 'destroy']);
        
        Route::post('/categories', [CategoryController::class, 'store']);
        Route::put('/categories/{id}', [CategoryController::class, 'update']);
        Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);
        
        Route::get('/users', [UserController::class, 'index']);
        Route::get('/users/{id}', [UserController::class, 'show']);
        Route::put('/users/{id}', [UserController::class, 'update']);
        Route::delete('/users/{id}', [UserController::class, 'destroy']);
        Route::put('/users/{id}/role', [UserController::class, 'changeRole']);
        
        Route::post('/books/{bookId}/upload-cover', [FileController::class, 'uploadCover']);
        Route::post('/books/{bookId}/upload-pdf', [FileController::class, 'uploadPdf']);
        Route::delete('/files/{fileId}', [FileController::class, 'destroy']);
        
        Route::delete('/reservations/{id}', [ReservationController::class, 'destroy']);
    });
});