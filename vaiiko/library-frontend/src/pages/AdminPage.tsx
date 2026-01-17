import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Book, User, Category } from '../types';
import { useAuth } from '../context/AuthContext';
import './AdminPage.css';

type TabType = 'books' | 'users' | 'categories';

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('books');
  const [books, setBooks] = useState<Book[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showBookModal, setShowBookModal] = useState<boolean>(false);
  const [showCategoryModal, setShowCategoryModal] = useState<boolean>(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    description: '',
    isbn: '',
    total_copies: 1,
    categories: [] as number[],
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
  });

  useEffect(() => {
    if (!isAuthenticated || user?.role.name !== 'admin') {
      navigate('/');
      return;
    }
    fetchCategories();
    if (activeTab === 'books') {
      fetchBooks();
    } else if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab, isAuthenticated, user]);

  const fetchBooks = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await api.get<{ data: Book[] }>('/books');
      setBooks(response.data.data);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await api.get<{ data: User[] }>('/users');
      setUsers(response.data.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async (): Promise<void> => {
    try {
      const response = await api.get<Category[]>('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleBookFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setBookForm(prev => ({
      ...prev,
      [name]: name === 'total_copies' ? parseInt(value) : value,
    }));
  };

  const handleCategoryToggle = (categoryId: number): void => {
    setBookForm(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId],
    }));
  };

  const handleCreateBook = (): void => {
    setEditingBook(null);
    setBookForm({
      title: '',
      author: '',
      description: '',
      isbn: '',
      total_copies: 1,
      categories: [],
    });
    setShowBookModal(true);
  };

  const handleEditBook = (book: Book): void => {
    setEditingBook(book);
    setBookForm({
      title: book.title,
      author: book.author,
      description: book.description || '',
      isbn: book.isbn || '',
      total_copies: book.total_copies,
      categories: book.categories?.map(c => c.id) || [],
    });
    setShowBookModal(true);
  };

  const handleSubmitBook = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    try {
      if (editingBook) {
        await api.put(`/books/${editingBook.id}`, bookForm);
        alert('Kniha bola aktualizovaná');
      } else {
        await api.post('/books', bookForm);
        alert('Kniha bola vytvorená');
      }
      setShowBookModal(false);
      fetchBooks();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Operácia zlyhala');
    }
  };

  const handleDeleteBook = async (id: number): Promise<void> => {
    if (!window.confirm('Naozaj chcete vymazať túto knihu?')) {
      return;
    }

    try {
      await api.delete(`/books/${id}`);
      alert('Kniha bola vymazaná');
      fetchBooks();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Vymazanie zlyhalo');
    }
  };

  const handleUploadCover = async (bookId: number): Promise<void> => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('cover', file);

      try {
        await api.post(`/books/${bookId}/upload-cover`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        alert('Obal bol nahraný');
        fetchBooks();
      } catch (error: any) {
        alert(error.response?.data?.message || 'Nahrávanie zlyhalo');
      }
    };

    input.click();
  };

  const handleUploadPdf = async (bookId: number): Promise<void> => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf';
    
    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('pdf', file);

      try {
        await api.post(`/books/${bookId}/upload-pdf`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        alert('PDF bol nahraný');
        fetchBooks();
      } catch (error: any) {
        alert(error.response?.data?.message || 'Nahrávanie zlyhalo');
      }
    };

    input.click();
  };

  const handleChangeUserRole = async (userId: string, roleId: number): Promise<void> => {
    try {
      await api.put(`/users/${userId}/role`, { role_id: roleId });
      alert('Rola používateľa bola zmenená');
      fetchUsers();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Zmena role zlyhala');
    }
  };

  const handleDeleteUser = async (userId: string): Promise<void> => {
    if (!window.confirm('Naozaj chcete vymazať tohto používateľa?')) {
      return;
    }

    try {
      await api.delete(`/users/${userId}`);
      alert('Používateľ bol vymazaný');
      fetchUsers();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Vymazanie zlyhalo');
    }
  };

  const handleCreateCategory = (): void => {
    setEditingCategory(null);
    setCategoryForm({ name: '' });
    setShowCategoryModal(true);
  };

  const handleEditCategory = (category: Category): void => {
    setEditingCategory(category);
    setCategoryForm({ name: category.name });
    setShowCategoryModal(true);
  };

  const handleSubmitCategory = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, categoryForm);
        alert('Kategória bola aktualizovaná');
      } else {
        await api.post('/categories', categoryForm);
        alert('Kategória bola vytvorená');
      }
      setShowCategoryModal(false);
      fetchCategories();
      setActiveTab('categories');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Operácia zlyhala');
    }
  };

  const handleDeleteCategory = async (id: number): Promise<void> => {
    if (!window.confirm('Naozaj chcete vymazať túto kategóriu?')) {
      return;
    }

    try {
      await api.delete(`/categories/${id}`);
      alert('Kategória bola vymazaná');
      fetchCategories();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Vymazanie zlyhalo');
    }
  };

  if (loading) {
    return <div className="loading-page">Nahrávam...</div>;
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <p>Kompletná správa systému</p>
        </div>

        <div className="admin-tabs">
          <button
            className={activeTab === 'books' ? 'active' : ''}
            onClick={() => setActiveTab('books')}
          >
            📚 Správa kníh
          </button>
          <button
            className={activeTab === 'categories' ? 'active' : ''}
            onClick={() => setActiveTab('categories')}
          >
            🏷️ Správa kategórií
          </button>
          <button
            className={activeTab === 'users' ? 'active' : ''}
            onClick={() => setActiveTab('users')}
          >
            👥 Správa používateľov
          </button>
        </div>

        {activeTab === 'books' && (
          <div className="admin-section">
            <div className="section-header">
              <h2>Knihy ({books.length})</h2>
              <button onClick={handleCreateBook} className="btn-create">
                + Pridať knihu
              </button>
            </div>

            <div className="admin-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Obal</th>
                    <th>Názov</th>
                    <th>Autor</th>
                    <th>Kategórie</th>
                    <th>ISBN</th>
                    <th>Dostupnosť</th>
                    <th>PDF</th>
                    <th>Akcie</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((book) => (
                    <tr key={book.id}>
                      <td>{book.id}</td>
                      <td>
                        {book.cover_url ? (
                          <img 
                            src={book.cover_url} 
                            alt={book.title}
                            className="book-thumbnail"
                          />
                        ) : (
                          <span className="no-cover">📚</span>
                        )}
                      </td>
                      <td>{book.title}</td>
                      <td>{book.author}</td>
                      <td>
                        <div className="table-categories">
                          {book.categories?.map(cat => (
                            <span key={cat.id} className="mini-badge">{cat.name}</span>
                          ))}
                        </div>
                      </td>
                      <td>{book.isbn || '-'}</td>
                      <td>
                        <span className="availability">
                          {book.available_copies}/{book.total_copies}
                        </span>
                      </td>
                      <td>
                        <span className={book.has_pdf ? 'has-pdf' : 'no-pdf'}>
                          {book.has_pdf ? '✓' : '✗'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => handleEditBook(book)}
                            className="btn-edit"
                            title="Upraviť"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleUploadCover(book.id)}
                            className="btn-upload"
                            title="Nahrať obal"
                          >
                            🖼️
                          </button>
                          <button
                            onClick={() => handleUploadPdf(book.id)}
                            className="btn-upload"
                            title="Nahrať PDF"
                          >
                            📄
                          </button>
                          <button
                            onClick={() => handleDeleteBook(book.id)}
                            className="btn-delete"
                            title="Vymazať"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="admin-section">
            <div className="section-header">
              <h2>Kategórie ({categories.length})</h2>
              <button onClick={handleCreateCategory} className="btn-create">
                + Pridať kategóriu
              </button>
            </div>

            <div className="categories-grid">
              {categories.map((category) => (
                <div key={category.id} className="category-card">
                  <h3>{category.name}</h3>
                  <div className="category-actions">
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="btn-edit-small"
                    >
                      ✏️ Upraviť
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="btn-delete-small"
                    >
                      🗑️ Vymazať
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="admin-section">
            <div className="section-header">
              <h2>Používatelia ({users.length})</h2>
            </div>

            <div className="admin-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Meno</th>
                    <th>Email</th>
                    <th>Rola</th>
                    <th>Dátum registrácie</th>
                    <th>Akcie</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.id.substring(0, 8)}...</td>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <select
                          value={u.role.id}
                          onChange={(e) => handleChangeUserRole(u.id, parseInt(e.target.value))}
                          className="role-select"
                          disabled={u.id === user?.id}
                        >
                          <option value="1">Visitor</option>
                          <option value="2">Reader</option>
                          <option value="3">Librarian</option>
                          <option value="4">Admin</option>
                        </select>
                      </td>
                      <td>{new Date(u.created_at).toLocaleDateString('sk-SK')}</td>
                      <td>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="btn-delete"
                          disabled={u.id === user?.id}
                          title="Vymazať"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {showBookModal && (
          <div className="modal-overlay" onClick={() => setShowBookModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingBook ? 'Upraviť knihu' : 'Pridať novú knihu'}</h2>
                <button onClick={() => setShowBookModal(false)} className="modal-close">
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmitBook} className="book-form">
                <div className="form-group">
                  <label htmlFor="title">Názov *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={bookForm.title}
                    onChange={handleBookFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="author">Autor *</label>
                  <input
                    type="text"
                    id="author"
                    name="author"
                    value={bookForm.author}
                    onChange={handleBookFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Popis</label>
                  <textarea
                    id="description"
                    name="description"
                    value={bookForm.description}
                    onChange={handleBookFormChange}
                    rows={4}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="isbn">ISBN</label>
                  <input
                    type="text"
                    id="isbn"
                    name="isbn"
                    value={bookForm.isbn}
                    onChange={handleBookFormChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="total_copies">Počet exemplárov *</label>
                  <input
                    type="number"
                    id="total_copies"
                    name="total_copies"
                    value={bookForm.total_copies}
                    onChange={handleBookFormChange}
                    min="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Kategórie</label>
                  <div className="categories-checkboxes">
                    {categories.map((category) => (
                      <label key={category.id} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={bookForm.categories.includes(category.id)}
                          onChange={() => handleCategoryToggle(category.id)}
                        />
                        <span>{category.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="button" onClick={() => setShowBookModal(false)} className="btn-cancel-modal">
                    Zrušiť
                  </button>
                  <button type="submit" className="btn-submit-modal">
                    {editingBook ? 'Uložiť zmeny' : 'Vytvoriť knihu'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showCategoryModal && (
          <div className="modal-overlay" onClick={() => setShowCategoryModal(false)}>
            <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingCategory ? 'Upraviť kategóriu' : 'Pridať novú kategóriu'}</h2>
                <button onClick={() => setShowCategoryModal(false)} className="modal-close">
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmitCategory} className="book-form">
                <div className="form-group">
                  <label htmlFor="category-name">Názov kategórie *</label>
                  <input
                    type="text"
                    id="category-name"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ name: e.target.value })}
                    required
                    placeholder="napr. Fiction, Science, History..."
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" onClick={() => setShowCategoryModal(false)} className="btn-cancel-modal">
                    Zrušiť
                  </button>
                  <button type="submit" className="btn-submit-modal">
                    {editingCategory ? 'Uložiť zmeny' : 'Vytvoriť kategóriu'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;