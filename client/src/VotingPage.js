import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import Voting from './contracts/Voting.json';
import { Bar, Pie } from 'react-chartjs-2';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import 'chart.js/auto';

const VotingPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { username } = location.state || {};
    const [candidateNames, setCandidateNames] = useState([]);
    const [candidateVotes, setCandidateVotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [account, setAccount] = useState('');
    const [instance, setInstance] = useState(null);
    const [votingOpen, setVotingOpen] = useState(false);

    const loadBlockchainData = async () => {
        try {
            const web3 = new Web3('http://localhost:7545');
            const accounts = await web3.eth.getAccounts();
            setAccount(accounts[0]);

            const networkId = await web3.eth.net.getId();
            const deployedNetwork = Voting.networks[networkId];
            if (deployedNetwork) {
                const instance = new web3.eth.Contract(
                    Voting.abi,
                    deployedNetwork.address,
                );
                setInstance(instance);

                const votingStatus = await instance.methods.getVotingOpen().call();
                setVotingOpen(votingStatus);

                if (votingStatus) {
                    const result = await instance.methods.getAllCandidates().call();
                    const ids = result[0].map(id => Number(id));
                    const names = result[1];
                    const voteCounts = result[2];
                    const candidateNames = [];
                    const candidateVotes = [];
                    for (let i = 0; i < names.length; i++) {
                        candidateVotes.push(voteCounts[i].toString());
                        candidateNames.push(names[i]);
                    }
                    setCandidateNames(candidateNames);
                    setCandidateVotes(candidateVotes);
                }
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

    const handleVote = async (candidateId) => {
        if (!instance) return;
        try {
            const web3 = new Web3('http://localhost:7545');
            const gasPrice = await web3.eth.getGasPrice();
            await instance.methods.vote(candidateId, username).send({ from: account, gasPrice });

            const votes = await instance.methods.getAllCandidates().call();
            const votesOut = [];
            for (let i = 0; i < votes[2].length; i++) {
                votesOut.push(votes[2][i].toString());
            }
            setCandidateVotes(votesOut);

            alert('Vote cast successfully!');
        } catch (error) {
            console.error('Error casting vote:', error);
        }
    };

    if (loading) {
        return <div style={styles.loading}>Loading...</div>;
    }

    if (!votingOpen) {
        return (
            <div>
                <div style={styles.message}>Voting is currently closed.</div>
                <Link to="/" style={styles.link}>Logout</Link>
            </div>
        );
    }

    const barData = {
        labels: candidateNames,
        datasets: [{
            label: 'Vote Count',
            data: candidateVotes,
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
        }],
    };

    const pieData = {
        labels: candidateNames,
        datasets: [{
            label: 'Vote Percentage',
            data: candidateVotes,
            backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(255, 206, 86, 0.6)'],
            borderColor: 'rgba(255, 255, 255, 1)',
            borderWidth: 1,
        }],
    };

    const barOptions = {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1,
                },
            },
        },
        maintainAspectRatio: false,
    };

    const pieOptions = {
        responsive: true,
        maintainAspectRatio: false,
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Voting Page</h2>
            <ul style={styles.candidateList}>
                {candidateNames.length > 0 ? (
                    candidateNames.map((name, index) => (
                        <li key={index} style={styles.candidateItem}>
                            <span style={styles.candidateName}>{name}</span>
                            <span style={styles.candidateVotes}>{candidateVotes[index]} votes</span>
                            <button
                                onClick={() => handleVote(index)}
                                style={styles.voteButton}
                            >
                                Vote
                            </button>
                        </li>
                    ))
                ) : (
                    <li style={styles.message}>No candidates available.</li>
                )}
            </ul>
            <div style={styles.chartsContainer}>
                <div style={styles.chart}>
                    <Bar data={barData} options={barOptions} />
                </div>
                <div style={styles.chart}>
                    <Pie data={pieData} options={pieOptions} />
                </div>
            </div>
            <Link to="/" style={styles.link}>Logout</Link>
        </div>
    );
};

const styles = {
    container: {
        padding: '20px',
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
    },
    title: {
        fontSize: '24px',
        textAlign: 'center',
        color: '#333',
        margin: '20px 0',
    },
    candidateList: {
        listStyleType: 'none',
        padding: 0,
        marginBottom: '20px',
    },
    candidateItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px',
        backgroundColor: '#fff',
        borderRadius: '4px',
        marginBottom: '10px',
        boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.1)',
    },
    candidateName: {
        fontSize: '16px',
        color: '#333',
        flex: 1,
    },
    candidateVotes: {
        fontSize: '14px',
        color: '#777',
        marginRight: '10px',
    },
    voteButton: {
        padding: '8px 12px',
        backgroundColor: '#007BFF',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
    },
    chartsContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '20px',
    },
    chart: {
        width: '45%',
        height: '300px',
    },
    link: {
        display: 'block',
        marginTop: '20px',
        textAlign: 'center',
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
    message: {
        fontSize: '18px',
        textAlign: 'center',
        color: '#666',
        marginTop: '20px',
    },
};

export default VotingPage;
