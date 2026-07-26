import hre from "hardhat";

async function main() {
  console.log("Registering Agent on X Layer Testnet...");

  const [deployer] = await hre.ethers.getSigners();
  const agentAddress = deployer.address;
  
  console.log("Using Wallet:", agentAddress);

  // Address of the deployed AgentRegistry from our previous deployment
  const agentRegistryAddress = "0x0FE0B0b93591FE8fF6C69Df2ab2a7273aA9C9Cb5";

  // Get the contract instance
  const AgentRegistry = await hre.ethers.getContractFactory("AgentRegistry");
  const agentRegistry = AgentRegistry.attach(agentRegistryAddress);

  // Register the agent on the blockchain
  console.log("Sending registration transaction...");
  const tx = await agentRegistry.registerAgent(agentAddress);
  
  console.log("Transaction Hash:", tx.hash);
  console.log("Waiting for confirmation...");
  
  await tx.wait();

  // Fetch the newly assigned Agent ID
  const agentInfo = await agentRegistry.getAgent(agentAddress);
  
  console.log("\n====================================");
  console.log("✅ Agent Successfully Registered!");
  console.log("====================================");
  console.log("Agent On-Chain ID :", agentInfo.id.toString());
  console.log("Reputation Score  :", agentInfo.reputationScore.toString());
  console.log("Total Solves      :", agentInfo.totalSolves.toString());
  console.log("Wallet Address    :", agentAddress);
  console.log("====================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
