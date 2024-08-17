// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    struct Voter {
        string username;
        string password;
        bool registered;
        bool hasVoted;
    }

    uint public candidateNext;
    address public admin;
    bool public votingOpen;
    Candidate[] public candidates;
    Voter[] public voters; // Mapping of addresses to Voter structs

    constructor() {
        admin = msg.sender;
        addCandidate("Bob");
        addCandidate("Jill");
        candidateNext = 2;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function.");
        _;
    }

    modifier votingOpenOnly() {
        require(votingOpen == true, "Voting is not open.");
        _;
    }

    event UserRegistered(string username);
    event CandidateAdded(uint id, string name);
    event VoteCast(address voter, uint candidateId);
    event CandidateRemoved(string name);
    event LogMessage(string message);
    event LogAddress(address addr);
    event LogUint(uint value);

    function registerUser(string memory _username, string memory _password) public returns (bool) {
        if (isUsernameRegistered(_username)) {
            return false;
        }

        voters.push(Voter(_username, _password, true, false));
        emit UserRegistered(_username);
        return true;
    }

    function addCandidate(string memory _name) public onlyAdmin {
        candidates.push(Candidate(candidateNext, _name, 0));
        candidateNext++;
        emit CandidateAdded(candidateNext, _name);
    }

    function removeCandidate(string memory _candidateName) public onlyAdmin {
        uint index = findIndexByName(_candidateName);
        require(index < candidates.length, "Candidate not found");
        candidates[index] = candidates[candidates.length - 1];
        candidates.pop();
        candidates[index].id = index;
        candidateNext--;
        emit CandidateRemoved(_candidateName);
    }

    function findIndexByName(string memory _name) internal view returns (uint) {
        for (uint i = 0; i < candidates.length; i++) {
            if (keccak256(abi.encodePacked(candidates[i].name)) == keccak256(abi.encodePacked(_name))) {
                return i;
            }
        }
        revert("Candidate not found");
    }

    function isUsernameRegistered(string memory _username) internal view returns (bool) {
        for (uint i = 0; i < voters.length; i++) {
            if (keccak256(abi.encodePacked(voters[i].username)) == keccak256(abi.encodePacked(_username))) {
                return true;
            }
        }
        return false;
    }

    function findIndexUser(string memory _username) internal view returns (uint) {
        for (uint i = 0; i < voters.length; i++) {
            if (keccak256(abi.encodePacked(voters[i].username)) == keccak256(abi.encodePacked(_username))) {
                return i;
            }
        }
        return voters.length + 1; // This would indicate that the user was not found
    }

    function vote(uint _candidateId, string memory _username) public votingOpenOnly returns (string memory) {
        emit LogMessage("Starting vote function");

//        if (!voters[findIndexUser(_username)].registered) {
//            emit LogMessage("User is not registered");
//            return "You must be registered to vote.";
//        }

        if (voters[findIndexUser(_username)].hasVoted) {
            emit LogMessage("User has already voted");
            return "You have already voted.";
        }
        emit LogMessage("Voter has not voted yet");

        voters[findIndexUser(_username)].hasVoted = true;
        emit LogMessage("Voter has now voted");

        candidates[_candidateId].voteCount++;
        emit LogMessage("Vote count incremented");

        emit VoteCast(msg.sender, _candidateId);
        emit LogMessage("VoteCast event emitted");

        return "Vote cast successfully";
    }

    function getVoteCount(uint _candidateId) public view returns (uint) {
        return candidates[_candidateId - 1].voteCount; // Adjust index since _candidateId starts from 1
    }

    function openVoting() public onlyAdmin {
        votingOpen = true;
    }

    function closeVoting() public onlyAdmin {
        votingOpen = false;
    }

    function authenticate(string memory _username, string memory _password) public view returns (bool) {
        Voter storage voter = voters[findIndexUser(_username)];
        if (!voter.registered) {
            return false;
        }
        return keccak256(bytes(voter.username)) == keccak256(bytes(_username)) && keccak256(bytes(voter.password)) == keccak256(bytes(_password));
    }

    function getAllCandidates() public view returns (uint[] memory, string[] memory, uint[] memory) {
        uint[] memory ids = new uint[](candidates.length);
        string[] memory names = new string[](candidates.length);
        uint[] memory voteCounts = new uint[](candidates.length);

        for (uint i = 0; i < candidates.length; i++) {
            ids[i] = candidates[i].id;
            names[i] = candidates[i].name;
            voteCounts[i] = candidates[i].voteCount;
        }
        return (ids, names, voteCounts);
    }

    function getVotingOpen() public view returns (bool) {
        return votingOpen;
    }
}
