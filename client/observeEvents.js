const Voting = artifacts.require("Voting");

module.exports = async function(callback) {
    try {
        const accounts = await web3.eth.getAccounts();
        const instance = await Voting.deployed();

        const isRegistered = await instance.voters(accounts[0]);
        if (!isRegistered.registered) {
            await instance.registerUser("user1", "password1", { from: accounts[0] });
            console.log("User registered");
        } else {
            console.log("User already registered");
        }

        // Add candidates
        await instance.addCandidate("Candidate 1", { from: accounts[0] });
        await instance.addCandidate("Candidate 2", { from: accounts[0] });

        // Open voting
        await instance.openVoting({ from: accounts[0] });

        // Cast a vote for Candidate 1 (candidateId = 1)
        const tx = await instance.vote(1, { from: accounts[0] });

        // Observe the logs from the vote transaction
        console.log("Transaction logs from voting:", tx.logs);

        // Listen for all events
        const allEvents = await instance.getPastEvents('allEvents', {
            fromBlock: 0,
            toBlock: 'latest'
        });

        console.log("All events:");
        allEvents.forEach(event => {
            console.log(event.event, event.returnValues);
        });

    } catch (error) {
        console.error("Error:", error);
    }
    callback();
};
