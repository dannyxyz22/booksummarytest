import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, User } from 'lucide-react';

const BookCard = ({ book, onClick, onAuthorClick }) => {
    return (
        <motion.div
            layoutId={`card-${book.id}`}
            className="book-card"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5, boxShadow: '0 12px 30px rgba(0,0,0,0.08)', transition: { duration: 0.3 } }}
            style={{
                background: 'var(--panel-color)',
                borderRadius: '8px',
                padding: '1.5rem',
                border: '1px solid var(--border-color)',
                position: 'relative',
                boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
            }}
        >
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                {book.cover ? (
                    <div style={{ 
                        margin: '0 auto 1.5rem auto', 
                        width: '65%', 
                        aspectRatio: '2/3', 
                        borderRadius: '2px', 
                        padding: '6px',
                        background: '#fff',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.03)',
                        border: '1px solid #f0f0f0',
                        transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease',
                        cursor: 'pointer',
                        display: 'block'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-6px) scale(1.03)';
                        e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.04)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.03)';
                    }}
                    onClick={() => onClick(book)}
                    >
                        <img 
                            src={book.cover} 
                            alt={book.title} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '1px', border: '1px solid rgba(0,0,0,0.03)' }}
                        />
                    </div>
                ) : (
                    <div 
                        onClick={() => onClick(book)}
                        style={{ 
                            margin: '0 auto 1.5rem auto', 
                            width: '55%', 
                            aspectRatio: '2/3', 
                            borderRadius: '4px 10px 10px 4px',  
                            background: `linear-gradient(135deg, ${book.color || '#4a2c2a'} 0%, ${book.colorDark || '#2a1515'} 100%)`,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '1rem',
                            cursor: 'pointer',
                            boxShadow: '8px 4px 15px rgba(0,0,0,0.15), inset 3px 0 5px rgba(255,255,255,0.1)',
                            border: '1px solid rgba(0,0,0,0.2)',
                            borderLeft: '4px solid rgba(0,0,0,0.4)',
                            position: 'relative',
                            transition: 'transform 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0) scale(1)'}
                    >
                        {/* Decorative borders for CSS cover */}
                        <div style={{ position: 'absolute', top: '8px', left: '12px', right: '8px', bottom: '8px', border: '1px solid rgba(255,215,0,0.15)', borderRadius: '0 6px 6px 0' }} />
                        <div style={{ position: 'absolute', top: '12px', left: '16px', right: '12px', bottom: '12px', border: '1px solid rgba(255,215,0,0.05)', borderRadius: '0 4px 4px 0' }} />
                        
                        {book.symbol && (
                            <div style={{ color: 'rgba(255,215,0,0.4)', fontSize: '2rem', marginBottom: '0.5rem', fontFamily: 'var(--font-header)' }}>
                                {book.symbol}
                            </div>
                        )}
                        <h4 style={{ 
                            color: 'rgba(255,255,255,0.9)', 
                            fontSize: '1.1rem', 
                            textAlign: 'center', 
                            fontFamily: 'var(--font-header)',
                            lineHeight: 1.2,
                            textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                        }}>
                            {book.title}
                        </h4>
                        <span style={{ 
                            color: 'rgba(255,255,255,0.5)', 
                            fontSize: '0.7rem', 
                            marginTop: '0.5rem', 
                            textTransform: 'uppercase',
                            letterSpacing: '0.1rem',
                            textAlign: 'center'
                        }}>
                            {book.author.split(' ').slice(-2).join(' ')}
                        </span>
                    </div>
                )}

                <h3 
                    style={{ fontSize: '1.65rem', marginBottom: '0.3rem', cursor: 'pointer', lineHeight: 1.1, fontWeight: 700, letterSpacing: '-0.02em' }}
                    onClick={() => onClick(book)}
                >
                    {book.title}
                </h3>
                
                <div 
                    style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '1.2rem',
                        flexWrap: 'wrap'
                    }}
                >
                    <div 
                        onClick={(e) => {
                            e.stopPropagation();
                            onAuthorClick(book.author);
                        }}
                        style={{ 
                            color: 'var(--text-secondary)', 
                            fontSize: '0.9rem', 
                            cursor: 'pointer',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em'
                        }}
                        className="author-link"
                    >
                        {book.author}
                    </div>
                    {book.year && (
                        <span style={{ 
                            backgroundColor: 'rgba(176, 141, 87, 0.15)', 
                            color: 'var(--accent-color)',
                            padding: '2px 10px',
                            borderRadius: '4px',
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            fontFamily: 'var(--font-header)',
                            border: '1px solid rgba(176, 141, 87, 0.3)'
                        }}>
                            {book.year}
                        </span>
                    )}
                </div>

                <p 
                    onClick={() => onClick(book)}
                    style={{ 
                        color: '#555', 
                        fontSize: '1.05rem', 
                        marginBottom: '2rem', 
                        display: '-webkit-box', 
                        WebkitLineClamp: 4, 
                        WebkitBoxOrient: 'vertical', 
                        overflow: 'hidden',
                        lineHeight: 1.6,
                        flex: 1,
                        cursor: 'pointer'
                    }}
                >
                    {book.description}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '1.2rem', borderTop: '1px solid #eaeaea' }}>
                    <div 
                        onClick={() => onClick(book)}
                        style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '6px', 
                            color: 'var(--accent-color)', 
                            fontWeight: 600, 
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            letterSpacing: '0.08em',
                            borderBottom: '1px solid transparent',
                            paddingBottom: '2px',
                            transition: 'border-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-color)'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                    >
                        <span>ABRIR VOLUME</span>
                        <BookOpen size={14} style={{ marginLeft: '4px' }} />
                    </div>
                    {book.readingTime && (
                        <div style={{ fontSize: '0.75rem', color: '#999', fontFamily: 'var(--font-sans)', fontWeight: 500, letterSpacing: '0.05em' }}>
                            {book.readingTime} MIN
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default BookCard;
