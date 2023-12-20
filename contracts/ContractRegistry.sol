// contracts/ContractRegistry.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract ContractRegistry is Ownable {
    // Store mapping of Contract Name to deployed Address
    mapping(string => address) public registered;
    uint256 public totalRegistered;

    // Emitted when a box is registered
    event ContractRegistered(string indexed contractName);

    // Constructor
    constructor() Ownable(msg.sender) {
        totalRegistered = 0;
    }
    
    function register(string calldata name, address contractAddress) public onlyOwner {
        require( registered[name] == address(0), "Already registered");
        
        registered[name] = contractAddress;
        totalRegistered++;

        emit ContractRegistered(name);
    }

    // Reads the last stored value
    function lookupAddress(string calldata name) public view returns (address) {
        return registered[name];
    }
}
