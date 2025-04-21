// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/access/Ownable.sol";
contract GuardDogRegistry is Ownable {
    constructor() Ownable(msg.sender) {}
    event AuditRequested(address indexed user, address indexed target, uint256 timestamp);
    event AuditCompleted(address indexed target, uint8 score, uint256 timestamp);
    function requestAudit(address target) external {
        emit AuditRequested(msg.sender, target, block.timestamp);
    }
    function completeAudit(address target, uint8 score) external onlyOwner {
        emit AuditCompleted(target, score, block.timestamp);
    }
}
