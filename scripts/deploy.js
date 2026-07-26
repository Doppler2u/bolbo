import hre from "hardhat";

async function main() {
  console.log("Starting deployment to X Layer Testnet...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  
  // 1. Deploy BolboToken
  const token = await hre.ethers.deployContract("BolboToken");
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("BolboToken deployed to:", tokenAddress);

  // 2. Deploy ChallengeRegistry
  const challengeRegistry = await hre.ethers.deployContract("ChallengeRegistry");
  await challengeRegistry.waitForDeployment();
  const challengeRegistryAddress = await challengeRegistry.getAddress();
  console.log("ChallengeRegistry deployed to:", challengeRegistryAddress);

  // 3. Deploy DifficultyController
  const difficultyController = await hre.ethers.deployContract("DifficultyController");
  await difficultyController.waitForDeployment();
  const difficultyControllerAddress = await difficultyController.getAddress();
  console.log("DifficultyController deployed to:", difficultyControllerAddress);

  // 4. Deploy RewardDistributor
  const rewardDistributor = await hre.ethers.deployContract("RewardDistributor");
  await rewardDistributor.waitForDeployment();
  const rewardDistributorAddress = await rewardDistributor.getAddress();
  console.log("RewardDistributor deployed to:", rewardDistributorAddress);

  // 5. Deploy AgentRegistry
  const agentRegistry = await hre.ethers.deployContract("AgentRegistry");
  await agentRegistry.waitForDeployment();
  const agentRegistryAddress = await agentRegistry.getAddress();
  console.log("AgentRegistry deployed to:", agentRegistryAddress);

  // 6. Use Official OKX Testnet USDT
  const officialUSDTAddress = "0x9e29b3aada05bf2d2c827af80bd28dc0b9b4fb0c";
  console.log("Using Official USDT at:", officialUSDTAddress);

  // 7. Deploy MiningManager
  const miningManager = await hre.ethers.deployContract("MiningManager", [
    tokenAddress,
    challengeRegistryAddress,
    difficultyControllerAddress,
    rewardDistributorAddress,
    agentRegistryAddress,
    officialUSDTAddress
  ]);
  await miningManager.waitForDeployment();
  const miningManagerAddress = await miningManager.getAddress();
  console.log("MiningManager deployed to:", miningManagerAddress);

  // 8. Set addresses in contracts
  console.log("Setting MiningManager permissions in all contracts...");
  await (await token.setMiningManager(miningManagerAddress)).wait();
  await (await challengeRegistry.setMiningManager(miningManagerAddress)).wait();
  await (await difficultyController.setMiningManager(miningManagerAddress)).wait();
  await (await rewardDistributor.setMiningManager(miningManagerAddress)).wait();
  await (await agentRegistry.setMiningManager(miningManagerAddress)).wait();

  // 9. Generate first challenge
  console.log("Generating first challenge...");
  await (await miningManager.generateNextChallenge()).wait();

  console.log("Deployment complete! First challenge generated.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
