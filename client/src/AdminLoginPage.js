import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLoginPage = ({ setAdminLoggedIn }) => {
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleLogin = () => {
        if (password === 'adminpassword') {
            setAdminLoggedIn(true);
            navigate('/admin');
        } else {
            setErrorMessage('Invalid password');
        }
    };

    const handleBack = () => {
        navigate('/');
    };

    return (
        <div style={styles.container}>
            <div style={styles.formContainer}>
                <h2 style={styles.title}>Admin Login</h2>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value);
                        setErrorMessage(''); // Clear error message on new input
                    }}
                    placeholder="Password"
                    style={styles.input}
                />
                <button onClick={handleLogin} style={styles.button}>
                    Login
                </button>
                {errorMessage && <p style={styles.errorMessage}>{errorMessage}</p>}
                <button onClick={handleBack} style={styles.backButton}>
                    Back to Login
                </button>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f0f2f5',
    },
    formContainer: {
        width: '300px',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
        backgroundColor: '#fff',
    },
    title: {
        textAlign: 'center',
        marginBottom: '20px',
        color: '#333',
    },
    input: {
        width: '100%',
        padding: '10px',
        margin: '10px 0',
        borderRadius: '4px',
        border: '1px solid #ccc',
        fontSize: '14px',
    },
    button: {
        width: '100%',
        padding: '10px',
        backgroundColor: '#007BFF',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
        marginTop: '10px',
    },
    backButton: {
        width: '100%',
        padding: '10px',
        backgroundColor: '#6c757d',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
        marginTop: '10px',
    },
    errorMessage: {
        color: 'red',
        textAlign: 'center',
        marginTop: '10px',
    },
};

export default AdminLoginPage;
