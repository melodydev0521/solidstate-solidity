// SPDX-License-Identifier: MIT

pragma solidity ^0.7.0;

import './LibOwnable.sol';

abstract contract OwnableStorage {
  using LibOwnable for LibOwnable.Layout;

  modifier onlyOwner {
    require(
      msg.sender == LibOwnable.layout().owner,
      'Ownable: sender must be owner'
    );
    _;
  }
}
