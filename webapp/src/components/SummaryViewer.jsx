import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useSpring, useTransform } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { X, ArrowLeft, Sun, Type } from 'lucide-react';

const SummaryViewer = ({ book: initialBookMetadata, onClose }) => {
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [fontSizeScale, setFontSizeScale] = useState(1);

    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        container: containerRef
    });

    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const [percentage, setPercentage] = useState(0);

    // Fetch full book data on mount
    useEffect(() => {
        setLoading(true);
        fetch(`data/books/${initialBookMetadata.id}.json`)
            .then(res => {
                if (!res.ok) throw new Error('Não foi possível carregar o conteúdo do livro.');
                return res.json();
            })
            .then(data => {
                setBook(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError(err.message);
                setLoading(false);
            });
    }, [initialBookMetadata.id]);

    const processedContent = useMemo(() => {
        if (!book?.content) return '';
        return book.content
            .replace(/---/g, '—') // em dash
            .replace(/--/g, '–');  // en dash
    }, [book?.content]);

    // Helper to extract text from React children
    const getText = (children) => {
        return React.Children.toArray(children)
            .map(child => {
                if (typeof child === 'string') return child;
                if (child.props && child.props.children) return getText(child.props.children);
                return '';
            })
            .join('');
    };

    // Helper to generate slugs for headings
    const generateId = (children) => {
        const text = getText(children);
        if (!text) return '';
        return text.toString()
            .toLowerCase()
            .replace(/\./g, '') // Remove dots from "I. ", "II. "
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\p{L}\p{N}-]/gu, '') // Robustly keep letters (any language) and numbers
            .replace(/-+/g, '-');
    };

    // Catch all clicks on hashes within the viewer to prevent route changes
    useEffect(() => {
        const handleGlobalClick = (e) => {
            const link = e.target.closest('a');
            if (link) {
                const href = link.getAttribute('href');
                if (href && href.startsWith('#') && href.length > 1) {
                    const id = decodeURIComponent(href.slice(1));
                    // Try to find the element by ID or Name
                    const target = containerRef.current?.querySelector(`[id="${id}"], [id="${href.slice(1)}"]`);
                    if (target) {
                        // We NO LONGER preventDefault here. 
                        // We let the hash change so the browser records history.
                        // We just handle the scroll explicitly to ensure it works within the overlay.
                        e.stopPropagation();
                        target.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            }
        };

        const currentContainer = containerRef.current;
        if (currentContainer) {
            currentContainer.addEventListener('click', handleGlobalClick, true);
        }
        return () => {
            if (currentContainer) {
                currentContainer.removeEventListener('click', handleGlobalClick, true);
            }
        };
    }, [loading, book]);

    // Handle browser back button to scroll to top when returning to book root
    useEffect(() => {
        const handleHashScroll = () => {
            // If the hash is exactly the book root (no extra fragments), scroll to top
            if (window.location.hash.startsWith('#book/')) {
                containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
            }
        };

        window.addEventListener('hashchange', handleHashScroll);
        return () => window.removeEventListener('hashchange', handleHashScroll);
    }, []);

    useEffect(() => {
        const unsubscribe = scrollYProgress.on("change", (latest) => {
            setPercentage(Math.round(latest * 100));
        });
        return () => unsubscribe();
    }, [scrollYProgress]);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const getMotivation = (p) => {
        if (p === 0) return "Início do Volume";
        if (p < 30) return "Primeiros Capítulos";
        if (p < 60) return "Metade da Obra";
        if (p < 90) return "Retas Finais";
        if (p < 100) return "Conclusão Próxima";
        return "Fim do Volume";
    };

    return (
        <motion.div
            ref={containerRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="viewer-overlay"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'var(--bg-color)',
                zIndex: 2000,
                overflowY: 'auto',
                paddingTop: 'min(5vw, 2rem)',
                paddingBottom: 'min(5vw, 2rem)',
                paddingLeft: 'calc(min(3vw, 1rem) + 5px)',
                paddingRight: 'calc(min(3vw, 1rem) - 5px)',
                boxSizing: 'border-box'
            }}
        >
            {/* Progress Bar */}
            {!loading && (
                <motion.div
                    className="no-print"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: 'var(--accent-color)',
                        transformOrigin: '0%',
                        scaleX,
                        zIndex: 2001
                    }}
                />
            )}

            {/* Motivational Indicator - Desktop only */}
            {!loading && (
                <motion.div
                    className="no-print motivation-indicator"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        position: 'fixed',
                        top: '12px',
                        right: '1rem',
                        fontSize: '0.8rem',
                        color: 'var(--accent-color)',
                        fontFamily: 'var(--font-sans)',
                        fontWeight: 600,
                        zIndex: 2001,
                        display: 'none', // Overridden by CSS media query below
                        alignItems: 'center',
                        gap: '10px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05rem',
                        backgroundColor: 'rgba(247, 244, 240, 0.9)',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                        backdropFilter: 'blur(4px)'
                    }}
                >
                    <span style={{ opacity: 0.7 }}>{percentage}%</span>
                    <span>{getMotivation(percentage)}</span>
                </motion.div>
            )}

            <style>
                {`
                @media (min-width: 768px) {
                    .motivation-indicator {
                        display: flex !important;
                    }
                }
                `}
            </style>

            <div className="container" style={{ position: 'relative', background: 'white', padding: 'min(8vw, 4rem)', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', borderRadius: '8px', marginTop: 'min(4vw, 2rem)', marginBottom: '4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'min(6vw, 4rem)', paddingBottom: '1rem', borderBottom: '1px solid #f0f0f0', flexWrap: 'wrap', gap: '1rem' }}>
                    <motion.button
                        onClick={() => {
                            onClose();
                            // Double guarantee: if onClose failed, force hash home
                            if (window.location.hash.startsWith('#book/')) {
                                window.location.hash = 'home';
                            }
                        }}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="no-print"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            color: 'var(--text-secondary)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            outline: 'none',
                            padding: '8px 0',
                            fontSize: '0.9rem',
                            fontWeight: 600
                        }}
                    >
                        <ArrowLeft size={18} />
                        <span>VOLTAR À BIBLIOTECA</span>
                    </motion.button>

                    {!loading && book && (
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }} className="no-print">
                            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e0e0e0', borderRadius: '6px', marginRight: '0.5rem', overflow: 'hidden' }}>
                                <button
                                    onClick={() => setFontSizeScale(s => Math.max(0.8, s - 0.1))}
                                    style={{ padding: '6px 10px', background: '#f9f9f9', borderRight: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    title="Diminuir fonte"
                                >
                                    <Type size={14} color="var(--text-secondary)" />
                                    <span style={{ fontSize: '0.7rem', marginLeft: '2px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>-</span>
                                </button>
                                <button
                                    onClick={() => setFontSizeScale(s => Math.min(1.4, s + 0.1))}
                                    style={{ padding: '6px 10px', background: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    title="Aumentar fonte"
                                >
                                    <Type size={16} color="var(--text-secondary)" />
                                    <span style={{ fontSize: '0.8rem', marginLeft: '2px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>+</span>
                                </button>
                            </div>

                            <motion.a
                                href={book.pdfPath ? `${import.meta.env.BASE_URL}${book.pdfPath}` : '#'}
                                download={`${book.title}.pdf`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                style={{
                                    padding: '8px 16px',
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    color: 'var(--text-secondary)',
                                    textDecoration: 'none',
                                    pointerEvents: book.pdfPath ? 'auto' : 'none',
                                    opacity: book.pdfPath ? 1 : 0.5
                                }}
                            >
                                PDF
                            </motion.a>

                            <motion.a
                                href={book.epubPath ? `${import.meta.env.BASE_URL}${book.epubPath}` : '#'}
                                download={`${book.title}.epub`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                style={{
                                    padding: '8px 16px',
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    color: 'var(--text-secondary)',
                                    textDecoration: 'none',
                                    pointerEvents: book.epubPath ? 'auto' : 'none',
                                    opacity: book.epubPath ? 1 : 0.5
                                }}
                            >
                                EPUB
                            </motion.a>
                        </div>
                    )}
                </div>

                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '2rem' }}>
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                            style={{ 
                                width: '40px', 
                                height: '40px', 
                                border: '2px solid #f0f0f0', 
                                borderTopColor: 'var(--accent-color)', 
                                borderRadius: '50%' 
                            }}
                        />
                        <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)', fontSize: '0.9rem', fontWeight: 500, letterSpacing: '0.1rem' }}>
                            ABRINDO VOLUME...
                        </p>
                    </div>
                ) : error ? (
                    <div style={{ textAlign: 'center', padding: '5rem 0' }}>
                        <p style={{ color: '#d32f2f', marginBottom: '2rem' }}>{error}</p>
                        <button onClick={onClose} style={{ color: 'var(--accent-color)', textDecoration: 'underline' }}>Voltar para a biblioteca</button>
                    </div>
                ) : (
                    <motion.div
                        initial={{ y: 15, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="markdown-content"
                        style={{
                            maxWidth: '750px',
                            margin: '0 auto',
                        }}
                    >
                        <div style={{ textAlign: 'center', marginBottom: 'min(8vw, 5rem)' }}>
                            <h1 style={{ fontSize: `calc(2rem * ${Math.max(1, fontSizeScale * 0.9)} + 2vw)`, marginBottom: '1.5rem', lineHeight: 1.1, color: 'var(--text-primary)', wordBreak: 'break-word' }}>{book.title}</h1>
                            <p style={{ color: 'var(--accent-color)', fontSize: `calc(1rem * ${Math.max(1, fontSizeScale * 0.9)} + 0.5vw)`, marginBottom: '1rem', fontStyle: 'italic' }}>
                                {book.author}{book.year && <span style={{ fontStyle: 'normal', fontWeight: 800, color: 'var(--accent-gold)' }}> • {book.year}</span>}
                            </p>
                            {book.readingTime && (
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1rem' }}>
                                    Estudo de {book.readingTime} minutos
                                </p>
                            )}
                            <div style={{ width: '40px', height: '1px', background: 'var(--border-color)', margin: '3rem auto' }} />
                        </div>

                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                h1: ({ node, children, ...props }) => (
                                    <h1 id={generateId(children)} style={{ fontFamily: 'var(--font-header)', fontSize: `calc(2rem * ${Math.max(1, fontSizeScale * 0.9)} + 2vw)`, marginBottom: '1.5rem', lineHeight: 1.1, color: 'var(--text-primary)', wordBreak: 'break-word' }} {...props}>{children}</h1>
                                ),
                                h2: ({ node, children, ...props }) => (
                                    <h2 id={generateId(children)} style={{ fontFamily: 'var(--font-header)', marginTop: '3.5rem', marginBottom: '1.2rem', borderBottom: '1px solid #f0f0f0', paddingBottom: '0.4rem', fontSize: `calc(1.55rem * ${fontSizeScale})`, lineHeight: 1.3 }} {...props}>{children}</h2>
                                ),
                                h3: ({ node, children, ...props }) => (
                                    <h3 id={generateId(children)} style={{ fontFamily: 'var(--font-header)', marginTop: '2.5rem', marginBottom: '1rem', fontSize: `calc(1.25rem * ${fontSizeScale})`, lineHeight: 1.35, color: 'var(--accent-color)' }} {...props}>{children}</h3>
                                ),
                                p: ({ node, ...props }) => <p style={{ fontFamily: 'var(--font-body)', marginBottom: '1.6rem', fontSize: `calc(1rem * ${fontSizeScale})`, color: '#2a2a2a', textAlign: 'justify', lineHeight: 1.85, letterSpacing: '0.01em', hyphens: 'auto' }} {...props} />,
                                li: ({ node, ...props }) => <li style={{ fontFamily: 'var(--font-body)', marginBottom: '0.7rem', marginLeft: '1.5rem', fontSize: `calc(1rem * ${fontSizeScale})`, color: '#333', lineHeight: 1.75, letterSpacing: '0.01em' }} {...props} />,
                                strong: ({ node, ...props }) => <strong style={{ color: 'var(--text-primary)', fontWeight: '600' }} {...props} />,
                                em: ({ node, ...props }) => <em style={{ fontStyle: 'italic', color: '#444' }} {...props} />,
                                a: ({ node, ...props }) => <a style={{ color: 'var(--accent-color)', textDecoration: 'underline' }} {...props} />,
                            }}
                        >
                            {processedContent}
                        </ReactMarkdown>
                    </motion.div>
                )}
            </div>
            <footer className="no-print" style={{ textAlign: 'center', paddingBottom: '4rem', color: 'var(--text-secondary)', fontSize: '0.9rem', opacity: 0.6 }}>
                Fim do Volume • Summa Brevis
            </footer>
        </motion.div>
    );
};

export default SummaryViewer;
