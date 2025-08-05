import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext.jsx';
import './Books.scss';

const Books = () => {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { isDark } = useTheme();

  const categories = [
    'all', 'fiction', 'science', 'technology', 'history', 'biography', 
    'education', 'programming', 'mathematics', 'literature'
  ];

  const searchBooks = async (query = 'programming', category = 'all') => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const searchQuery = category !== 'all' ? `${query}+subject:${category}` : query;
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=20`
      );
      const data = await response.json();
      setBooks(data.items || []);
    } catch (error) {
      console.error('Error fetching books:', error);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    searchBooks('computer science');
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      searchBooks(searchTerm, selectedCategory);
    }
  };

  const handleExploreBook = (book) => {
    const bookUrl = book.volumeInfo.previewLink || book.volumeInfo.infoLink;
    if (bookUrl) {
      window.open(bookUrl, '_blank');
    }
  };

  const formatAuthors = (authors) => {
    if (!authors) return 'Unknown Author';
    return authors.length > 2 ? `${authors.slice(0, 2).join(', ')} & ${authors.length - 2} more` : authors.join(', ');
  };

  const getBookImage = (book) => {
    return book.volumeInfo.imageLinks?.thumbnail || 
           book.volumeInfo.imageLinks?.smallThumbnail || 
           'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjE5MiIgdmlld0JveD0iMCAwIDEyOCAxOTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTkyIiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Ik00MCA2NEg4OFY3Mkg0MFY2NFoiIGZpbGw9IiNkMWQ1ZGIiLz4KPHA+dGggZD0iTTQwIDgwSDg4Vjg4SDQwVjgwWiIgZmlsbD0iI2QxZDVkYiIvPgo8cGF0aCBkPSJNNDAgOTZIODhWMTA0SDQwVjk2WiIgZmlsbD0iI2QxZDVkYiIvPgo8cGF0aCBkPSJNNDAgMTEySDc2VjEyMEg0MFYxMTJaIiBmaWxsPSIjZDFkNWRiIi8+CjwvZz4KPC9zdmc+';
  };

  return (
    <div className="books-container" data-theme={isDark ? 'dark' : 'light'}>
      <div className="books-header glass-card">
        <h1>📚 Book Library</h1>
        <p>Discover and explore books from Google Books</p>
      </div>

      <div className="books-search glass-card">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-inputs">
            <input
              type="text"
              placeholder="Search for books..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-select"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
            <button type="submit" className="search-btn" disabled={loading}>
              {loading ? '🔄' : '🔍'}
            </button>
          </div>
        </form>
      </div>

      <div className="books-content">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Searching for books...</p>
          </div>
        ) : (
          <div className="books-grid">
            {books.map((book) => (
              <div key={book.id} className="book-card glass-card">
                <div className="book-image">
                  <img
                    src={getBookImage(book)}
                    alt={book.volumeInfo.title}
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjE5MiIgdmlld0JveD0iMCAwIDEyOCAxOTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTkyIiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Ik00MCA2NEg4OFY3Mkg0MFY2NFoiIGZpbGw9IiNkMWQ1ZGIiLz4KPHA+dGggZD0iTTQwIDgwSDg4Vjg4SDQwVjgwWiIgZmlsbD0iI2QxZDVkYiIvPgo8cGF0aCBkPSJNNDAgOTZIODhWMTA0SDQwVjk2WiIgZmlsbD0iI2QxZDVkYiIvPgo8cGF0aCBkPSJNNDAgMTEySDc2VjEyMEg0MFYxMTJaIiBmaWxsPSIjZDFkNWRiIi8+CjwvZz4KPC9zdmc+';
                    }}
                  />
                </div>
                
                <div className="book-details">
                  <h3 className="book-title">{book.volumeInfo.title}</h3>
                  <p className="book-authors">{formatAuthors(book.volumeInfo.authors)}</p>
                  
                  {book.volumeInfo.publishedDate && (
                    <p className="book-year">📅 {book.volumeInfo.publishedDate.split('-')[0]}</p>
                  )}
                  
                  {book.volumeInfo.pageCount && (
                    <p className="book-pages">📄 {book.volumeInfo.pageCount} pages</p>
                  )}
                  
                  {book.volumeInfo.categories && (
                    <div className="book-categories">
                      {book.volumeInfo.categories.slice(0, 2).map((category, index) => (
                        <span key={index} className="category-tag">
                          {category}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {book.volumeInfo.description && (
                    <p className="book-description">
                      {book.volumeInfo.description.length > 150
                        ? `${book.volumeInfo.description.substring(0, 150)}...`
                        : book.volumeInfo.description}
                    </p>
                  )}
                  
                  {book.volumeInfo.averageRating && (
                    <div className="book-rating">
                      <span className="rating-stars">
                        {'⭐'.repeat(Math.floor(book.volumeInfo.averageRating))}
                      </span>
                      <span className="rating-text">
                        {book.volumeInfo.averageRating}/5 ({book.volumeInfo.ratingsCount || 0} reviews)
                      </span>
                    </div>
                  )}
                  
                  <div className="book-actions">
                    <button
                      onClick={() => handleExploreBook(book)}
                      className="explore-btn"
                      disabled={!book.volumeInfo.previewLink && !book.volumeInfo.infoLink}
                    >
                      📖 Explore Book
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {books.length === 0 && !loading && (
              <div className="empty-state">
                <h3>📚 No books found</h3>
                <p>Try searching with different keywords or categories</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Books;