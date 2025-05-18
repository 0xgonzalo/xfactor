// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("LaunchpadModule", (m) => {
  // Get the fee amount (0.01 ether in wei)
  // 10^16 = 0.01 ether in wei
  const fee = m.getParameter("fee", "10000000000000000");

  // Define launchpad contract
  const launchpad = m.contract("Launchpad", [fee]);

  // Return launchpad
  return { launchpad };
})