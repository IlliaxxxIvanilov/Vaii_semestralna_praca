import React, { useState } from 'react';

const BookForm: React.FC<{ onSubmit: (data: any) => void, initial?: any }> = ({ onSubmit, initial = {} }) => {
  const [title, setTitle] = useState(initial.title || '');
  const [author, setAuthor] = useState(initial.author || '');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const errs: any = {};
    if (!title) errs.title = 'Title is required';
    if (!author) errs.author = 'Author is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onSubmit({ title, author });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Title</label>
        <input value={title} onChange={e => setTitle(e.target.value)} />
        {errors.title && <span className="error">{errors.title}</span>}
      </div>
      <div>
        <label>Author</label>
        <input value={author} onChange={e => setAuthor(e.target.value)} />
        {errors.author && <span className="error">{errors.author}</span>}
      </div>
      <button type="submit">Save</button>
    </form>
  );
};
export default BookForm;
