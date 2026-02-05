<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Book;
use App\Models\Category;
use Illuminate\Support\Str;

class BookSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $books = [
            [
                'title' => 'The Great Gatsby',
                'isbn' => '9780743273565',
                'description' => 'A classic American novel set in the Jazz Age, exploring themes of wealth, love, and the American Dream.',
                'author' => 'F. Scott Fitzgerald',
                'publisher' => 'Scribner',
                'publication_year' => 1925,
                'language' => 'English',
                'categories' => ['Fiction']
            ],
            [
                'title' => 'To Kill a Mockingbird',
                'isbn' => '9780061120084',
                'description' => 'A gripping tale of racial injustice and childhood innocence in the American South.',
                'author' => 'Harper Lee',
                'publisher' => 'J.B. Lippincott & Co.',
                'publication_year' => 1960,
                'language' => 'English',
                'categories' => ['Fiction']
            ],
            [
                'title' => '1984',
                'isbn' => '9780451524935',
                'description' => 'A dystopian social science fiction novel about totalitarianism and surveillance.',
                'author' => 'George Orwell',
                'publisher' => 'Secker & Warburg',
                'publication_year' => 1949,
                'language' => 'English',
                'categories' => ['Fiction', 'Science']
            ],
            [
                'title' => 'A Brief History of Time',
                'isbn' => '9780553380163',
                'description' => 'A landmark volume in science writing, exploring the universe and our place in it.',
                'author' => 'Stephen Hawking',
                'publisher' => 'Bantam Books',
                'publication_year' => 1988,
                'language' => 'English',
                'categories' => ['Science', 'Non-Fiction']
            ],
            [
                'title' => 'Clean Code',
                'isbn' => '9780132350884',
                'description' => 'A handbook of agile software craftsmanship.',
                'author' => 'Robert C. Martin',
                'publisher' => 'Prentice Hall',
                'publication_year' => 2008,
                'language' => 'English',
                'categories' => ['Technology', 'Education']
            ],
            [
                'title' => 'Sapiens: A Brief History of Humankind',
                'isbn' => '9780062316097',
                'description' => 'An exploration of the history of the human species from the Stone Age to the modern age.',
                'author' => 'Yuval Noah Harari',
                'publisher' => 'Harper',
                'publication_year' => 2011,
                'language' => 'English',
                'categories' => ['History', 'Non-Fiction']
            ],
            [
                'title' => 'The 7 Habits of Highly Effective People',
                'isbn' => '9781982137274',
                'description' => 'A self-improvement book that presents an approach to being effective in achieving goals.',
                'author' => 'Stephen R. Covey',
                'publisher' => 'Free Press',
                'publication_year' => 1989,
                'language' => 'English',
                'categories' => ['Self-Help', 'Non-Fiction']
            ],
            [
                'title' => 'Harry Potter and the Philosopher\'s Stone',
                'isbn' => '9780439708180',
                'description' => 'The first novel in the Harry Potter series, following a young wizard\'s magical education.',
                'author' => 'J.K. Rowling',
                'publisher' => 'Bloomsbury',
                'publication_year' => 1997,
                'language' => 'English',
                'categories' => ['Fiction', 'Children']
            ],
            [
                'title' => 'The Art of War',
                'isbn' => '9781599869773',
                'description' => 'An ancient Chinese military treatise on strategy and tactics.',
                'author' => 'Sun Tzu',
                'publisher' => 'Various',
                'publication_year' => 2003,
                'language' => 'English',
                'categories' => ['Philosophy', 'History']
            ],
            [
                'title' => 'Steve Jobs',
                'isbn' => '9781451648539',
                'description' => 'The exclusive biography of the co-founder of Apple Inc.',
                'author' => 'Walter Isaacson',
                'publisher' => 'Simon & Schuster',
                'publication_year' => 2011,
                'language' => 'English',
                'categories' => ['Biography', 'Non-Fiction']
            ],
            [
                'title' => 'The Lean Startup',
                'isbn' => '9780307887894',
                'description' => 'A guide for entrepreneurs on how to build a successful startup business.',
                'author' => 'Eric Ries',
                'publisher' => 'Crown Business',
                'publication_year' => 2011,
                'language' => 'English',
                'categories' => ['Technology', 'Self-Help']
            ],
            [
                'title' => 'Introduction to Algorithms',
                'isbn' => '9780262033848',
                'description' => 'A comprehensive textbook on computer algorithms.',
                'author' => 'Thomas H. Cormen',
                'publisher' => 'MIT Press',
                'publication_year' => 2009,
                'language' => 'English',
                'categories' => ['Technology', 'Education']
            ],
        ];

        foreach ($books as $bookData) {
            $categories = $bookData['categories'];
            unset($bookData['categories']);

            $book = Book::create([
                'slug' => Str::slug($bookData['title']),
                'title' => $bookData['title'],
                'isbn' => $bookData['isbn'],
                'description' => $bookData['description'],
                'author' => $bookData['author'],
                'publisher' => $bookData['publisher'],
                'publication_year' => $bookData['publication_year'],
                'language' => $bookData['language'],
                'is_active' => true,
            ]);

            // Attach categories to book
            foreach ($categories as $categoryName) {
                $category = Category::where('name', $categoryName)->first();
                if ($category) {
                    $book->categories()->attach($category->id);
                }
            }
        }
    }
}
