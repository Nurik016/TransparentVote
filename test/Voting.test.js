const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Voting Contract", function () {
  let Voting;
  let voting;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    Voting = await ethers.getContractFactory("Voting");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    voting = await Voting.connect(owner).deploy(
      ["Alice", "Bob", "Charlie"],  // Candidate names
      1  // 1 minute
    );
    await voting.deployed();
  });

  it("Should set the correct owner", async function () {
    expect(await voting.owner()).to.equal(owner.address);
  });

  it("Should initialize with correct candidates", async function () {
    const candidates = await voting.getAllVotesOfCandidates();
    expect(candidates.length).to.equal(3);
    expect(candidates[0].name).to.equal("Alice");
    expect(candidates[1].name).to.equal("Bob");
    expect(candidates[2].name).to.equal("Charlie");
  });

  it("Should allow owner to add a new candidate", async function () {
    await voting.addCandidate("Dave");
    const candidates = await voting.getAllVotesOfCandidates();
    expect(candidates.length).to.equal(4);
    expect(candidates[3].name).to.equal("Dave");
  });

  it("Should prevent non-owners from adding candidates", async function () {
    await expect(voting.connect(addr1).addCandidate("Candidate 2"))
      .to.be.revertedWith("Only owner can add candidates.");
    });

  it("Should allow a user to vote for a candidate", async function () {
    await voting.connect(addr1).vote(0);
    const candidates = await voting.getAllVotesOfCandidates();
    expect(candidates[0].voteCount.toNumber()).to.equal(1);
  });

  it("Should prevent double voting", async function () {
    await voting.connect(addr1).vote(0);
    await expect(voting.connect(addr1).vote(0)).to.be.revertedWith("Already voted");
  });

  it("Should prevent voting after the deadline", async function () {
    await ethers.provider.send("evm_increaseTime", [61]); // Just over 1 min
    await ethers.provider.send("evm_mine", []);
    await expect(voting.connect(addr1).vote(0)).to.be.revertedWith("Voting period has ended");
  });

  it("Should prevent voting for an invalid candidate index", async function () {
    await expect(voting.connect(addr1).vote(999)).to.be.revertedWith("Invalid candidate index");
  });

  it("Should return all votes correctly", async function () {
    await voting.connect(addr1).vote(0);
    await voting.connect(addr2).vote(1);

    const candidates = await voting.getAllVotesOfCandidates();
    const votes = candidates.map((c) => c.voteCount.toNumber());

    expect(votes[0]).to.equal(1);
    expect(votes[1]).to.equal(1);
    expect(votes[2]).to.equal(0);
});


  it("Should return correct voting status", async function () {
    expect(await voting.getVotingStatus()).to.be.true;
    await ethers.provider.send("evm_increaseTime", [61]); // Increase time past the voting duration
    await ethers.provider.send("evm_mine", []); // Mine a new block to apply the time increase
    expect(await voting.getVotingStatus()).to.be.false;
  });

  it("Should return correct remaining time", async function () {
    const remainingTime = await voting.getRemainingTime();
    expect(remainingTime).to.be.at.most(1 * 60);
  });
});