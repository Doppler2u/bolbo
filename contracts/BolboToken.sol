// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BolboToken is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY = 10_000_000 * 10 ** 18;
    address public miningManager;

    constructor() ERC20("BolboToken", "BOLBO") Ownable(msg.sender) {}

    function setMiningManager(address _miningManager) external onlyOwner {
        miningManager = _miningManager;
    }

    function mint(address to, uint256 amount) external {
        require(msg.sender == miningManager, "Only MiningManager can mint");
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }

    function remainingSupply() external view returns (uint256) {
        return MAX_SUPPLY - totalSupply();
    }
    
    function totalMinted() external view returns (uint256) {
        return totalSupply();
    }
}
