// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import '../../access/OwnableStorage.sol';
import './ManagedProxy.sol';

/**
 * @title Proxy with implementation controlled by ERC171 owner
 */
 abstract contract ManagedProxyOwnable is ManagedProxy {
   /**
    * @inheritdoc ManagedProxy
    */
   function _getManager () override internal view returns (address) {
     return OwnableStorage.layout().owner;
   }
 }