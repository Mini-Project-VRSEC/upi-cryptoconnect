// smart-contracts/contracts/UPICryptoConnect.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract UPICryptoConnect is Ownable, ReentrancyGuard {
    // Events
    event Deposit(address indexed user, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);
    event PaymentSent(address indexed from, address indexed to, uint256 amount, string memo);
    
    // User balances mapping
    mapping(address => uint256) private balances;
    
    // Transaction structure
    struct Transaction {
        address from;
        address to;
        uint256 amount;
        uint256 timestamp;
        string memo;
    }
    
    Transaction[] public transactions;
    
    // Deposit funds
    function deposit() public payable {
        require(msg.value > 0, "Deposit amount must be greater than zero");
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }
    
    // Get account balance
    function getBalance() public view returns (uint256) {
        return balances[msg.sender];
    }
    
    // Send payment
    function sendPayment(address payable recipient, uint256 amount, string memory memo) public nonReentrant {
        require(recipient != address(0), "Invalid recipient address");
        require(amount > 0, "Payment amount must be greater than zero");
        require(balances[msg.sender] >= amount, "Insufficient balance");
        
        balances[msg.sender] -= amount;
        balances[recipient] += amount;
        
        transactions.push(Transaction({
            from: msg.sender,
            to: recipient,
            amount: amount,
            timestamp: block.timestamp,
            memo: memo
        }));
        
        emit PaymentSent(msg.sender, recipient, amount, memo);
    }
    
    // Withdraw funds
    function withdraw(uint256 amount) public nonReentrant {
        require(amount > 0, "Withdrawal amount must be greater than zero");
        require(balances[msg.sender] >= amount, "Insufficient balance");
        
        balances[msg.sender] -= amount;
        
        (bool sent, ) = payable(msg.sender).call{value: amount}("");
        require(sent, "Failed to send Ether");
        
        emit Withdrawal(msg.sender, amount);
    }
    
    // Get transaction count
    function getTransactionCount() public view returns (uint256) {
        return transactions.length;
    }
    
    // Get transaction details by index
    function getTransaction(uint256 index) public view returns (
        address from,
        address to,
        uint256 amount,
        uint256 timestamp,
        string memory memo
    ) {
        require(index < transactions.length, "Transaction does not exist");
        Transaction storage txn = transactions[index];
        return (txn.from, txn.to, txn.amount, txn.timestamp, txn.memo);
    }
}