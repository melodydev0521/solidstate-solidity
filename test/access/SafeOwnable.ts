import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { describeBehaviorOfSafeOwnable } from '@solidstate/spec';
import {
  SafeOwnableMock,
  SafeOwnableMock__factory,
} from '@solidstate/typechain-types';
import { ethers } from 'hardhat';

describe('SafeOwnable', function () {
  let owner: SignerWithAddress;
  let nomineeOwner: SignerWithAddress;
  let nonOwner: SignerWithAddress;
  let instance: SafeOwnableMock;

  before(async function () {
    [owner, nomineeOwner, nonOwner] = await ethers.getSigners();
  });

  beforeEach(async function () {
    instance = await new SafeOwnableMock__factory(owner).deploy(owner.address);
  });

  describeBehaviorOfSafeOwnable(async () => instance, {
    getOwner: async () => owner,
    getNomineeOwner: async () => nomineeOwner,
    getNonOwner: async () => nonOwner,
  });
});
