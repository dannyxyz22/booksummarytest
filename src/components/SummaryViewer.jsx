import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useScroll, useSpring, useTransform } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { X, ArrowLeft, Sun } from 'lucide-react';

const SummaryViewer = ({ book, onClose }) => {
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
        if (p === 0) return "Iniciando a jornada...";
        if (p < 30) return "Os primeiros passos na luz...";
        if (p < 60) return "Aprofundando na sabedoria...";
        if (p < 90) return "Quase ao fim da travessia...";
        if (p < 100) return "A iluminação se aproxima...";
        return "Jornada completa.";
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
                padding: '2rem'
            }}
        >
            {/* Progress Bar */}
            <motion.div
                className="no-print"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: 'var(--accent-color)',
                    transformOrigin: '0%',
                    scaleX,
                    zIndex: 2001,
                    boxShadow: '0 0 10px var(--accent-glow)'
                }}
            />

            {/* Motivational Indicator */}
            <motion.div
                className="no-print"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    position: 'fixed',
                    top: '12px',
                    right: '2rem',
                    fontSize: '0.75rem',
                    color: 'var(--accent-color)',
                    fontFamily: 'var(--font-header)',
                    zIndex: 2001,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}
            >
                <span style={{ opacity: 0.7 }}>{percentage}%</span>
                <span style={{ letterSpacing: '0.1rem' }}>{getMotivation(percentage)}</span>
                <Sun size={12} strokeWidth={3} />
            </motion.div>

            <div className="container" style={{ position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem', marginTop: '1rem' }}>
                    <motion.button
                        onClick={onClose}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="no-print"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            color: 'var(--accent-color)',
                            padding: '8px 0',
                            borderBottom: '1px solid transparent'
                        }}
                        onMouseEnter={(e) => e.target.style.borderBottom = '1px solid var(--accent-color)'}
                        onMouseLeave={(e) => e.target.style.borderBottom = '1px solid transparent'}
                    >
                        <ArrowLeft size={20} />
                        <span>VOLTAR</span>
                    </motion.button>

                    <div style={{ display: 'flex', gap: '1rem' }} className="no-print">
                        <motion.button
                            onClick={() => window.print()}
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                color: 'var(--accent-color)',
                                padding: '8px 16px',
                                border: '1px solid var(--border-color)',
                                borderRadius: '4px',
                                fontSize: '0.9rem',
                                letterSpacing: '0.1rem'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = 'var(--accent-color)';
                                e.target.style.color = 'var(--bg-color)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = 'transparent';
                                e.target.style.color = 'var(--accent-color)';
                            }}
                        >
                            <span>BAIXAR .PDF</span>
                        </motion.button>

                        <motion.a
                            href={book.epubPath}
                            download={`${book.title}.epub`}
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                color: 'var(--accent-color)',
                                padding: '8px 16px',
                                border: '1px solid var(--border-color)',
                                borderRadius: '4px',
                                fontSize: '0.9rem',
                                letterSpacing: '0.1rem',
                                textDecoration: 'none'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = 'var(--accent-color)';
                                e.target.style.color = 'var(--bg-color)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = 'transparent';
                                e.target.style.color = 'var(--accent-color)';
                            }}
                        >
                            <span>BAIXAR .EPUB</span>
                        </motion.a>
                    </div>
                </div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="markdown-content"
                    style={{
                        maxWidth: '800px',
                        margin: '0 auto',
                        paddingBottom: '5rem'
                    }}
                >
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', lineHeight: 1.1 }}>{book.title}</h1>
                        <p style={{ color: 'var(--accent-color)', fontSize: '1.2rem', letterSpacing: '0.2rem', marginBottom: '0.5rem' }}>{book.author}</p>
                        {book.readingTime && (
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', opacity: 0.8 }}>
                                Estimativa de leitura: {book.readingTime} minutos
                            </p>
                        )}
                        <div style={{ width: '60px', height: '2px', background: 'var(--accent-color)', margin: '2rem auto' }} />
                    </div>

                    <ReactMarkdown
                        components={{
                            h2: ({ node, ...props }) => <h2 style={{ marginTop: '3rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }} {...props} />,
                            p: ({ node, ...props }) => <p style={{ marginBottom: '1.5rem', fontSize: '1.15rem', color: 'rgba(232, 230, 227, 0.9)' }} {...props} />,
                            li: ({ node, ...props }) => <li style={{ marginBottom: '0.5rem', marginLeft: '1.5rem' }} {...props} />,
                            strong: ({ node, ...props }) => <strong style={{ color: 'var(--accent-color)', fontWeight: '600' }} {...props} />
                        }}
                    >
                        {book.content}
                    </ReactMarkdown>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default SummaryViewer;
