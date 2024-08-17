import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Web3 from 'web3';
import Voting from './contracts/Voting.json';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const loadBlockchainData = async () => {
    try {
      const web3 = new Web3('http://localhost:7545');
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0]);

      const networkId = await web3.eth.net.getId();
      const deployedNetwork = Voting.networks[networkId];
      if (!deployedNetwork) {
        throw new Error('Voting contract not deployed to detected network.');
      }

      const instance = new web3.eth.Contract(
          Voting.abi,
          deployedNetwork.address,
      );
      setContract(instance);
      setLoading(false);
    } catch (error) {
      console.error('Error loading blockchain data:', error);
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!contract) return;

    try {
      const isAuthenticated = await contract.methods.authenticate(username, password).call({ from: account });

      if (isAuthenticated) {
        console.log('User authenticated');
        navigate('/vote', { state: { username } });
      } else {
        setErrorMessage('Invalid credentials. Please try again.');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      setErrorMessage('An error occurred during login. Please try again.');
    }
  };

  useEffect(() => {
    loadBlockchainData();
  }, []);

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  return (
      <div style={styles.container}>
        <div style={styles.formContainer}>
          <h2 style={styles.title}>Login</h2>
          <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              style={styles.input}
          />
          <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              style={styles.input}
          />
          <button onClick={handleLogin} style={styles.button}>
            Login
          </button>
          {errorMessage && <p style={styles.errorMessage}>{errorMessage}</p>}
          <div style={styles.links}>
            <Link to="/register" style={styles.link}>
              Register
            </Link>
            <Link to="/admin-login" style={styles.link}>
              Admin
            </Link>
          </div>
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
    backgroundColor: '#4CAF50',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  errorMessage: {
    color: 'red',
    textAlign: 'center',
    marginTop: '10px',
  },
  links: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '20px',
  },
  link: {
    color: '#4CAF50',
    textDecoration: 'none',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '24px',
    color: '#333',
  },
};

export default LoginPage;
