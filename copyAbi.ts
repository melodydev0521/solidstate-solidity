import fs from 'fs';
import rimraf from 'rimraf';

rimraf.sync('./abiTypechain');

if (!fs.existsSync('./abiTypechain')) {
  fs.mkdirSync('./abiTypechain');
}

////////////
// Access //
////////////

fs.copyFileSync(
  './artifacts/contracts/access/Ownable.sol/Ownable.json',
  './abi/Ownable.json',
);

fs.copyFileSync(
  './artifacts/contracts/access/SafeOwnable.sol/SafeOwnable.json',
  './abi/SafeOwnable.json',
);

/////////////
// Factory //
/////////////

fs.copyFileSync(
  './artifacts/contracts/factory/CloneFactory.sol/CloneFactory.json',
  './abi/CloneFactory.json',
);

fs.copyFileSync(
  './artifacts/contracts/factory/Factory.sol/Factory.json',
  './abi/Factory.json',
);

fs.copyFileSync(
  './artifacts/contracts/factory/MetamorphicFactory.sol/MetamorphicFactory.json',
  './abi/MetamorphicFactory.json',
);

fs.copyFileSync(
  './artifacts/contracts/factory/MinimalProxyFactory.sol/MinimalProxyFactory.json',
  './abi/MinimalProxyFactory.json',
);

///////////////
// Signature //
///////////////

fs.copyFileSync(
  './artifacts/contracts/signature/ERC1271Base.sol/ERC1271Base.json',
  './abi/ERC1271Base.json',
);

fs.copyFileSync(
  './artifacts/contracts/signature/ERC1271Ownable.sol/ERC1271Ownable.json',
  './abi/ERC1271Ownable.json',
);

fs.copyFileSync(
  './artifacts/contracts/signature/ERC1271Stored.sol/ERC1271Stored.json',
  './abi/ERC1271Stored.json',
);

///////////
// Utils //
///////////

fs.copyFileSync(
  './artifacts/contracts/utils/ReentrancyGuard.sol/ReentrancyGuard.json',
  './abi/ReentrancyGuard.json',
);

rimraf.sync('./typechain');
