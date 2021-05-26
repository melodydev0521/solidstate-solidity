import { expect } from 'chai';
import { ethers } from 'hardhat';
import { FactoryMock, FactoryMock__factory } from '../../typechain';
import { describeBehaviorOfFactory } from '@solidstate/spec/factory/Factory.behavior';

const deploy = async () => {
  const [deployer] = await ethers.getSigners();
  return new FactoryMock__factory(deployer).deploy();
};

describe('Factory', function () {
  let instance: FactoryMock;

  beforeEach(async function () {
    instance = await deploy();
  });

  describeBehaviorOfFactory({ deploy }, []);

  describe('__internal', function () {
    describe('#_deploy', function () {
      describe('(bytes)', function () {
        it('deploys bytecode and returns deployment address', async function () {
          const initCode = instance.deployTransaction.data;

          const address = await instance.callStatic['deploy(bytes)'](initCode);
          expect(address).to.be.properAddress;

          await instance['deploy(bytes)'](initCode);

          expect(await ethers.provider.getCode(address)).to.equal(
            await ethers.provider.getCode(instance.address),
          );
        });
      });

      describe('(bytes,bytes32)', function () {
        it('deploys bytecode and returns deployment address', async function () {
          const initCode = await instance.deployTransaction.data;
          const initCodeHash = ethers.utils.keccak256(initCode);
          const salt = ethers.utils.randomBytes(32);

          const address = await instance.callStatic['deploy(bytes,bytes32)'](
            initCode,
            salt,
          );
          expect(address).to.equal(
            await instance.calculateDeploymentAddress(initCodeHash, salt),
          );

          await instance['deploy(bytes,bytes32)'](initCode, salt);

          expect(await ethers.provider.getCode(address)).to.equal(
            await ethers.provider.getCode(instance.address),
          );
        });

        describe('reverts if', function () {
          it('salt has already been used', async function () {
            const initCode = instance.deployTransaction.data;
            const salt = ethers.utils.randomBytes(32);

            await instance['deploy(bytes,bytes32)'](initCode, salt);

            await expect(
              instance['deploy(bytes,bytes32)'](initCode, salt),
            ).to.be.revertedWith('Factory: failed deployment');
          });
        });
      });
    });

    describe('#_calculateDeploymentAddress', function () {
      it('returns address of not-yet-deployed contract', async function () {
        const initCode = instance.deployTransaction.data;
        const initCodeHash = ethers.utils.keccak256(initCode);
        const salt = ethers.utils.randomBytes(32);

        expect(
          await instance.callStatic.calculateDeploymentAddress(
            initCodeHash,
            salt,
          ),
        ).to.equal(
          ethers.utils.getCreate2Address(instance.address, salt, initCodeHash),
        );
      });
    });
  });
});
