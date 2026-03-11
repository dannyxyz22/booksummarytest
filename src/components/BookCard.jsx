import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';

const BookCard = ({ book, onClick }) => {
    return (
        <motion.div
            layoutId={`card-${book.id}`}
            onClick={() => onClick(book)}
            className="book-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -10, transition: { duration: 0.3 } }}
            style={{
                background: 'var(--panel-color)',
                borderRadius: '12px',
                padding: '1.5rem',
                cursor: 'pointer',
                border: '1px solid var(--border-color)',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <div className="card-image-bg" style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: `linear-gradient(rgba(26, 26, 26, 0.8), rgba(26, 26, 26, 0.95)), url(${book.cover})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                zIndex: -1,
                opacity: 0.4
            }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{book.title}</h3>
                <p style={{ color: 'var(--accent-color)', fontSize: '0.9rem', marginBottom: '1rem', fontStyle: 'italic' }}>
                    {book.author}
                </p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {book.description}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-color)', fontWeight: 'bold' }}>
                        <BookOpen size={18} />
                        <span>LER RESUMO</span>
                    </div>
                    {book.readingTime && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span>{book.readingTime} min</span>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default BookCard;
