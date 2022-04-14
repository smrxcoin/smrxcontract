const { toBN, toWei } = require('web3-utils');
const { expectEvent, expectRevert } = require('@openzeppelin/test-helpers');

const wSMRXToken = artifacts.require('wSMRXToken');
const wSMRXBridge = artifacts.require('wSMRXBridge');

const bridgeTax = toBN(40000000000000000); // 0.04 BNB
const transferAmount = toWei(toBN(10000));
const otherChainTx = '0x0000000000000000000000000000000000000000000000000000000000000000';

contract('wSMRXBridge', accounts => {
  beforeEach(async () => {
    wToken = await wSMRXToken.deployed();
    wBridge = await wSMRXBridge.deployed();
    deployerAddress = accounts[0];
    userAddress = accounts[1];
  });

  describe('Ownable', async () => {
    it('Check bridge owner', async () => {
      const owner = await wBridge.owner();
      assert.equal(owner, deployerAddress, `Bridge owner isn't ${deployerAddress}`);
    });
  });

  describe('Taxable', async () => {
    it('Check bridge tax', async () => {
      const tax = await wBridge.tax();
      assert(tax.eq(bridgeTax), `Bridge tax isn't ${bridgeTax}`);
    });

    it('Check bridge deployer tax', async () => {
      const deployerTax = await wBridge.taxOf(deployerAddress, { from: deployerAddress });
      assert(deployerTax.eq(toBN(0)), `Bridge deployer tax isn't ${0}`);
    });

    it('Check bridge pay tax', async () => {
      const receipt = await wBridge.payTax({ from: deployerAddress, value: bridgeTax });
      expectEvent(receipt, 'TaxDeposit', {
        from: deployerAddress,
        value: bridgeTax,
      });
    });

    it('Check bridge change tax', async () => {
      const receipt = await wBridge.changeTax(bridgeTax, { from: deployerAddress });
      expectEvent(receipt, 'TaxChanged', {
        previousTax: bridgeTax,
        newTax: bridgeTax,
      });
    });
  });

  describe('Bridge', async () => {
    it('Check bridge token', async () => {
      const tokenAddress = await wBridge.token();
      assert.equal(tokenAddress, wToken.address, `Bridge token isn't ${wToken.address}`);
    });

    it('Check bridge TX processed', async () => {
      const hasTxProcessed = await wBridge.hasTxProcessed(otherChainTx);
      assert(!hasTxProcessed, `Bridge TX processed isn't ${false}`);
    });

    it('Check bridge deposit without tax', async () => {
      await expectRevert(wBridge.deposit(transferAmount, { from: userAddress }), 'Taxable: No tax paid');
    });

    it('Check bridge deposit without allowance', async () => {
      await expectRevert(
        wBridge.deposit(transferAmount, { from: userAddress, value: bridgeTax }),
        'ERC20: insufficient allowance',
      );
    });

    it('Check bridge deposit', async () => {
      await wToken.transfer(userAddress, transferAmount, { from: deployerAddress });
      await wToken.approve(wBridge.address, transferAmount, { from: userAddress });
      const receipt = await wBridge.deposit(transferAmount, { from: userAddress, value: bridgeTax });
      expectEvent(receipt, 'Deposit', {
        from: userAddress,
        value: transferAmount,
      });
    });

    it('Check bridge withdraw by deployer', async () => {
      await wToken.transfer(userAddress, transferAmount, { from: deployerAddress });
      await wToken.approve(wBridge.address, transferAmount, { from: userAddress });
      await wBridge.deposit(transferAmount, { from: userAddress, value: bridgeTax });

      const receipt = await wBridge.withdraw(userAddress, transferAmount, otherChainTx, { from: deployerAddress });
      expectEvent(receipt, 'Withdraw', {
        to: userAddress,
        value: transferAmount,
        otherChainTx: otherChainTx,
      });

      await expectRevert(
        wBridge.withdraw(userAddress, transferAmount, otherChainTx, { from: deployerAddress }),
        'Bridge: Transfer already processed',
      );
    });

    it('Check bridge withdraw by user', async () => {
      await expectRevert(
        wBridge.withdraw(userAddress, transferAmount, otherChainTx, { from: userAddress }),
        'Ownable: caller is not the owner',
      );
    });

    it('Check bridge renounce token ownership by user', async () => {
      await expectRevert(wBridge.renounceTokenOwnership({ from: userAddress }), 'Ownable: caller is not the owner');
    });

    it('Check bridge renounce token ownership by deployer', async () => {
      const receipt = await wBridge.renounceTokenOwnership({ from: deployerAddress });
      expectEvent(receipt, 'OwnershipTransferred', {
        previousOwner: wBridge.address,
        newOwner: deployerAddress,
      });
    });
  });
});
