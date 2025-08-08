const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Monopoly", function () {
  let monopoly;
  let owner;
  let player1;
  let player2;

  beforeEach(async function () {
    [owner, player1, player2] = await ethers.getSigners();
    
    const Monopoly = await ethers.getContractFactory("Monopoly");
    monopoly = await Monopoly.deploy();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await monopoly.owner()).to.equal(owner.address);
    });

    it("Should have correct fee per player", async function () {
      const feePerPlayer = await monopoly.FEE_PER_PLAYER();
      expect(feePerPlayer).to.equal(ethers.parseEther("0.05"));
    });
  });

  describe("Game Creation", function () {
    it("Should start a new game with correct fee", async function () {
      const playerCount = 4;
      const feePerPlayer = ethers.parseEther("0.05");
      const totalFee = feePerPlayer * BigInt(playerCount);

      await expect(monopoly.connect(player1).startNewGame(playerCount, { value: totalFee }))
        .to.emit(monopoly, "GameCreated")
        .withArgs(player1.address, playerCount, totalFee);

      const userFees = await monopoly.gameFees(player1.address);
      expect(userFees).to.equal(totalFee);
    });

    it("Should fail with incorrect fee amount", async function () {
      const playerCount = 3;
      const incorrectFee = ethers.parseEther("0.1"); // Wrong amount

      await expect(
        monopoly.connect(player1).startNewGame(playerCount, { value: incorrectFee })
      ).to.be.revertedWith("Incorrect fee amount");
    });

    it("Should fail with too few players", async function () {
      const playerCount = 1;
      const fee = ethers.parseEther("0.05");

      await expect(
        monopoly.connect(player1).startNewGame(playerCount, { value: fee })
      ).to.be.revertedWith("Player count must be between 2 and 8");
    });

    it("Should fail with too many players", async function () {
      const playerCount = 9;
      const fee = ethers.parseEther("0.45");

      await expect(
        monopoly.connect(player1).startNewGame(playerCount, { value: fee })
      ).to.be.revertedWith("Player count must be between 2 and 8");
    });
  });

  describe("Fee Calculations", function () {
    it("Should calculate correct fee for 2 players", async function () {
      const fee = await monopoly.getGameFee(2);
      expect(fee).to.equal(ethers.parseEther("0.1"));
    });

    it("Should calculate correct fee for 8 players", async function () {
      const fee = await monopoly.getGameFee(8);
      expect(fee).to.equal(ethers.parseEther("0.4"));
    });

    it("Should verify correct fee amount", async function () {
      const playerCount = 5;
      const correctFee = ethers.parseEther("0.25");
      const isCorrect = await monopoly.isCorrectFee(playerCount, correctFee);
      expect(isCorrect).to.be.true;
    });

    it("Should reject incorrect fee amount", async function () {
      const playerCount = 5;
      const incorrectFee = ethers.parseEther("0.2");
      const isCorrect = await monopoly.isCorrectFee(playerCount, incorrectFee);
      expect(isCorrect).to.be.false;
    });
  });

  describe("Fee Withdrawal", function () {
    it("Should allow owner to withdraw fees", async function () {
      // First, create a game to generate fees
      const playerCount = 3;
      const fee = ethers.parseEther("0.15");
      await monopoly.connect(player1).startNewGame(playerCount, { value: fee });

      const initialBalance = await ethers.provider.getBalance(owner.address);
      await monopoly.connect(owner).withdrawFees();
      const finalBalance = await ethers.provider.getBalance(owner.address);

      expect(finalBalance).to.be.gt(initialBalance);
    });

    it("Should prevent non-owner from withdrawing fees", async function () {
      await expect(
        monopoly.connect(player1).withdrawFees()
      ).to.be.revertedWith("Only owner can withdraw fees");
    });
  });

  describe("Multiple Games", function () {
    it("Should track fees from multiple games", async function () {
      // First game
      await monopoly.connect(player1).startNewGame(2, { value: ethers.parseEther("0.1") });
      
      // Second game
      await monopoly.connect(player1).startNewGame(4, { value: ethers.parseEther("0.2") });

      const totalFees = await monopoly.gameFees(player1.address);
      expect(totalFees).to.equal(ethers.parseEther("0.3"));
    });

    it("Should track fees from different players", async function () {
      await monopoly.connect(player1).startNewGame(2, { value: ethers.parseEther("0.1") });
      await monopoly.connect(player2).startNewGame(3, { value: ethers.parseEther("0.15") });

      const player1Fees = await monopoly.gameFees(player1.address);
      const player2Fees = await monopoly.gameFees(player2.address);

      expect(player1Fees).to.equal(ethers.parseEther("0.1"));
      expect(player2Fees).to.equal(ethers.parseEther("0.15"));
    });
  });
}); 