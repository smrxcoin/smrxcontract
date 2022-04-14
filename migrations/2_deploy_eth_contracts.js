const { toBN } = require('web3-utils');

const SMRXToken = artifacts.require('SMRXToken');
const SMRXBridge = artifacts.require('SMRXBridge');

const initialSupply = 67311475148;
const bridgeTax = toBN(5000000000000000); // 0.005 ETH
const bridgeAllowance = toBN(2).pow(toBN(256)).sub(toBN(1));

module.exports = async function (deployer, network, accounts) {
  if (network === 'development' || network.includes('eth')) {
    await deployer.deploy(SMRXToken, initialSupply);
    const token = await SMRXToken.deployed();

    await deployer.deploy(SMRXBridge, token.address, bridgeTax);
    const bridge = await SMRXBridge.deployed();
    const deployerAddress = accounts[0];
    await token.approve(bridge.address, bridgeAllowance, { from: deployerAddress });
  }
};
