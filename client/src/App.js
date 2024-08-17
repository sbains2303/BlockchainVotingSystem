import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import Voting from './contracts/Voting.json';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './LoginPage.js';
import VotingPage from './VotingPage.js';
import RegisterPage from './RegistrationPage.js';
import AdminLoginPage from './AdminLoginPage';
import AdminPage from './AdminPage';

const App = () => {
  const [account, setAccount] = useState('');
//  const [candidates, setCandidates] = useState([]);
  const [contract, setContract] = useState(null);
//  const [candidateName, setCandidateName] = useState('');
  const [loading, setLoading] = useState(true);
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);

  useEffect(() => {
    const loadBlockchainData = async () => {
      try {
        const web3 = new Web3('http://localhost:7545');
        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);

        const networkId = await web3.eth.net.getId();
        console.log("Network ID:", networkId);
        console.log("Voting networks:", Voting.networks);

        const deployedNetwork = Voting.networks[networkId];
        if (deployedNetwork) {
          const instance = new web3.eth.Contract(
              Voting.abi,
              deployedNetwork.address,
          );
          setContract(instance);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error loading blockchain data:', error);
        setLoading(false);
      }
    }
    loadBlockchainData();
  }, []);

//  const addCandidate = async () => {
//    const web3 = new Web3('http://localhost:7545');
//    if (!contract) return;
//    await contract.methods.addCandidate(candidateName).send({ from: account, gasPrice: await web3.eth.getGasPrice() });
//    const candidatesCount = await contract.methods.candidatesCount().call();
//    const candidate = await contract.methods.candidates(candidatesCount).call();
//    setCandidates([...candidates, candidate]);
//    setCandidateName('');
//  };
//
//  const vote = async (id) => {
//    const web3 = new Web3('http://localhost:7545');
//    if (!contract) return;
//    await contract.methods.vote(id).send({ from: account, gasPrice: await web3.eth.getGasPrice() });
//  };

  if (loading) {
    return <div>Loading...</div>;
  }

//  return (
//    <div>
//      <h1>Blockchain Voting System</h1>
//      <div>
//        <input
//          type="text"
//          value={candidateName}
//          onChange={(e) => setCandidateName(e.target.value)}
//          placeholder="Candidate Name"
//        />
//        <button onClick={addCandidate}>Add Candidate</button>
//      </div>
//      <h2>Candidates</h2>
//      <ul>
//        {candidates.map((candidate) => (
//          <li key={candidate.id}>
//            {candidate.name} - {candidate.voteCount} votes
//            <button onClick={() => vote(candidate.id)}>Vote</button>
//          </li>
//        ))}
//      </ul>
//    </div>
//  );
//};

return (
    <Router>
      <div>
        <Routes>
          <Route path="/" exact element={<LoginPage/>} />
          <Route path="/vote" element={<VotingPage account={account} contract={contract} />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin-login" element={<AdminLoginPage setAdminLoggedIn={setAdminLoggedIn} />} />
          {adminLoggedIn && <Route path="/admin" element={<AdminPage />} />}
        </Routes>
      </div>
    </Router>
  );
};

export default App;
