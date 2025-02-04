let WALLET_CONNECTED = "";
let contractAddress = "0x61cf98c3DE13e0BaBd5e841dB3838138CFee1b14";
let contractAbi =  [
  {
    "inputs": [
      {
        "internalType": "string[]",
        "name": "_candidateNames",
        "type": "string[]"
      },
      {
        "internalType": "uint256",
        "name": "_durationInMinutes",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "string",
        "name": "name",
        "type": "string"
      }
    ],
    "name": "CandidateAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "voter",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "candidateIndex",
        "type": "uint256"
      }
    ],
    "name": "Voted",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      }
    ],
    "name": "addCandidate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "candidates",
    "outputs": [
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "voteCount",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllVotesOfCandidates",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "voteCount",
            "type": "uint256"
          }
        ],
        "internalType": "struct Voting.Candidate[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getRemainingTime",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getVotingStatus",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_candidateIndex",
        "type": "uint256"
      }
    ],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "voters",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "votingEnd",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "votingStart",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

const connectWallet = async() => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    WALLET_CONNECTED = await signer.getAddress();
    var element = document.getElementById("metamasknotification");
    element.innerHTML = "Metamask is connected " + WALLET_CONNECTED;
    
    listenToEvents();
    getHistoricalEvents();
}

const getAllCandidates = async () => {
  if (WALLET_CONNECTED != 0) {
      var p3 = document.getElementById("p3");
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);
      p3.innerHTML = "Please wait, getting all the candidates from the voting smart contract";

      try {
          var candidates = await contractInstance.getAllVotesOfCandidates();
          console.log(candidates);

          var table = document.getElementById("myTable");
          var tbody = table.querySelector("tbody");
          tbody.innerHTML = "";

          for (let i = 0; i < candidates.length; i++) {
              var row = tbody.insertRow();
              var idCell = row.insertCell();
              var descCell = row.insertCell();
              var statusCell = row.insertCell();

              idCell.innerHTML = i;
              descCell.innerHTML = candidates[i].name;
              statusCell.innerHTML = candidates[i].voteCount;
          }

          p3.innerHTML = "The tasks are updated";
      } catch (error) {
          console.error("Error fetching candidates:", error);
          p3.innerHTML = "Failed to fetch candidates. Check the console for details.";
      }
  } else {
      var p3 = document.getElementById("p3");
      p3.innerHTML = "Please connect Metamask first";
  }
};


let timerInterval = null; // Глобальная переменная для хранения интервала
let isVotingActive = false; // Проверка на активность голосования

const voteStatus = async () => {
    if (WALLET_CONNECTED != 0) {
        var status = document.getElementById("status");
        var remainingTime = document.getElementById("time");

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);

        const currentStatus = await contractInstance.getVotingStatus();
        status.innerHTML = currentStatus == 1 ? "Voting is currently open" : "Voting is finished";

        let time = parseInt(await contractInstance.getRemainingTime(), 16);

        if (time <= 0) {
            remainingTime.innerHTML = "Voting has ended.";
            if (timerInterval) {
                clearInterval(timerInterval);
                timerInterval = null;
            }
            return;
        }

        if (!isVotingActive) {
            remainingTime.innerHTML = `Remaining time is ${time} seconds`;

            timerInterval = setInterval(() => {
                if (time > 0) {
                    time--;
                    remainingTime.innerHTML = `Remaining time is ${time} seconds`;
                } else {
                    clearInterval(timerInterval);
                    timerInterval = null;
                    remainingTime.innerHTML = "Voting has ended.";
                }
            }, 1000);

            isVotingActive = true;
        } else {
            remainingTime.innerHTML = `Remaining time is ${time} seconds`;
        }
    } else {
        var status = document.getElementById("status");
        status.innerHTML = "Please connect metamask first";
    }
};

const addVote = async () => {
  if (WALLET_CONNECTED != 0) {
      const voteInput = document.getElementById("vote");
      const cand = document.getElementById("cand");
      const candidateIndex = parseInt(voteInput.value, 10);

      if (isNaN(candidateIndex) || candidateIndex < 0) {
          cand.innerHTML = "Error: Invalid candidate index. Please enter a valid number.";
          return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);

      cand.innerHTML = "Please wait, adding a vote to the smart contract...";

      try {
          const tx = await contractInstance.vote(candidateIndex);
          await tx.wait();
          cand.innerHTML = "Vote added successfully!";
      } catch (error) {
          if (error.message.includes("Internal JSON-RPC error")) {
              cand.innerHTML = "Error: The provided index is out of range or invalid.";
          } else {
              console.error("An error occurred:", error);
              cand.innerHTML = `Error: ${error.message}`;
          }
      }
  } else {
      const cand = document.getElementById("cand");
      cand.innerHTML = "Please connect Metamask first";
  }
};

const listenToEvents = async () => {
  if (!WALLET_CONNECTED) {
      console.error("Please connect Metamask first.");
      return;
  }

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);

  contractInstance.on("CandidateAdded", (name) => {
      console.log(`New candidate added: ${name}`);
      alert(`New candidate added: ${name}`);
      getAllCandidates(); // update table
  });

  contractInstance.on("Voted", (voter, candidateIndex) => {
      console.log(`New vote: ${voter} voted for candidate index ${candidateIndex}`);
      alert(`Vote casted by ${voter} for candidate index ${candidateIndex}`);
      getAllCandidates(); // update table
  });
};

const getHistoricalEvents = async () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const contractInstance = new ethers.Contract(contractAddress, contractAbi, provider);

  // event CandidateAdded
  const candidateAddedEvents = await contractInstance.queryFilter("CandidateAdded");
  console.log("CandidateAdded events:", candidateAddedEvents);

  candidateAddedEvents.forEach((event) => {
      console.log(`Candidate: ${event.args.name}`);
  });

  // event Voted
  const votedEvents = await contractInstance.queryFilter("Voted");
  console.log("Voted events:", votedEvents);

  votedEvents.forEach((event) => {
      console.log(`Voter: ${event.args.voter}, Candidate Index: ${event.args.candidateIndex}`);
  });
};