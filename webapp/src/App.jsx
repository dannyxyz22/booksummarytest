import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BookCard from './components/BookCard';
import SummaryViewer from './components/SummaryViewer';
import { Feather } from 'lucide-react';

function App() {
  const [summaries, setSummaries] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('data/summaries.json')
      .then(res => res.json())
      .then(data => {
        setSummaries(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="app">
      <div className="vintage-overlay" />

      <header style={{
        padding: '4rem 2rem',
        textAlign: 'center',
        borderBottom: '1px solid var(--border-color)',
        background: 'linear-gradient(to bottom, #151515, #0d0d0d)'
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <Feather size={40} color="var(--accent-color)" style={{ marginBottom: '1rem' }} />
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }} className="gold-gradient">
            Sena & Cruz
          </h1>
          <p style={{ letterSpacing: '0.3rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            BIBLIOTECA DE RESUMOS MÍSTICOS
          </p>
        </motion.div>
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
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '2rem',
            paddingTop: '3rem'
          }}>
            {summaries.map((book, index) => (
              <BookCard
                key={book.id}
                book={book}
                onClick={setSelectedBook}
              />
            ))}
          </div>
        )}
      </main>

      <footer style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem', opacity: 0.5 }}>
        &copy; {new Date().getFullYear()} &bull; Criado para contemplação e estudo.
      </footer>

      <AnimatePresence>
        {selectedBook && (
          <SummaryViewer
            book={selectedBook}
            onClose={() => setSelectedBook(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
