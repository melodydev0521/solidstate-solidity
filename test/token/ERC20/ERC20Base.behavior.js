const { expect } = require('chai');

const { describeFilter } = require('@solidstate/library/mocha_describe_filter.js');

const describeBehaviorOfERC20Base = function ({ deploy, supply, mint, burn }, skips) {
  const describe = describeFilter(skips);

  describe('::ERC20Base', function () {
    let holder, spender, receiver;
    let instance;

    before(async function () {
      [holder, spender, receiver] = await ethers.getSigners();
    });

    beforeEach(async function () {
      instance = await ethers.getContractAt('ERC20Base', (await deploy()).address);
    });

    describe('#totalSupply', function () {
      it('returns the total supply of tokens', async function () {
        expect(
          await instance.callStatic['totalSupply()']()
        ).to.equal(supply);
        // TODO: test delta
      });
    });

    describe('#balanceOf', function () {
      it('returns the token balance of given address', async function () {
        expect(
          await instance.callStatic['balanceOf(address)'](ethers.constants.AddressZero)
        ).to.equal(ethers.constants.Zero);
        // TODO: test delta
      });
    });

    describe('#allowance', function () {
      it('returns the allowance given holder has granted to given spender', async function () {
        expect(
          await instance.callStatic['allowance(address,address)'](holder.address, spender.address)
        ).to.equal(ethers.constants.Zero);

        let amount = ethers.constants.Two;
        await instance.connect(holder)['approve(address,uint256)'](spender.address, amount);

        expect(
          await instance.callStatic['allowance(address,address)'](holder.address, spender.address)
        ).to.equal(amount);
      });
    });

    describe('#transfer', function () {
      it('transfers amount from a to b', async function(){
        const amount = ethers.constants.Two;
        await mint(spender.address, amount);
        expect(await instance.callStatic.balanceOf(holder.address)).to.equal(ethers.constants.Zero);
        expect(await instance.callStatic.balanceOf(spender.address)).to.equal(amount);

        await instance.connect(spender).transfer(holder.address, amount);
        expect(await instance.callStatic.balanceOf(holder.address)).to.equal(amount);
        expect(await instance.callStatic.balanceOf(spender.address)).to.equal(ethers.constants.Zero);
      });
    });

    describe('#transferFrom', function () {
      it('transfers amount from spender on behalf of sender', async function(){
        const amount = ethers.constants.Two;
        await mint(holder.address, amount);
        expect(await instance.callStatic.balanceOf(spender.address)).to.equal(ethers.constants.Zero);
        expect(await instance.callStatic.balanceOf(receiver.address)).to.equal(ethers.constants.Zero);
        expect(await instance.callStatic.balanceOf(holder.address)).to.equal(amount);

        await instance.connect(holder).approve(spender.address, amount);
        await instance.connect(spender).transferFrom(holder.address, receiver.address, amount);
        expect(await instance.callStatic.balanceOf(holder.address)).to.equal(ethers.constants.Zero);
        expect(await instance.callStatic.balanceOf(spender.address)).to.equal(ethers.constants.Zero);
        expect(await instance.callStatic.balanceOf(receiver.address)).to.equal(amount);

        await burn(receiver.address, amount);
      });

      describe('reverts if', function (){
        it('spender not approved', async function(){
          const amount = ethers.constants.Two;
          await mint(holder.address, amount);
          expect(await instance.callStatic.balanceOf(spender.address)).to.equal(ethers.constants.Zero);
          expect(await instance.callStatic.balanceOf(receiver.address)).to.equal(ethers.constants.Zero);
          expect(await instance.callStatic.balanceOf(holder.address)).to.equal(amount);
  
          await expect(instance.connect(spender).transferFrom(holder.address, receiver.address, amount)).to.be.reverted;
        })
      })
    });

    describe('#approve', function () {
      it('enables given spender to spend tokens on behalf of sender', async function () {
        let amount = ethers.constants.Two;
        await instance.connect(holder)['approve(address,uint256)'](spender.address, amount);

        expect(
          await instance.callStatic['allowance(address,address)'](holder.address, spender.address)
        ).to.equal(amount);

        // TODO: test case is no different from #allowance test; tested further by #transferFrom tests
      });

      it('emits Approval event', async function () {
        let amount = ethers.constants.Two;

        await expect(
          instance.connect(holder)['approve(address,uint256)'](spender.address, amount)
        ).to.emit(
          instance, 'Approval'
        ).withArgs(
          holder.address, spender.address, amount
        );
      });
    });
  });
};

// eslint-disable-next-line mocha/no-exports
module.exports = describeBehaviorOfERC20Base;
