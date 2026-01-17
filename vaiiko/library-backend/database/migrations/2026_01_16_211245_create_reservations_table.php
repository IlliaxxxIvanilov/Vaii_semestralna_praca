<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            $table->uuid('user_id');
            $table->foreignId('book_id')->constrained('books')->onDelete('cascade');
            $table->enum('status', ['pending', 'approved', 'rejected', 'returned'])->default('pending');
            $table->timestamp('reserved_at');
            $table->date('due_date')->nullable();
            $table->uuid('handled_by')->nullable();
            $table->timestamps();
            
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('handled_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservations');
    }
};