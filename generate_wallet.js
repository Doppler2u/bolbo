import { ethers } from "ethers";
import fs from "fs";

const wallet = ethers.Wallet.createRandom();

const envContent = `PRIVATE_KEY=${wallet.privateKey}\n`;
fs.writeFileSync(".env", envContent);

console.log("New Wallet Created Successfully!");
console.log("Address:", wallet.address);
console.log("Private Key saved to .env file.");
