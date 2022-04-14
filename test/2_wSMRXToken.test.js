const { toBN, toWei } = require('web3-utils');
const { expectEvent, expectRevert } = require('@openzeppelin/test-helpers');

const wSMRXToken = artifacts.require('wSMRXToken');
const wSMRXBridge = artifacts.require('wSMRXBridge');

const tokenName = 'Samsara';
const tokenSymbol = 'SMRX';
const tokenDecimals = 18;
const tokenTotalSupply = toWei(toBN(67311475148));
const transferAmount = toWei(toBN(10000));
const mintAmount = toWei(toBN(10000));
const burnAmount = toWei(toBN(10000));

contract('wSMRXToken', accounts => {
  beforeEach(async () => {
    wToken = await wSMRXToken.deployed();
    wBridge = await wSMRXBridge.deployed();
    deployerAddress = accounts[0];
    userAddress = accounts[1];
  });

  describe('ERC20', async () => {
    it('Check token name', async () => {
      const name = await wToken.name();
      assert.equal(name, tokenName, `Token name isn't ${tokenName}`);
    });

    it('Check token symbol', async () => {
      const symbol = await wToken.symbol();
      assert.equal(symbol, tokenSymbol, `Token symbol isn't ${tokenSymbol}`);
    });

    it('Check token decimals', async () => {
      const decimals = await wToken.decimals();
      assert.equal(decimals, tokenDecimals, `Token decimals isn't ${tokenDecimals}`);
    });

    it('Check token total supply', async () => {
      const totalSupply = await wToken.totalSupply();
      assert(totalSupply.eq(tokenTotalSupply), `Token total supply isn't ${tokenTotalSupply}`);
    });

    it('Check token deployer balance', async () => {
      const deployerBalance = await wToken.balanceOf(deployerAddress);
      assert(deployerBalance.eq(tokenTotalSupply), `Token deployer balance isn't ${tokenTotalSupply}`);
    });

    it('Check token transfer', async () => {
      const receipt = await wToken.transfer(userAddress, transferAmount, { from: deployerAddress });
      expectEvent(receipt, 'Transfer', {
        from: deployerAddress,
        to: userAddress,
        value: transferAmount,
      });
    });

    it('Check token deployer allowance', async () => {
      const deployerAllowance = await wToken.allowance(userAddress, deployerAddress, { from: deployerAddress });
      assert(deployerAllowance.eq(toBN(0)), `Token deployer allowance isn't ${0}`);
    });

    it('Check token approve', async () => {
      const receipt = await wToken.approve(userAddress, transferAmount, { from: deployerAddress });
      expectEvent(receipt, 'Approval', {
        owner: deployerAddress,
        spender: userAddress,
        value: transferAmount,
      });
    });

    it('Check token transfer from', async () => {
      const receipt = await wToken.transferFrom(deployerAddress, userAddress, transferAmount, { from: userAddress });
      expectEvent(receipt, 'Transfer', {
        from: deployerAddress,
        to: userAddress,
        value: transferAmount,
      });
    });

    it('Check token increase allowance', async () => {
      const receipt = await wToken.increaseAllowance(userAddress, transferAmount, { from: deployerAddress });
      expectEvent(receipt, 'Approval', {
        owner: deployerAddress,
        spender: userAddress,
        value: transferAmount,
      });
    });

    it('Check token decrease allowance', async () => {
      const receipt = await wToken.decreaseAllowance(userAddress, transferAmount, { from: deployerAddress });
      expectEvent(receipt, 'Approval', {
        owner: deployerAddress,
        spender: userAddress,
        value: toBN(0),
      });
    });
  });

  describe('Ownable', async () => {
    it('Check token owner', async () => {
      const owner = await wToken.owner();
      assert.equal(owner, wBridge.address, `Token owner isn't ${wBridge.address}`);
    });
  });

  describe('WERC20', async () => {
    it('Check token mint by deployer', async () => {
      await expectRevert(
        wToken.mintTo(deployerAddress, mintAmount, { from: deployerAddress }),
        'Ownable: caller is not the owner',
      );
    });

    it('Check token mint by user', async () => {
      await expectRevert(
        wToken.mintTo(userAddress, mintAmount, { from: userAddress }),
        'Ownable: caller is not the owner',
      );
    });

    it('Check token burn by deployer', async () => {
      await expectRevert(
        wToken.burnFrom(deployerAddress, burnAmount, { from: deployerAddress }),
        'Ownable: caller is not the owner',
      );
    });

    it('Check token burn by user', async () => {
      await expectRevert(
        wToken.burnFrom(userAddress, burnAmount, { from: userAddress }),
        'Ownable: caller is not the owner',
      );
    });
  });
});
