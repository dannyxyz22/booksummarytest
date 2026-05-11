import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BookCard from './components/BookCard';
import SummaryViewer from './components/SummaryViewer';
import { Book, Search, X, User } from 'lucide-react';

// Base path from Vite (e.g. '/booksummarytest')
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
const SITE_ORIGIN = 'https://summa.legatuschristi.org';
const SITE_NAME = 'Summa Brevis';
const DEFAULT_TITLE = `${SITE_NAME} | Resumos de Livros Católicos`;
const DEFAULT_DESCRIPTION = 'Biblioteca digital de resumos de livros católicos clássicos com leitura online, EPUB e PDF. Títulos: A Imitação da Bem-Aventurada Virgem Maria, A Noite Escura da Alma, A Prática da Presença de Deus, A Síntese Tomista, A Subida do Monte Carmelo, Cartas, Crescimento na Santidade, Cristo Rei, Deus Caritas Est, Diálogos, Ética a Nicômaco, Filosofia 101, Nossa Senhora de Fátima, O Diário de Santa Faustina, O Grande Meio da Oração, O Homem Eterno, Os Irmãos Karamazov, Sobre o Ente e a Essência e Vida e Glórias de São José.';
const DEFAULT_IMAGE = 'assets/covers/thumbs/imitao-maria.webp';

const normalizeDescription = (text, max = 160) => {
  const clean = (text || '').replace(/\s+/g, ' ').trim();
  if (!clean) return DEFAULT_DESCRIPTION;
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trim()}...`;
};

const toAbsoluteUrl = (path = '') => {
  if (!path) return `${SITE_ORIGIN}${import.meta.env.BASE_URL}`;
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedBase = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  const normalizedPath = path.replace(/^\/+/, '');
  return `${SITE_ORIGIN}${normalizedBase}${normalizedPath}`;
};

const upsertMeta = (attr, key, content) => {
  let tag = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
};

const upsertLink = (rel, href) => {
  let tag = document.head.querySelector(`link[rel="${rel}"]`);
  if (!tag) {
    tag = document.createElement('link');
    tag.setAttribute('rel', rel);
    document.head.appendChild(tag);
  }
  tag.setAttribute('href', href);
};

const upsertJsonLd = (id, data) => {
  let tag = document.head.querySelector(`#${id}`);
  if (!tag) {
    tag = document.createElement('script');
    tag.id = id;
    tag.type = 'application/ld+json';
    document.head.appendChild(tag);
  }
  tag.textContent = JSON.stringify(data);
};

// Utility to parse the URL pathname
const parseRoute = () => {
  const pathname = window.location.pathname
    .slice(BASE.length)
    .replace(/^\/+|\/+$/g, '');
  if (!pathname) return { page: 'home', param: null };

  const [page, ...rest] = pathname.split('/');
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

  // Sync state with browser navigation (back/forward)
  useEffect(() => {
    const handlePopState = () => {
      setRoute(parseRoute());
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
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
    fetch(import.meta.env.BASE_URL + 'data/summaries.json')
      .then(res => res.json())
      .then(data => {
        setSummaries(data);
        setLoading(false);
      });
  }, []);

  const navigate = (page, param = null) => {
    let url;
    if (page === 'home') {
      url = BASE + '/';
    } else {
      url = BASE + '/' + page + (param ? '/' + encodeURIComponent(param) : '') + '/';
    }
    window.history.pushState(null, '', url);
    setRoute(parseRoute());
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

  useEffect(() => {
    const isBookPage = route.page === 'book' && selectedBook;
    const isFilterPage = route.page === 'author' || route.page === 'search';

    const title = isBookPage
      ? `${selectedBook.title} | ${SITE_NAME}`
      : isFilterPage
        ? `${SITE_NAME} | ${route.page === 'author' ? 'Autor' : 'Pesquisa'}: ${route.param || ''}`
        : DEFAULT_TITLE;

    const description = isBookPage
      ? normalizeDescription(selectedBook.description)
      : isFilterPage
        ? normalizeDescription(`Resultados de ${route.page === 'author' ? 'autor' : 'pesquisa'} para ${route.param || ''} em ${SITE_NAME}.`)
        : DEFAULT_DESCRIPTION;

    const canonical = isBookPage
      ? toAbsoluteUrl(`book/${encodeURIComponent(selectedBook.id)}/`)
      : toAbsoluteUrl('');

    const image = isBookPage
      ? toAbsoluteUrl(selectedBook.cover)
      : toAbsoluteUrl(DEFAULT_IMAGE);

    const robots = isFilterPage
      ? 'noindex,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1'
      : 'index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1';

    document.title = title;

    upsertMeta('name', 'description', description);
    upsertMeta('name', 'robots', robots);
    upsertLink('canonical', canonical);

    upsertMeta('property', 'og:type', isBookPage ? 'article' : 'website');
    upsertMeta('property', 'og:site_name', SITE_NAME);
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:url', canonical);
    upsertMeta('property', 'og:image', image);

    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', title);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', image);

    if (isBookPage) {
      upsertJsonLd('ld-json-page', {
        '@context': 'https://schema.org',
        '@type': 'Book',
        name: selectedBook.title,
        author: {
          '@type': 'Person',
          name: selectedBook.author
        },
        image,
        url: canonical,
        inLanguage: 'pt-BR',
        datePublished: selectedBook.year ? String(selectedBook.year) : undefined,
        description
      });
    } else {
      upsertJsonLd('ld-json-page', {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_NAME,
        url: toAbsoluteUrl(''),
        inLanguage: 'pt-BR',
        description: DEFAULT_DESCRIPTION
      });
    }
  }, [route, selectedBook]);

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
          <img 
            src={import.meta.env.BASE_URL + 'favicon.svg'} 
            alt="Summa Brevis Logo" 
            style={{ width: '80px', height: '80px', marginBottom: '1.5rem', filter: 'drop-shadow(0 8px 15px rgba(147, 3, 33, 0.3))' }} 
          />
          <h1 style={{ fontSize: '3.5rem', marginBottom: '0.2rem', color: 'var(--accent-color)', fontWeight: 700 }}>
            Summa Brevis
          </h1>
          <p style={{ letterSpacing: '0.2rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500, textTransform: 'uppercase' }}>
            Resumos de Livros Católicos
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

      <AnimatePresence mode="wait">
        {selectedBook && (
          <SummaryViewer
            key={selectedBook.id}
            book={selectedBook}
            onClose={() => navigate('home')}
            onBookClick={(id) => navigate('book', id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
