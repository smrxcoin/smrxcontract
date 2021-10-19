const SMRXToken = artifacts.require('SMRXToken');

module.exports = async function (deployer) {
  await deployer.deploy(SMRXToken, 67311475148);
};
