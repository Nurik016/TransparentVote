let WALLET_CONNECTED = "";
let contractAddress = "0x20f1B4D6E2b52a9fBF1B7a5289e642d8239CB18F";
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

          // Очистка таблицы перед добавлением новых данных
          var table = document.getElementById("myTable");
          var tbody = table.querySelector("tbody");
          tbody.innerHTML = ""; // Очистка содержимого <tbody>

          // Заполнение таблицы новыми данными
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

        // Получаем статус голосования
        const currentStatus = await contractInstance.getVotingStatus();
        status.innerHTML = currentStatus == 1 ? "Voting is currently open" : "Voting is finished";

        // Получаем оставшееся время
        let time = parseInt(await contractInstance.getRemainingTime(), 16); // Конвертация из hex в decimal

        // Если голосование завершено, очищаем поле с временем
        if (time <= 0) {
            remainingTime.innerHTML = "Voting has ended.";
            if (timerInterval) {
                clearInterval(timerInterval); // Останавливаем таймер
                timerInterval = null;
            }
            return;
        }

        // Если голосование активно и таймер еще не был запущен
        if (!isVotingActive) {
            remainingTime.innerHTML = `Remaining time is ${time} seconds`;

            // Запускаем динамический обратный отсчёт
            timerInterval = setInterval(() => {
                if (time > 0) {
                    time--; // Уменьшаем время
                    remainingTime.innerHTML = `Remaining time is ${time} seconds`;
                } else {
                    clearInterval(timerInterval); // Останавливаем таймер, когда время закончилось
                    timerInterval = null;
                    remainingTime.innerHTML = "Voting has ended.";
                }
            }, 1000); // Обновление каждую секунду

            isVotingActive = true; // Устанавливаем флаг, что голосование активно
        } else {
            remainingTime.innerHTML = `Remaining time is ${time} seconds`; // Просто обновляем время
        }
    } else {
        var status = document.getElementById("status");
        status.innerHTML = "Please connect metamask first";
    }
};



const addVote = async() => {
    if(WALLET_CONNECTED != 0) {
        var name = document.getElementById("vote");
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);
        var cand = document.getElementById("cand");
        cand.innerHTML = "Please wait, adding a vote in the smart contract";
        const tx = await contractInstance.vote(name.value);
        await tx.wait();
        cand.innerHTML = "Vote added !!!";
    }
    else {
        var cand = document.getElementById("cand");
        cand.innerHTML = "Please connect metamask first";
    }
}