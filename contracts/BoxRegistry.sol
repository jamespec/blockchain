// contracts/BoxRegistry.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract BoxRegistry is Ownable {
    // Store mapping of Box Name to deployed Address
    // bytes32 will hold a box name of up to 32 characters
    mapping(string => address) public registeredBoxes;
    uint256 public totalRegisteredBoxes;

    // Emitted when a box is registered
    event BoxRegistered(string indexed boxName);

    // Constructor
    constructor() Ownable(msg.sender) {
        totalRegisteredBoxes = 0;
    }
    
    function registerBox(string calldata boxName, address contractAddress) public onlyOwner {
        require( registeredBoxes[boxName] == address(0), "Already registered");
        
        registeredBoxes[boxName] = contractAddress;
        totalRegisteredBoxes++;

        emit BoxRegistered(boxName);
    }

    // Reads the last stored value
    function boxAddress(string calldata boxName) public view returns (address) {
        return registeredBoxes[boxName];
    }

}
