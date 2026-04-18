import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BookCard from './components/BookCard';
import SummaryViewer from './components/SummaryViewer';
import { Book, Search, X, User } from 'lucide-react';

// Utility to parse the URL hash
const parseRoute = () => {
  const hash = window.location.hash.slice(1);
  if (!hash) return { page: 'home', param: null };

  const [page, ...rest] = hash.split('/');
  return {
    page: page || 'home',
    param: rest.length > 0 ? decodeURIComponent(rest.join('/')) : null
  };
};

const App = () => {
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [route, setRoute] = useState(parseRoute());
  const [searchQuery, setSearchQuery] = useState('');

  // Sync state with URL hash
  useEffect(() => {
    const handleHashChange = () => {
      setRoute(parseRoute());
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    };
  }, []);

  // Set search query if route is search
  useEffect(() => {
    if (route.page === 'search' && route.param) {
      setSearchQuery(route.param);
    } else if (route.page !== 'search') {
      setSearchQuery('');
    }
  }, [route]);

  // Load summaries
  useEffect(() => {
    fetch('data/summaries.json')
      .then(res => res.json())
      .then(data => {
        setSummaries(data);
        setLoading(false);
      });
  }, []);

  const navigate = (page, param = null) => {
    const newHash = param ? `#${page}/${param}` : `#${page}`;
    window.location.hash = newHash;
  };

  const filteredSummaries = useMemo(() => {
    let list = summaries.filter(s => s.enabled !== false);

    if (route.page === 'author' && route.param) {
      return list.filter(s => s.author.toLowerCase().includes(route.param.toLowerCase()));
    }
    if (route.page === 'search' && route.param) {
      const term = route.param.toLowerCase();
      return list.filter(s => 
        s.title.toLowerCase().includes(term) || 
        s.author.toLowerCase().includes(term) || 
        s.description.toLowerCase().includes(term)
      );
    }
    return list;
  }, [summaries, route]);

  // Add state to keep track of the active book context
  const [activeBookId, setActiveBookId] = useState(null);

  useEffect(() => {
    if (route.page === 'book' && route.param) {
      setActiveBookId(route.param);
    } else if (route.page === 'home' || route.page === 'author' || route.page === 'search') {
      setActiveBookId(null);
    }
  }, [route]);

  const selectedBook = useMemo(() => {
    // 1. Direct match: #book/id
    if (route.page === 'book' && route.param) {
      return summaries.find(s => s.id === route.param);
    }
    // 2. Fragment match: If we have an active book and the new hash is just an ID 
    // (not home/author/search), keep the book open.
    if (activeBookId && !['home', 'author', 'search'].includes(route.page)) {
      return summaries.find(s => s.id === activeBookId);
    }
    return null;
  }, [summaries, route, activeBookId]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('search', searchQuery.trim());
    } else {
      navigate('home');
    }
  };

  return (
    <div className="app">
      <div className="vintage-overlay" />

      <header style={{
        padding: '4rem 2rem 3rem',
        textAlign: 'center',
        background: 'var(--header-bg)',
        borderBottom: '1px solid var(--border-color)',
        position: 'relative'
      }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          onClick={() => navigate('home')}
          style={{ cursor: 'pointer' }}
        >
          <Book size={40} color="var(--accent-color)" style={{ marginBottom: '1rem' }} />
          <h1 style={{ fontSize: '3.5rem', marginBottom: '0.2rem', color: 'var(--accent-color)', fontWeight: 700 }}>
            Summa Brevis
          </h1>
          <p style={{ letterSpacing: '0.2rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500, textTransform: 'uppercase' }}>
            A Essência da Literatura Católica
          </p>
        </motion.div>

        <div className="container" style={{ paddingTop: '2rem', paddingBottom: 0, maxWidth: '600px' }}>
          <form onSubmit={handleSearch} style={{ position: 'relative' }}>
            <input 
              type="text"
              placeholder="Pesquisar por título, autor, assunto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                background: '#fff',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '0.8rem 1.5rem 0.8rem 3rem',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.95rem',
                outline: 'none',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
              }}
            />
            <Search 
              size={18} 
              color="var(--accent-color)" 
              style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)' }} 
            />
            {searchQuery && (
              <X 
                size={18} 
                color="var(--text-secondary)" 
                style={{ position: 'absolute', right: '1.2rem', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }} 
                onClick={() => {
                  setSearchQuery('');
                  if (route.page === 'search') navigate('home');
                }}
              />
            )}
          </form>
        </div>
      </header>

      <main className="container">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--accent-color)', borderRadius: '50%' }}
            />
          </div>
        ) : (
          <>
            <AnimatePresence mode="wait">
              {(route.page === 'author' || route.page === 'search') && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px', 
                    marginBottom: '2rem',
                    padding: '0.8rem 1.2rem',
                    background: 'rgba(197, 160, 89, 0.05)',
                    borderLeft: '3px solid var(--accent-color)',
                    borderRadius: '4px'
                  }}
                >
                  {route.page === 'author' ? <User size={18} color="var(--accent-color)" /> : <Search size={18} color="var(--accent-color)" />}
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {route.page === 'author' ? 'Explorando obras de: ' : 'Resultados para: '}
                    <strong style={{ color: 'var(--accent-color)', marginLeft: '4px' }}>{route.param}</strong>
                  </span>
                  <button 
                    onClick={() => navigate('home')}
                    style={{ 
                      marginLeft: 'auto', 
                      fontSize: '0.8rem', 
                      color: 'var(--text-secondary)',
                      textDecoration: 'underline',
                      opacity: 0.7
                    }}
                  >
                    Limpar filtro
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '2rem',
              paddingTop: filteredSummaries.length > 0 ? '1rem' : '3rem'
            }}>
              {filteredSummaries.length > 0 ? (
                filteredSummaries.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    onClick={() => navigate('book', book.id)}
                    onAuthorClick={(author) => navigate('author', author)}
                  />
                ))
              ) : (
                <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '4rem 0' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
                    Nenhuma sabedoria encontrada para seus critérios.
                  </p>
                  <button 
                    onClick={() => navigate('home')}
                    style={{ 
                      marginTop: '1.5rem', 
                      color: 'var(--accent-color)',
                      border: '1px solid var(--border-color)',
                      padding: '0.6rem 1.5rem',
                      borderRadius: '4px'
                    }}
                  >
                    Ver todos os resumos
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <footer style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem', opacity: 0.5 }}>
        &copy; {new Date().getFullYear()} &bull; Criado para contemplação e estudo.
      </footer>

      <AnimatePresence>
        {selectedBook && (
          <SummaryViewer
            book={selectedBook}
            onClose={() => navigate('home')}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
