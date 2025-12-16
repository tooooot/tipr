
export const styles = {
    wrapper: {
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
        display: 'flex',
        justifyContent: 'center',
    },
    container: {
        width: '100%',
        maxWidth: '430px',
        minHeight: '100vh',
        background: '#0f172a',
        position: 'relative',
        paddingBottom: '80px', // Ensure space for BottomNav
    },
    page: {
        color: 'white',
        padding: '20px',
        paddingBottom: '100px',
        direction: 'rtl',
    },
    card: {
        background: '#1e293b',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '16px',
        border: '1px solid rgba(251, 191, 36, 0.1)',
        overflow: 'hidden',
    },
    gold: '#fbbf24',
    green: '#22c55e',
    red: '#ef4444',
    gray: '#9ca3af',
};

export const btnGold = {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
    color: '#0f172a',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
};
