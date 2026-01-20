import React, { useEffect, useState } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import api from '../services/api';
import { Book, Category, PaginatedResponse } from '../types';
import BookCard from '../components/BookCard';
import SearchBar from '../components/SearchBar';
import './CatalogPage.css';

const CatalogPage: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [lastPage, setLastPage] = useState<number>(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  
  const searchQuery = searchParams.get('search') || '';
  const categoryFilter = searchParams.get('category') || '';
  const isNewPage = location.pathname === '/new';

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [currentPage, searchQuery, categoryFilter, isNewPage]);

  const fetchCategories = async (): Promise<void> => {
    try {
      const response = await api.get<Category[]>('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchBooks = async (): Promise<void> => {
    setLoading(true);
    try {
      let endpoint = '/books';
      
      if (isNewPage && !searchQuery && !categoryFilter) {
        endpoint = '/books/new';
        const response = await api.get(endpoint);
        const booksData = Array.isArray(response.data) ? response.data : response.data.data || [];
        setBooks(booksData);
        setLastPage(1);
      } else {
        const params: any = { page: currentPage };
        if (searchQuery) {
          params.search = searchQuery;
        }
        if (categoryFilter) {
          params.category = categoryFilter;
        }

        const response = await api.get<PaginatedResponse<Book>>(endpoint, { params });
        setBooks(response.data.data);
        setLastPage(response.data.last_page);
      }
    } catch (error) {
      console.error('Error fetching books:', error);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string): void => {
    const newParams: any = {};
    if (query.trim()) {
      newParams.search = query;
    }
    if (categoryFilter) {
      newParams.category = categoryFilter;
    }
    setSearchParams(newParams);
    setCurrentPage(1);
  };

  const handleCategoryFilter = (categoryId: string): void => {
    const newParams: any = {};
    if (searchQuery) {
      newParams.search = searchQuery;
    }
    if (categoryId) {
      newParams.category = categoryId;
    }
    setSearchParams(newParams);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="catalog-page">
      <div className="catalog-container">
        <div className="catalog-header">
          <h1 className="catalog-title">{isNewPage ? 'Novinky' : 'Katalog knih'}</h1>
          <div className="catalog-search">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>

        {!isNewPage && (
          <div className="category-filter">
            <button
              className={categoryFilter === '' ? 'category-btn active' : 'category-btn'}
              onClick={() => handleCategoryFilter('')}
            >
              Všetky kategórie
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                className={categoryFilter === category.id.toString() ? 'category-btn active' : 'category-btn'}
                onClick={() => handleCategoryFilter(category.id.toString())}
              >
                {category.name}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="loading">Nahravam...</div>
        ) : books.length === 0 ? (
          <div className="no-results">
            <p>Žiadne knihy neboli nájdené</p>
          </div>
        ) : (
          <>
            <div className="books-grid">
              {books.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>

            {!isNewPage && lastPage > 1 && (
              <div className="pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  ← Predchádzajúca
                </button>
                <span className="pagination-info">
                  Strana {currentPage} z {lastPage}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === lastPage}
                  className="pagination-btn"
                >
                  Ďalšia →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CatalogPage;