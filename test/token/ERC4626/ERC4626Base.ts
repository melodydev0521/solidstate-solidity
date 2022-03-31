import {
  ERC20Mock,
  ERC20Mock__factory,
  ERC4626BaseMock,
  ERC4626BaseMock__factory,
} from '../../../typechain';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import {
  describeBehaviorOfCloneFactory,
  describeBehaviorOfERC4626Base,
} from '@solidstate/spec';
import { expect } from 'chai';
import { BigNumber } from 'ethers';
import { ethers } from 'hardhat';

describe('ERC4626Base', () => {
  let deployer: SignerWithAddress;
  let depositor: SignerWithAddress;
  let instance: ERC4626BaseMock;
  let assetInstance: ERC20Mock;

  before(async () => {
    [deployer, depositor] = await ethers.getSigners();
  });

  beforeEach(async () => {
    assetInstance = await new ERC20Mock__factory(deployer).deploy(
      '',
      '',
      0,
      ethers.constants.Zero,
    );

    instance = await new ERC4626BaseMock__factory(deployer).deploy(
      assetInstance.address,
    );
  });

  describeBehaviorOfERC4626Base({
    deploy: async () => instance as any,
    getAsset: async () => assetInstance,
    supply: ethers.constants.Zero,
    mint: (recipient: string, amount: BigNumber) =>
      instance.__mint(recipient, amount),
    burn: (recipient: string, amount: BigNumber) =>
      instance.__burn(recipient, amount),
  });

  describe('__internal', () => {
    describe('#_deposit(uint256,address)', () => {
      it('transfers assets from caller', async () => {
        const assetAmount = BigNumber.from('10');

        await instance.__mint(deployer.address, assetAmount);
        await assetInstance.__mint(depositor.address, assetAmount);
        await assetInstance
          .connect(depositor)
          .approve(instance.address, assetAmount);

        expect(() =>
          instance.connect(depositor).deposit(assetAmount, depositor.address),
        ).to.changeTokenBalances(
          assetInstance,
          [depositor, instance],
          [assetAmount.mul(ethers.constants.NegativeOne), assetAmount],
        );
      });

      it('mints shares for receiver', async () => {
        const assetAmount = BigNumber.from('10');

        await instance.__mint(deployer.address, assetAmount);
        await assetInstance.__mint(depositor.address, assetAmount);
        await assetInstance
          .connect(depositor)
          .approve(instance.address, assetAmount);

        const shareAmount = await instance.callStatic.previewDeposit(
          assetAmount,
        );

        expect(() =>
          instance.connect(depositor).deposit(assetAmount, depositor.address),
        ).to.changeTokenBalance(instance, depositor, shareAmount);
      });

      it('emits Deposit event', async () => {
        const assetAmount = BigNumber.from('10');

        await instance.__mint(deployer.address, assetAmount);
        await assetInstance.__mint(depositor.address, assetAmount);
        await assetInstance
          .connect(depositor)
          .approve(instance.address, assetAmount);

        const shareAmount = await instance.callStatic.previewDeposit(
          assetAmount,
        );

        expect(
          await instance
            .connect(depositor)
            .deposit(assetAmount, depositor.address),
        )
          .to.emit(instance, 'Deposit')
          .withArgs(
            depositor.address,
            depositor.address,
            assetAmount,
            shareAmount,
          );
      });

      it('calls the _afterDeposit hook', async () => {
        const assetAmount = BigNumber.from('10');

        await instance.__mint(deployer.address, assetAmount);
        await assetInstance.__mint(depositor.address, assetAmount);
        await assetInstance
          .connect(depositor)
          .approve(instance.address, assetAmount);

        const shareAmount = await instance.callStatic.previewDeposit(
          assetAmount,
        );

        expect(
          await instance
            .connect(depositor)
            .deposit(assetAmount, depositor.address),
        )
          .to.emit(instance, 'AfterDepositCheck')
          .withArgs(depositor.address, assetAmount, shareAmount);
      });

      describe('reverts if', () => {
        it('assetAmount input is too large', async () => {
          await expect(
            instance.deposit(ethers.constants.MaxUint256, deployer.address),
          ).to.be.revertedWith('ERC4626: maximum amount exceeded');
        });
      });
    });
  });
});
