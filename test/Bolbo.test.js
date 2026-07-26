import { expect } from "chai";
import hre from "hardhat";

describe("Bolbo Protocol", function () {
  let token, challengeRegistry, difficultyController, rewardDistributor, agentRegistry, miningManager, usdtMock;
  let owner, agent;

  before(async function () {
    [owner, agent] = await hre.ethers.getSigners();
  });

  it("Should deploy all contracts", async function () {
    const Token = await hre.ethers.getContractFactory("BolboToken");
    token = await Token.deploy();

    const ChallengeRegistry = await hre.ethers.getContractFactory("ChallengeRegistry");
    challengeRegistry = await ChallengeRegistry.deploy();

    const DifficultyController = await hre.ethers.getContractFactory("DifficultyController");
    difficultyController = await DifficultyController.deploy();

    const RewardDistributor = await hre.ethers.getContractFactory("RewardDistributor");
    rewardDistributor = await RewardDistributor.deploy();

    const AgentRegistry = await hre.ethers.getContractFactory("AgentRegistry");
    agentRegistry = await AgentRegistry.deploy();

    const MockUSDT = await hre.ethers.getContractFactory("MockUSDT");
    usdtMock = await MockUSDT.deploy();

    const MiningManager = await hre.ethers.getContractFactory("MiningManager");
    miningManager = await MiningManager.deploy(
      await token.getAddress(),
      await challengeRegistry.getAddress(),
      await difficultyController.getAddress(),
      await rewardDistributor.getAddress(),
      await agentRegistry.getAddress(),
      await usdtMock.getAddress()
    );

    // Set MiningManager in all contracts
    await token.setMiningManager(await miningManager.getAddress());
    await challengeRegistry.setMiningManager(await miningManager.getAddress());
    await difficultyController.setMiningManager(await miningManager.getAddress());
    await rewardDistributor.setMiningManager(await miningManager.getAddress());
    await agentRegistry.setMiningManager(await miningManager.getAddress());
  });

  it("Should generate first challenge", async function () {
    await miningManager.generateNextChallenge();
    const activeChallengeId = await miningManager.currentActiveChallengeId();
    expect(activeChallengeId).to.equal(0n);
    const challenge = await challengeRegistry.getChallenge(0n);
    expect(challenge.challengeType).to.equal(0n);
  });

  it("Should allow agent to submit solution and mint token", async function () {
    // Give agent some USDT to pay fee
    const fee = await miningManager.SUBMISSION_FEE();
    await usdtMock.mint(agent.address, fee);
    await usdtMock.connect(agent).approve(await miningManager.getAddress(), fee);

    // Agent submits solution
    const tx = await miningManager.connect(agent).submitSolution(0n, "RRDRD", "0x1234");
    await tx.wait();

    // Check balances and status
    const agentBalance = await token.balanceOf(agent.address);
    const expectedReward = await rewardDistributor.INITIAL_REWARD();
    expect(agentBalance).to.equal(expectedReward);

    const challenge = await challengeRegistry.getChallenge(0n);
    expect(challenge.solved).to.be.true;
    expect(challenge.solver).to.equal(agent.address);
  });
});
