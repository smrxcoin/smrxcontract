const { toBN, toWei } = require('web3-utils');
const { expectEvent } = require('@openzeppelin/test-helpers');

const SMRXToken = artifacts.require('SMRXToken');

const tokenName = 'Samsara';
const tokenSymbol = 'SMRX';
const tokenDecimals = 18;
const tokenTotalSupply = toWei(toBN(67311475148));
const transferAmount = toWei(toBN(10000));

contract('SMRXToken', accounts => {
  beforeEach(async () => {
    token = await SMRXToken.deployed();
    deployerAddress = accounts[0];
    userAddress = accounts[1];
  });

  describe('ERC20', async () => {
    it('Check token name', async () => {
      const name = await token.name();
      assert.equal(name, tokenName, `Token name isn't ${tokenName}`);
    });

    it('Check token symbol', async () => {
      const symbol = await token.symbol();
      assert.equal(symbol, tokenSymbol, `Token symbol isn't ${tokenSymbol}`);
    });

    it('Check token decimals', async () => {
      const decimals = await token.decimals();
      assert.equal(decimals, tokenDecimals, `Token decimals isn't ${tokenDecimals}`);
    });

    it('Check token total supply', async () => {
      const totalSupply = await token.totalSupply();
      assert(totalSupply.eq(tokenTotalSupply), `Token total supply isn't ${tokenTotalSupply}`);
    });

    it('Check token deployer balance', async () => {
      const deployerBalance = await token.balanceOf(deployerAddress);
      assert(deployerBalance.eq(tokenTotalSupply), `Token deployer balance isn't ${tokenTotalSupply}`);
    });

    it('Check token transfer', async () => {
      const receipt = await token.transfer(userAddress, transferAmount, { from: deployerAddress });
      expectEvent(receipt, 'Transfer', {
        from: deployerAddress,
        to: userAddress,
        value: transferAmount,
      });
    });

    it('Check token deployer allowance', async () => {
      const deployerAllowance = await token.allowance(userAddress, deployerAddress, { from: deployerAddress });
      assert(deployerAllowance.eq(toBN(0)), `Token deployer allowance isn't ${0}`);
    });

    it('Check token approve', async () => {
      const receipt = await token.approve(userAddress, transferAmount, { from: deployerAddress });
      expectEvent(receipt, 'Approval', {
        owner: deployerAddress,
        spender: userAddress,
        value: transferAmount,
      });
    });

    it('Check token transfer from', async () => {
      const receipt = await token.transferFrom(deployerAddress, userAddress, transferAmount, { from: userAddress });
      expectEvent(receipt, 'Transfer', {
        from: deployerAddress,
        to: userAddress,
        value: transferAmount,
      });
    });

    it('Check token increase allowance', async () => {
      const receipt = await token.increaseAllowance(userAddress, transferAmount, { from: deployerAddress });
      expectEvent(receipt, 'Approval', {
        owner: deployerAddress,
        spender: userAddress,
        value: transferAmount,
      });
    });

    it('Check token decrease allowance', async () => {
      const receipt = await token.decreaseAllowance(userAddress, transferAmount, { from: deployerAddress });
      expectEvent(receipt, 'Approval', {
        owner: deployerAddress,
        spender: userAddress,
        value: toBN(0),
      });
    });
  });
});
