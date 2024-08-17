import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import Voting from './contracts/Voting.json';
import { Link } from 'react-router-dom';

const AdminPage = () => {
  const [names, setNames] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [candidateName, setCandidateName] = useState('');
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState('');
  const [instance, setInstance] = useState(null);
  const [votingOpen, setVotingOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const loadBlockchainData = async () => {
    try {
      const web3 = new Web3('http://localhost:7545');
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0]);

      const networkId = await web3.eth.net.getId();
      const deployedNetwork = Voting.networks[networkId];
      if (deployedNetwork) {
        const contractInstance = new web3.eth.Contract(
            Voting.abi,
            deployedNetwork.address,
        );
        setInstance(contractInstance);

        const isOpen = await contractInstance.methods.getVotingOpen().call();
        setVotingOpen(isOpen);

        const result = await contractInstance.methods.getAllCandidates().call();
        const ids = result[0];
        const names = result[1];
        const voteCounts = result[2];

        const candidatesArray = [];
        for (let i = 0; i < names.length; i++) {
          const candidateName = names[i];
          const voteCount = voteCounts[i];
          candidatesArray.push({ id: ids[i], name: candidateName, voteCount: voteCount.toString() });
        }
        setCandidates(candidatesArray);
        setNames(names);
      } else {
        console.error('Voting contract not deployed to detected network.');
      }
    } catch (error) {
      console.error('Error loading blockchain data:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadBlockchainData();
  }, []);

  const fetchUpdatedCandidates = async () => {
    try {
      const result = await instance.methods.getAllCandidates().call();
      const ids = result[0];
      const names = result[1];
      const voteCounts = result[2];

      const candidatesArray = [];
      for (let i = 0; i < names.length; i++) {
        const candidateName = names[i];
        const voteCount = voteCounts[i];
        candidatesArray.push({ id: ids[i], name: candidateName, voteCount: voteCount.toString() });
      }
      setCandidates(candidatesArray);
      setNames(names);
    } catch (error) {
      console.error('Error fetching updated candidates:', error);
    }
  };

  const addCandidate = async () => {
    if (candidateName === '') {
      setErrorMessage('Enter a candidate name');
      return;
    }
    for (let i = 0; i < names.length; i++) {
      console.log(names[i]);
      if (candidateName===names[i]) {
        setErrorMessage('This candidate is already registered');
        return;
      }
    }
    if (!instance) return;
    try {
      const web3 = new Web3('http://localhost:7545');
      const gasPrice = await web3.eth.getGasPrice();
      await instance.methods.addCandidate(candidateName).send({ from: account, gasPrice });
      await fetchUpdatedCandidates();
      setCandidateName('');  // Clear input field after adding candidate
    } catch (error) {
      console.error('Error adding candidate:', error);
    }
  };

  const removeCandidate = async (candidateName) => {
    if (!instance) return;
    try {
      const web3 = new Web3('http://localhost:7545');
      const gasPrice = await web3.eth.getGasPrice();
      await instance.methods.removeCandidate(candidateName).send({ from: account, gasPrice });
      await fetchUpdatedCandidates();
    } catch (error) {
      console.error('Error removing candidate:', error);
    }
  };

  const openVoting = async () => {
    if (!instance) return;
    try {
      const web3 = new Web3('http://localhost:7545');
      const gasPrice = await web3.eth.getGasPrice();
      await instance.methods.openVoting().send({ from: account, gasPrice });
      setVotingOpen(true);
    } catch (error) {
      console.error('Error opening voting:', error);
    }
  };

  const closeVoting = async () => {
    if (!instance) return;
    try {
      const web3 = new Web3('http://localhost:7545');
      const gasPrice = await web3.eth.getGasPrice();
      await instance.methods.closeVoting().send({ from: account, gasPrice });
      setVotingOpen(false);
    } catch (error) {
      console.error('Error closing voting:', error);
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>Admin Page</h2>
          <p style={votingOpen ? styles.votingStatusOpen : styles.votingStatusClosed}>
            Voting is currently {votingOpen ? 'open' : 'closed'}.
          </p>
        </div>

        {!votingOpen && (
            <div style={styles.form}>
              <input
                  type="text"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  placeholder="Candidate Name"
                  style={styles.input}
              />
              <button onClick={addCandidate} style={styles.button}>
                Add Candidate
              </button>
              {errorMessage && <p style={styles.errorMessage}>{errorMessage}</p>}
              <ul style={styles.candidateList}>
                {candidates.map((candidate) => (
                    <li key={candidate.id} style={styles.candidateItem}>
                      {candidate.name}
                      <button
                          onClick={() => removeCandidate(candidate.name)}
                          style={styles.removeButton}
                      >
                        Remove
                      </button>
                    </li>
                ))}
              </ul>
            </div>
        )}

        {votingOpen && (
            <div style={styles.candidateResults}>
              <h3 style={styles.subTitle}>Current Candidates:</h3>
              <ul style={styles.candidateList}>
                {candidates.map((candidate) => (
                    <li key={candidate.id} style={styles.candidateItem}>
                      {candidate.name} - {candidate.voteCount} votes
                    </li>
                ))}
              </ul>
            </div>
        )}

        <div style={styles.buttonGroup}>
          {!votingOpen && (
              <button onClick={openVoting} style={styles.button}>
                Open Voting
              </button>
          )}
          {votingOpen && (
              <button onClick={closeVoting} style={styles.button}>
                Close Voting
              </button>
          )}
          <Link to="/admin-login" style={styles.link}>
            Logout
          </Link>
        </div>
      </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
  },
  header: {
    marginBottom: '20px',
    textAlign: 'center',
  },
  title: {
    fontSize: '24px',
    color: '#333',
    margin: '10px 0',
  },
  votingStatus: {
    fontSize: '16px',
    color: '#666',
  },
  form: {
    marginBottom: '20px',
  },
  input: {
    width: '100%',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    marginBottom: '10px',
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
    marginBottom: '10px',
  },
  candidateList: {
    listStyleType: 'none',
    padding: 0,
  },
  candidateItem: {
    padding: '10px',
    backgroundColor: '#fff',
    borderRadius: '4px',
    marginBottom: '10px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.1)',
  },
  errorMessage: {
    color: 'red',
    textAlign: 'center',
    marginTop: '10px',
  },
  removeButton: {
    padding: '5px 10px',
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  candidateResults: {
    marginBottom: '20px',
  },
  subTitle: {
    fontSize: '20px',
    color: '#333',
    margin: '10px 0',
  },
  buttonGroup: {
    textAlign: 'center',
  },
  link: {
    display: 'block',
    marginTop: '10px',
    color: '#007BFF',
    textDecoration: 'none',
    fontSize: '16px',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '20px',
    color: '#333',
  },
  votingStatusOpen: {
    color: 'green',
    fontSize: '18px',
    textAlign: 'center',
    marginTop: '20px',
  },
  votingStatusClosed: {
    color: 'orange',
    fontSize: '18px',
    textAlign: 'center',
    marginTop: '20px',
  },
};

export default AdminPage;
