const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Voting Contract", function () {
    let Voting, voting, owner, voter1, voter2;

    beforeEach(async function () {
        [owner, voter1, voter2] = await ethers.getSigners();
        const candidates = ["Alice", "Bob", "Charlie"];
        const duration = 10; // 10 минут
        Voting = await ethers.getContractFactory("Voting");
        voting = await Voting.deploy(candidates, duration);
        await voting.deployed();
    });

    it("should initialize with correct candidates", async function () {
        const candidates = await voting.getAllVotesOfCandidates();
        expect(candidates.length).to.equal(3);
        expect(candidates[0].name).to.equal("Alice");
    });

    it("should allow the owner to add a new candidate", async function () {
        await voting.addCandidate("Dave");
        const candidates = await voting.getAllVotesOfCandidates();
        expect(candidates.length).to.equal(4);
    });

    it("should not allow non-owners to add a candidate", async function () {
        await expect(voting.connect(voter1).addCandidate("Eve"))
            .to.be.revertedWith("Only owner can call this function.");
    });

    it("should not allow adding a candidate with an invalid name", async function () {
        await expect(voting.addCandidate("")).to.be.revertedWith("Invalid candidate name.");
    });

    it("should allow a user to vote for a candidate", async function () {
        await voting.connect(voter1).vote(0);
        const candidates = await voting.getAllVotesOfCandidates();
        expect(candidates[0].voteCount).to.equal(1);
    });

    it("should not allow a user to vote twice", async function () {
        await voting.connect(voter1).vote(0);
        await expect(voting.connect(voter1).vote(0))
            .to.be.revertedWith("You have already voted.");
    });

    it("should not allow voting for an invalid candidate index", async function () {
        await expect(voting.connect(voter1).vote(5))
            .to.be.revertedWith("Invalid candidate index.");
    });

    it("should correctly report voting status", async function () {
        expect(await voting.getVotingStatus()).to.equal(true);

        await ethers.provider.send("evm_increaseTime", [10 * 60]); // Увеличить время на 10 минут
        await ethers.provider.send("evm_mine"); // Применить изменения
        expect(await voting.getVotingStatus()).to.equal(false);
    });

    it("should correctly report remaining voting time", async function () {
        const remainingTime = await voting.getRemainingTime();
        expect(remainingTime).to.be.a("number").and.to.be.greaterThan(0);
    });

    it("should revert when adding duplicate candidates", async function () {
        await expect(voting.addCandidate("Alice"))
            .to.be.revertedWith("Duplicate candidate name.");
    });
});
