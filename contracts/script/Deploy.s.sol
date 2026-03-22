// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import {Script} from "forge-std/Script.sol";
import {SymbioLend} from "../src/SymbioLend.sol";
import {MockUSDT} from "../src/MockUSDT.sol";

contract Deploy is Script {
    function run() external {
        vm.startBroadcast();
        MockUSDT usdt = new MockUSDT();
        SymbioLend lend = new SymbioLend();
        lend.addToken(address(usdt));
        vm.stopBroadcast();
    }
}
