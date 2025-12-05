
import './App.css';
import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import BooksPage from './pages/BooksPage';
import UsersPage from './pages/UsersPage';
import ReservationsPage from './pages/ReservationsPage';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import HomePage from './pages/HomePage';
import BookDetail from './pages/BookDetail';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';

const App: React.FC = () => (
  <BrowserRouter>
    <div className="app-root">
      <Header />
      <div className="app-body">
        <Sidebar />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/books" element={<BooksPage />} />
            <Route path="/books/:id" element={<BookDetail />} />
            <Route
              path="/users"
              element={<ProtectedRoute roles={["admin"]}>{<UsersPage />}</ProtectedRoute>}
            />
            <Route path="/reservations" element={<ReservationsPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </main>
      </div>
      <footer className="app-footer">Library App © 2025</footer>
    </div>
  </BrowserRouter>
);

export default App;
