require('dotenv').config();
const express = require('express');
const app = express();
const fileUpload = require('express-fileupload');
app.use(
    fileUpload({
        extended: true
    })
)
app.use(express.static(__dirname));
app.use(express.json());
const path = require("path");
const ethers = require('ethers');

var port = 3000;

const API_URL = process.env.API_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

const { abi } = require('./artifacts/contracts/Voting.sol/Voting.json');
const provider = new ethers.providers.JsonRpcProvider(API_URL);

const signer = new ethers.Wallet(PRIVATE_KEY, provider);

const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

// Отправка страницы на фронтенд
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
})

app.get("/index.html", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
})

async function validateCandidateName(name) {
    if (!name || name.trim().length === 0) {
        throw new Error("Candidate name cannot be empty.");
    }

    for (let i = 0; i < name.length; i++) {
        if (!isNaN(name[i])) {
            throw new Error("Candidate name cannot contain digits.");
        }
    }

    // Проверка уникальности имени кандидата
    const candidates = await contractInstance.getAllVotesOfCandidates();
    if (candidates.some(candidate => candidate.name.toLowerCase() === name.toLowerCase())) {
        throw new Error("Candidate name must be unique.");
    }
}

app.post("/addcandidate", async (req, res) => {
    var vote = req.body.vote;
    console.log(vote);

    try {
        await validateCandidateName(vote);

        async function storeDataInBlockchain(vote) {
            console.log("Adding the candidate in voting contract...");
            const tx = await contractInstance.addCandidate(vote);
            await tx.wait();
        }

        const bool = await contractInstance.getVotingStatus();
        if (bool == true) {
            await storeDataInBlockchain(vote);
            res.send("The candidate has been registered in the smart contract.");
        } else {
            res.send("Voting is finished.");
        }
    } catch (error) {
        console.error(error);
        res.status(400).send(error.message);
    }
});

app.listen(port, function () {
    console.log("App is listening on port 3000")
});
