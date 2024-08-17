import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Web3 from 'web3';
import Voting from './contracts/Voting.json';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [checklist, setChecklist] = useState({
    length: false,
    upperCase: false,
    lowerCase: false,
    number: false,
    specialChar: false,
  });

  const navigate = useNavigate();

  const loadBlockchainData = async () => {
    try {
      const web3 = new Web3(Web3.givenProvider || 'http://localhost:7545');
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0]);

      const networkId = await web3.eth.net.getId();
      const deployedNetwork = Voting.networks[networkId];
      if (deployedNetwork) {
        const instance = new web3.eth.Contract(
            Voting.abi,
            deployedNetwork.address,
        );
        setContract(instance);
        setLoading(false);
      } else {
        console.error('Voting contract not deployed to detected network.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error loading blockchain data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlockchainData();
  }, []);

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    setChecklist({
      length: password.length >= minLength,
      upperCase: hasUpperCase,
      lowerCase: hasLowerCase,
      number: hasNumber,
      specialChar: hasSpecialChar,
    });

    if (password.length < minLength) {
      return `Password must be at least ${minLength} characters long.`;
    }
    if (!hasUpperCase) {
      return 'Password must contain at least one uppercase letter.';
    }
    if (!hasLowerCase) {
      return 'Password must contain at least one lowercase letter.';
    }
    if (!hasNumber) {
      return 'Password must contain at least one number.';
    }
    if (!hasSpecialChar) {
      return 'Password must contain at least one special character (e.g., !@#$%^&*).';
    }
    return null;
  };

  const handleRegistration = async () => {
    if (!contract) {
      console.log('NO CONTRACT');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setErrorMessage(passwordError);
      return;
    }

    try {
      const result = await contract.methods.registerUser(username, password).send({
        from: account,
        gas: 2000000,
        gasPrice: '1000000000'
      });

      // Check if the UserRegistered event is present in the logs
      if (result.events && result.events.UserRegistered) {
        console.log('User registered successfully:', result.events.UserRegistered.returnValues);
        navigate('/');
      } else {
        setErrorMessage('This username is already registered');
      }
    } catch (error) {
      console.error('Error registering user:', error);
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  return (
      <div style={styles.container}>
        <div style={styles.formContainer}>
          <h2 style={styles.title}>Register</h2>
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
              onChange={(e) => {
                setPassword(e.target.value);
                validatePassword(e.target.value);
              }}
              placeholder="Password"
              style={styles.input}
          />
          <div style={styles.checklistContainer}>
            <ul style={styles.checklist}>
              <li style={{ color: checklist.length ? 'green' : 'red' }}>
                {checklist.length ? '✔' : '✘'} Minimum 8 characters
              </li>
              <li style={{ color: checklist.upperCase ? 'green' : 'red' }}>
                {checklist.upperCase ? '✔' : '✘'} At least one uppercase letter
              </li>
              <li style={{ color: checklist.lowerCase ? 'green' : 'red' }}>
                {checklist.lowerCase ? '✔' : '✘'} At least one lowercase letter
              </li>
              <li style={{ color: checklist.number ? 'green' : 'red' }}>
                {checklist.number ? '✔' : '✘'} At least one number
              </li>
              <li style={{ color: checklist.specialChar ? 'green' : 'red' }}>
                {checklist.specialChar ? '✔' : '✘'} At least one special character (e.g., !@#$%^&*)
              </li>
            </ul>
          </div>
          <button onClick={handleRegistration} style={styles.button}>
            Register
          </button>
          {errorMessage && <p style={styles.errorMessage}>{errorMessage}</p>}
          <div style={styles.links}>
            <Link to="/" style={styles.link}>
              Login
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
    width: '400px',
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
  checklistContainer: {
    margin: '15px 0',
  },
  checklist: {
    listStyleType: 'none',
    padding: 0,
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
    marginTop: '10px',
  },
  errorMessage: {
    color: 'red',
    textAlign: 'center',
    marginTop: '10px',
  },
  links: {
    display: 'flex',
    justifyContent: 'center',
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

export default RegisterPage;
