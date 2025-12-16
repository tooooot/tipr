
import React, { useState, useEffect } from 'react';
import { styles, btnGold } from '../styles/theme';

export default function CommentsSection({ tradeId }) {
    const [comments, setComments] = useState(() => {
        try {
            const saved = localStorage.getItem(`comments_${tradeId}`);
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });
    const [newComment, setNewComment] = useState('');
    const [userName, setUserName] = useState(() => {
        return localStorage.getItem('user_name') || '';
    });

    const addComment = () => {
        if (!newComment.trim()) return;

        const name = userName.trim() || 'مستخدم';
        if (userName.trim()) {
            localStorage.setItem('user_name', userName.trim());
        }

        const comment = {
            id: Date.now(),
            text: newComment.trim(),
            userName: name,
            timestamp: new Date().toISOString(),
            likes: 0
        };

        const updated = [comment, ...comments];
        setComments(updated);
        localStorage.setItem(`comments_${tradeId}`, JSON.stringify(updated));
        setNewComment('');
    };

    const deleteComment = (commentId) => {
        const updated = comments.filter(c => c.id !== commentId);
        setComments(updated);
        localStorage.setItem(`comments_${tradeId}`, JSON.stringify(updated));
    };

    const likeComment = (commentId) => {
        const updated = comments.map(c =>
            c.id === commentId ? { ...c, likes: (c.likes || 0) + 1 } : c
        );
        setComments(updated);
        localStorage.setItem(`comments_${tradeId}`, JSON.stringify(updated));
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'الآن';
        if (minutes < 60) return `منذ ${minutes} دقيقة`;
        if (hours < 24) return `منذ ${hours} ساعة`;
        return `منذ ${days} يوم`;
    };

    return (
        <div>
            <div style={{ ...styles.card, marginBottom: '16px' }}>
                <input
                    type="text"
                    placeholder="اسمك (اختياري)"
                    value={userName}
                    onChange={e => setUserName(e.target.value)}
                    style={{
                        width: '100%',
                        background: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        padding: '10px',
                        color: 'white',
                        fontSize: '14px',
                        marginBottom: '8px'
                    }}
                />
                <textarea
                    placeholder="اكتب تعليقك..."
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    style={{
                        width: '100%',
                        background: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        padding: '12px',
                        color: 'white',
                        fontSize: '14px',
                        minHeight: '80px',
                        resize: 'vertical',
                        fontFamily: 'inherit'
                    }}
                />
                <button onClick={addComment} disabled={!newComment.trim()} style={{
                    ...btnGold,
                    marginTop: '8px',
                    opacity: !newComment.trim() ? 0.5 : 1
                }}>
                    💬 إضافة تعليق
                </button>
            </div>

            {comments.length === 0 ? (
                <div style={{ ...styles.card, textAlign: 'center', padding: '40px' }}>
                    <p style={{ fontSize: '48px' }}>💭</p>
                    <p style={{ color: styles.gray, marginTop: '12px' }}>لا توجد تعليقات بعد</p>
                    <p style={{ color: styles.gray, fontSize: '12px', marginTop: '4px' }}>كن أول من يعلق!</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {comments.map(comment => (
                        <div key={comment.id} style={{
                            ...styles.card,
                            borderRight: `3px solid ${styles.gold}`,
                            padding: '16px'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '20px' }}>👤</span>
                                    <div>
                                        <p style={{ fontWeight: 'bold', fontSize: '14px' }}>{comment.userName}</p>
                                        <p style={{ color: styles.gray, fontSize: '11px' }}>{formatTime(comment.timestamp)}</p>
                                    </div>
                                </div>
                                <button onClick={() => deleteComment(comment.id)} style={{
                                    background: 'none',
                                    border: 'none',
                                    color: styles.red,
                                    fontSize: '18px',
                                    cursor: 'pointer',
                                    padding: '4px'
                                }}>
                                    🗑️
                                </button>
                            </div>

                            <p style={{ color: '#d1d5db', fontSize: '14px', lineHeight: '1.6', marginBottom: '12px' }}>
                                {comment.text}
                            </p>

                            <div style={{ display: 'flex', gap: '16px', paddingTop: '8px', borderTop: '1px solid #334155' }}>
                                <button onClick={() => likeComment(comment.id)} style={{
                                    background: 'none',
                                    border: 'none',
                                    color: styles.gold,
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}>
                                    👍 {comment.likes > 0 && <span>{comment.likes}</span>}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
