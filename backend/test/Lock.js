const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('VestingContract', function () {
  let VestingContract, vestingContract, Token, token, owner, addr1, addr2, addr3;

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    [owner, addr1, addr2, addr3] = await ethers.getSigners();

    // Deploy the ERC20 token
    Token = await ethers.getContractFactory('MintableToken');
    token = await Token.deploy('TestToken', 'TTK', 1000000);
    await token.deployed();

    // Deploy the VestingContract
    VestingContract = await ethers.getContractFactory('VestingContract');
    vestingContract = await VestingContract.deploy(token.address);
    await vestingContract.deployed();

    // Transfer some tokens to the vesting contract
    await token.transfer(vestingContract.address, 500000);
  });

  it('should allow the admin to create a vesting schedule', async function () {
    await vestingContract.setRole(addr1.address, 0); // Role.User
    await vestingContract.addBeneficiary(addr1.address, 250000);

    const schedule = await vestingContract.vestingSchedules(addr1.address);
    expect(schedule.totalAmount).to.equal(250000);
  });

  it('should release tokens properly after cliff period', async function () {
    await vestingContract.setRole(addr1.address, 0); // Role.User
    await vestingContract.addBeneficiary(addr1.address, 250000);
    await vestingContract.startVesting();

    // Fast forward time past the cliff period (10 months)
    await ethers.provider.send('evm_increaseTime', [10 * 30 * 24 * 60 * 60]);
    await ethers.provider.send('evm_mine', []);

    await vestingContract.connect(addr1).releaseTokens();
    const balance = await token.balanceOf(addr1.address);
    expect(balance).to.be.gt(0);
  });

  it('should correctly calculate releasable amount based on duration', async function () {
    await vestingContract.setRole(addr1.address, 0); // Role.User
    await vestingContract.addBeneficiary(addr1.address, 250000);
    await vestingContract.startVesting();

    // Fast forward time by 1 year
    await ethers.provider.send('evm_increaseTime', [365 * 24 * 60 * 60]);
    await ethers.provider.send('evm_mine', []);

    const releasable = await vestingContract.releasableAmount(addr1.address);
    expect(releasable).to.be.closeTo(125000, 1); // Approximately half of the total amount
  });

  it('should prevent token release before cliff period', async function () {
    await vestingContract.setRole(addr1.address, 0); // Role.User
    await vestingContract.addBeneficiary(addr1.address, 250000);
    await vestingContract.startVesting();

    await expect(vestingContract.connect(addr1).releaseTokens()).to.be.revertedWith('Cliff period not reached');
  });

  it('should only allow admin to add beneficiaries', async function () {
    await expect(vestingContract.connect(addr2).addBeneficiary(addr3.address, 250000)).to.be.revertedWith('Ownable: caller is not the owner');
  });
});