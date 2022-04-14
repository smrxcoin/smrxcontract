const { toBN, toWei } = require('web3-utils');

const wSMRXToken = artifacts.require('wSMRXToken');
const wSMRXBridge = artifacts.require('wSMRXBridge');

const testInitialSupply = toWei(toBN(67311475148));
const bridgeTax = toBN(40000000000000000); // 0.04 BNB

module.exports = async function (deployer, network, accounts) {
  if (network === 'development' || network.includes('bsc')) {
    await deployer.deploy(wSMRXToken);
    const wToken = await wSMRXToken.deployed();
    if (network === 'development') {
      const deployerAddress = accounts[0];
      await wToken.mintTo(deployerAddress, testInitialSupply);
    }

    await deployer.deploy(wSMRXBridge, wToken.address, bridgeTax);
    const wBridge = await wSMRXBridge.deployed();
    await wToken.transferOwnership(wBridge.address);
  }
};
