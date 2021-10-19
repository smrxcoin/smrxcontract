const SMRXToken = artifacts.require('SMRXToken');

contract("SMRXToken", (accounts) => {
  before(async () => {
    smrxToken = await SMRXToken.deployed()
    console.log("SMRX token address:", smrxToken.address)
  })

  it("Owner initial suply", async () => {
    let balance = await smrxToken.balanceOf(accounts[0])
    balance = web3.utils.fromWei(balance, "ether")
    assert.equal(balance, 67311475148, "Balance should be 67311475148 for contract owner")
  })
})
