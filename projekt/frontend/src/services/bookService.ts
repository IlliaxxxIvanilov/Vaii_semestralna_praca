import api from './api';

export const fetchBooks = async (search = '') => {
  const res = await api.get('/books', { params: { search } });
  return res.data;
};

export const fetchBook = async (id: number) => {
  const res = await api.get(`/books/${id}`);
  return res.data;
};
