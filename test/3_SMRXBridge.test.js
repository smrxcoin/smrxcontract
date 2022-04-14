const { toBN, toWei } = require('web3-utils');
const { expectEvent, expectRevert } = require('@openzeppelin/test-helpers');

const SMRXToken = artifacts.require('SMRXToken');
const SMRXBridge = artifacts.require('SMRXBridge');

const bridgeTax = toBN(5000000000000000); // 0.005 ETH
const bridgeAllowance = toBN(2).pow(toBN(256)).sub(toBN(1));
const transferAmount = toWei(toBN(10000));
const otherChainTx = '0x0000000000000000000000000000000000000000000000000000000000000000';

contract('SMRXBridge', accounts => {
  beforeEach(async () => {
    token = await SMRXToken.deployed();
    bridge = await SMRXBridge.deployed();
    deployerAddress = accounts[0];
    userAddress = accounts[1];
  });

  describe('Ownable', async () => {
    it('Check bridge owner', async () => {
      const owner = await bridge.owner();
      assert.equal(owner, deployerAddress, `Bridge owner isn't ${deployerAddress}`);
    });
  });

  describe('Taxable', async () => {
    it('Check bridge tax', async () => {
      const tax = await bridge.tax();
      assert(tax.eq(bridgeTax), `Bridge tax isn't ${bridgeTax}`);
    });

    it('Check bridge deployer tax', async () => {
      const deployerTax = await bridge.taxOf(deployerAddress, { from: deployerAddress });
      assert(deployerTax.eq(toBN(0)), `Bridge deployer tax isn't ${0}`);
    });

    it('Check bridge pay tax', async () => {
      const receipt = await bridge.payTax({ from: deployerAddress, value: bridgeTax });
      expectEvent(receipt, 'TaxDeposit', {
        from: deployerAddress,
        value: bridgeTax,
      });
    });

    it('Check bridge change tax', async () => {
      const receipt = await bridge.changeTax(bridgeTax, { from: deployerAddress });
      expectEvent(receipt, 'TaxChanged', {
        previousTax: bridgeTax,
        newTax: bridgeTax,
      });
    });
  });

  describe('Bridge', async () => {
    it('Check bridge allowance', async () => {
      const allowance = await token.allowance(deployerAddress, bridge.address);
      assert(allowance.eq(bridgeAllowance), `Bridge allowance isn't ${bridgeAllowance}`);
    });

    it('Check bridge token', async () => {
      const tokenAddress = await bridge.token();
      assert.equal(tokenAddress, token.address, `Bridge token isn't ${token.address}`);
    });

    it('Check bridge TX processed', async () => {
      const hasTxProcessed = await bridge.hasTxProcessed(otherChainTx);
      assert(!hasTxProcessed, `Bridge TX processed isn't ${false}`);
    });

    it('Check bridge deposit without tax', async () => {
      await expectRevert(bridge.deposit(transferAmount, { from: userAddress }), 'Taxable: No tax paid');
    });

    it('Check bridge deposit without allowance', async () => {
      await expectRevert(
        bridge.deposit(transferAmount, { from: userAddress, value: bridgeTax }),
        'ERC20: insufficient allowance',
      );
    });

    it('Check bridge deposit', async () => {
      await token.transfer(userAddress, transferAmount, { from: deployerAddress });
      await token.approve(bridge.address, transferAmount, { from: userAddress });
      const receipt = await bridge.deposit(transferAmount, { from: userAddress, value: bridgeTax });
      expectEvent(receipt, 'Deposit', {
        from: userAddress,
        value: transferAmount,
      });
    });

    it('Check bridge withdraw by deployer', async () => {
      await token.transfer(userAddress, transferAmount, { from: deployerAddress });
      await token.approve(bridge.address, transferAmount, { from: userAddress });
      await bridge.deposit(transferAmount, { from: userAddress, value: bridgeTax });

      const receipt = await bridge.withdraw(userAddress, transferAmount, otherChainTx, { from: deployerAddress });
      expectEvent(receipt, 'Withdraw', {
        to: userAddress,
        value: transferAmount,
        otherChainTx: otherChainTx,
      });

      await expectRevert(
        bridge.withdraw(userAddress, transferAmount, otherChainTx, { from: deployerAddress }),
        'Bridge: Transfer already processed',
      );
    });

    it('Check bridge withdraw by user', async () => {
      await expectRevert(
        bridge.withdraw(userAddress, transferAmount, otherChainTx, { from: userAddress }),
        'Ownable: caller is not the owner',
      );
    });
  });
});
