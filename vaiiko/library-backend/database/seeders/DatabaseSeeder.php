<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\User;
use App\Models\Book;
use App\Models\Category;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $visitorRole = Role::create(['name' => 'visitor']);
        $readerRole = Role::create(['name' => 'reader']);
        $librarianRole = Role::create(['name' => 'librarian']);
        $adminRole = Role::create(['name' => 'admin']);

        User::create([
            'name' => 'Admin User',
            'email' => 'admin@library.com',
            'password' => Hash::make('password123'),
            'role_id' => $adminRole->id,
        ]);

        User::create([
            'name' => 'Librarian User',
            'email' => 'librarian@library.com',
            'password' => Hash::make('password123'),
            'role_id' => $librarianRole->id,
        ]);

        User::create([
            'name' => 'Reader User',
            'email' => 'reader@library.com',
            'password' => Hash::make('password123'),
            'role_id' => $readerRole->id,
        ]);

        $fiction = Category::create(['name' => 'Fiction']);
        $nonFiction = Category::create(['name' => 'Non-Fiction']);
        $sciFi = Category::create(['name' => 'Science Fiction']);
        $fantasy = Category::create(['name' => 'Fantasy']);
        $mystery = Category::create(['name' => 'Mystery']);
        $thriller = Category::create(['name' => 'Thriller']);
        $romance = Category::create(['name' => 'Romance']);
        $horror = Category::create(['name' => 'Horror']);
        $biography = Category::create(['name' => 'Biography']);
        $history = Category::create(['name' => 'History']);

        $book1 = Book::create([
            'title' => 'The Great Gatsby',
            'author' => 'F. Scott Fitzgerald',
            'description' => 'A classic American novel set in the Jazz Age',
            'isbn' => '9780743273565',
            'total_copies' => 5,
            'available_copies' => 5,
        ]);
        $book1->categories()->attach([$fiction->id]);

        $book2 = Book::create([
            'title' => '1984',
            'author' => 'George Orwell',
            'description' => 'Dystopian novel about totalitarianism',
            'isbn' => '9780451524935',
            'total_copies' => 3,
            'available_copies' => 3,
        ]);
        $book2->categories()->attach([$fiction->id, $sciFi->id]);

        $book3 = Book::create([
            'title' => 'To Kill a Mockingbird',
            'author' => 'Harper Lee',
            'description' => 'Novel about racial injustice in the American South',
            'isbn' => '9780061120084',
            'total_copies' => 4,
            'available_copies' => 4,
        ]);
        $book3->categories()->attach([$fiction->id]);

        $book4 = Book::create([
            'title' => 'Harry Potter and the Philosopher\'s Stone',
            'author' => 'J.K. Rowling',
            'description' => 'First book in the Harry Potter series',
            'isbn' => '9780439708180',
            'total_copies' => 6,
            'available_copies' => 6,
        ]);
        $book4->categories()->attach([$fantasy->id, $fiction->id]);

        $book5 = Book::create([
            'title' => 'The Hobbit',
            'author' => 'J.R.R. Tolkien',
            'description' => 'Fantasy adventure novel',
            'isbn' => '9780547928227',
            'total_copies' => 4,
            'available_copies' => 4,
        ]);
        $book5->categories()->attach([$fantasy->id, $fiction->id]);
    }
}