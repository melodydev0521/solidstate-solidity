const { expect } = require('chai');

const { describeFilter } = require('@solidstate/library/mocha_describe_filter.js');

const describeBehaviorOfDiamondLoupe = function ({ deploy, facetCuts }, skips) {
  const describe = describeFilter(skips);

  describe('::DiamondLoupe', function () {
    let instance;

    before(async function () {
      expect(facetCuts).to.have.lengthOf.at.least(1);
    });

    beforeEach(async function () {
      instance = await ethers.getContractAt('DiamondLoupe', (await deploy()).address);
    });

    // // eslint-disable-next-line mocha/no-setup-in-describe
    // describeBehaviorOfERC165({
    //   deploy: () => instance,
    //   interfaceIds: ['TODO: selector'],
    // }, skips);

    describe('#facets', function () {
      it('returns facet cuts', async function () {
        expect(
          await instance.callStatic['facets()']()
        ).to.deep.include.members(
          facetCuts.map(fc => [fc[0], fc[2]])
        );
      });
    });

    describe('#facetAddresses', function () {
      it('returns facets', async function () {
        expect(
          await instance.callStatic['facetAddresses()']()
        ).to.have.members(
          Array.from(new Set(facetCuts.map(fc => fc[0])))
        );
      });
    });

    describe('#facetFunctionSelectors', function () {
      it('returns selectors for given facet', async function () {
        for (let facet of facetCuts) {
          expect(
            await instance.callStatic['facetFunctionSelectors(address)'](facet[0])
          ).to.have.members(
            facet[2]
          );
        }
      });

      it('returns empty array for unrecognized facet', async function () {
        expect(
          await instance.callStatic['facetFunctionSelectors(address)'](ethers.constants.AddressZero)
        ).to.have.lengthOf(0);
      });
    });

    describe('#facetAddress', function () {
      it('returns facet for given selector', async function () {
        for (let facet of facetCuts) {
          for (let selector of facet[2]) {
            expect(
              await instance.callStatic['facetAddress(bytes4)'](selector)
            ).to.equal(
              facet[0]
            );
          }
        }
      });

      it('returns zero address for unrecognized selector', async function () {
        expect(
          await instance.callStatic['facetAddress(bytes4)']('0x00000000')
        ).to.equal(
          ethers.constants.AddressZero
        );
      });
    });
  });
};

// eslint-disable-next-line mocha/no-exports
module.exports = describeBehaviorOfDiamondLoupe;
