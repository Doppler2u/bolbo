import requests
import time
import os
import hashlib
from web3 import Web3
from eth_account import Account

API_BASE_URL = os.getenv("API_BASE_URL", "https://bolbo-gules.vercel.app")
RPC_URL = "https://xlayertestrpc.okx.com"
w3 = Web3(Web3.HTTPProvider(RPC_URL))

# Load Agent's Private Key
PRIVATE_KEY = os.getenv("AGENT_PRIVATE_KEY", "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef") # Mock default
account = Account.from_key(PRIVATE_KEY)
AGENT_WALLET = account.address

# Contract ABIs & Addresses
AGENT_REGISTRY = "0x29E7D46456dB21962e2205de9aC7d4097F47Cdc1"
MINING_MANAGER = "0xC0784Bd84BBad8053aB21dB97562ba1345a07132"
MOCK_USDT = "0x9e29b3aada05bf2d2c827af80bd28dc0b9b4fb0c"

abi_mining_manager = [
    {"inputs":[],"name":"currentActiveChallengeId","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"uint256","name":"challengeId","type":"uint256"},{"internalType":"bytes32","name":"commitHash","type":"bytes32"}],"name":"commitSolution","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"internalType":"uint256","name":"challengeId","type":"uint256"},{"internalType":"string","name":"solution","type":"string"},{"internalType":"bytes","name":"proof","type":"bytes"}],"name":"revealSolution","outputs":[],"stateMutability":"nonpayable","type":"function"}
]
abi_erc20 = [
    {"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}
]
contract_mining = w3.eth.contract(address=w3.to_checksum_address(MINING_MANAGER), abi=abi_mining_manager)
contract_usdt = w3.eth.contract(address=w3.to_checksum_address(MOCK_USDT), abi=abi_erc20)

def sign_and_build_tx(func_call, value=0):
    nonce = w3.eth.get_transaction_count(AGENT_WALLET)
    tx = func_call.build_transaction({
        'chainId': w3.eth.chain_id, # X Layer Testnet Chain ID
        'gas': 2000000,
        'gasPrice': w3.eth.gas_price,
        'nonce': nonce,
        'value': value
    })
    signed_tx = w3.eth.account.sign_transaction(tx, private_key=PRIVATE_KEY)
    return signed_tx.raw_transaction.hex()

def approve_usdt():
    print("Checking USDT allowance for MiningManager...")
    
    # Check allowance
    allowance = contract_usdt.functions.allowance(AGENT_WALLET, w3.to_checksum_address(MINING_MANAGER)).call()
    fee_amount = 1000 * 10**6 # Approve a large amount so we don't have to keep approving
    
    if allowance < 1 * 10**6:
        print("Approving MiningManager to spend USDT...")
        approve_call = contract_usdt.functions.approve(w3.to_checksum_address(MINING_MANAGER), fee_amount)
        signed_tx = sign_and_build_tx(approve_call)
        try:
            tx_hash = w3.eth.send_raw_transaction(signed_tx)
            print(f"Sent Approval TX: {tx_hash.hex()}")
            w3.eth.wait_for_transaction_receipt(tx_hash)
            print("Approval confirmed!")
        except Exception as e:
            print(f"Approval failed: {e}")
    else:
        print("USDT Allowance is sufficient.")

def fetch_current_challenge():
    print("Fetching current challenge...")
    try:
        response = requests.get(f"{API_BASE_URL}/challenge/current")
        return response.json()
    except Exception as e:
        print(f"ASP API down. Fallback to Web3 RPC {RPC_URL}...")
        # Fallback logic to read direct from ChallengeRegistry would go here
        return {"id": 42, "type": 0}

def solve_challenge(challenge):
    print(f"Solving challenge ID: {challenge.get('id')}, Type: {challenge.get('type')}")
    time.sleep(2) # simulate compute
    solution = "RRDRDRDRRDRDRDRRDRDRDRRDRDRDR"
    proof = "0xMockZKProof"
    print(f"Found solution: {solution}")
    return solution, proof

def commit_solution(challenge_id, solution):
    print("Hashing solution for MEV Protection (Commit)...")
    # Must use keccak256 to match solidity abi.encodePacked
    commit_hash_bytes = Web3.solidity_keccak(['string', 'address'], [solution, AGENT_WALLET])
    
    # Build and sign Web3 transaction locally
    func_call = contract_mining.functions.commitSolution(challenge_id, commit_hash_bytes)
    signed_tx_hex = sign_and_build_tx(func_call)
    
    payload = {
        "signedTx": signed_tx_hex
    }
    response = requests.post(f"{API_BASE_URL}/mining/commit", json=payload)
    return response.json()

def reveal_solution(challenge_id, solution, proof):
    print("Submitting actual solution (Reveal) and paying x402 fee...")
    
    # Build and sign Web3 transaction locally
    func_call = contract_mining.functions.revealSolution(challenge_id, solution, proof.encode('utf-8'))
    signed_tx_hex = sign_and_build_tx(func_call)
    
    payload = {
        "signedTx": signed_tx_hex
    }
    headers = {"X-PAYMENT": "mock_x402_proof_001_usdt0"}
    response = requests.post(f"{API_BASE_URL}/mining/reveal", json=payload, headers=headers)
    return response.json()

def run_miner():
    print(f"Web3 Fallback Connected: {w3.is_connected()}")
    
    # Pre-Flight Check: Verify Testnet OKB Balance for Gas
    try:
        balance_wei = w3.eth.get_balance(AGENT_WALLET)
        balance_okb = w3.from_wei(balance_wei, 'ether')
        print(f"Agent Wallet Balance: {balance_okb} OKB")
        
        if balance_okb < 0.0001:
            print("\n" + "="*60)
            print("⚠️  WARNING: INSUFFICIENT TESTNET OKB ⚠️")
            print("Your agent needs at least 0.0001 OKB for gas fees.")
            print("Please claim free Testnet OKB from the official OKX Faucet:")
            print("👉 https://www.okx.com/xlayer/faucet")
            print("="*60 + "\n")
    except Exception as e:
        print(f"Could not fetch wallet balance: {e}")

    approve_usdt()

    while True:
        try:
            print("Fetching current challenge...")
            challenge_id = contract_mining.functions.currentActiveChallengeId().call()
            print(f"Solving challenge ID: {challenge_id}")          
            solution, proof = solve_challenge({"id": challenge_id})
            
            # Step 1: Commit
            commit_res = commit_solution(challenge_id, solution)
            print(f"Commit Response: {commit_res.get('message')}")
            
            time.sleep(1) # wait 1 block
            
            # Step 2: Reveal
            result = reveal_solution(challenge_id, solution, proof)
            
            if result.get('success'):
                print(f"Successfully mined! Reward: {result.get('reward')} TxHash: {result.get('txHash')}")
            else:
                print(f"Failed to mine: {result.get('error')}")
                
        except Exception as e:
            print(f"Error during mining loop: {e}")
            
        print("Waiting for next cycle...")
        time.sleep(5)

if __name__ == "__main__":
    print("Starting Miner Agent...")
    run_miner()
