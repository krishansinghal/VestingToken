import {ethers} from 'ethers';
import {abi, tokenAbi} from './abi';

async function initiateContract() {
    let provider = new ethers.BrowserProvider(window.ethereum);
    let signer = await provider.getSigner();
    const contract = new ethers.Contract(`${import.meta.env.VITE_VESTING_CONTRACT_ADDRESS}`, abi, signer);
    return contract;
 }

async function initiateTokenContract() {
  let provider = new ethers.BrowserProvider(window.ethereum);
  let signer = await provider.getSigner();
  const contract = new ethers.Contract(`${import.meta.env.VITE_TOKEN_CONTRACT_ADDRESS}`, tokenAbi, signer);
  return contract;
}

 
export async function connect() {
    let res = await connectToMetamask();
    if (res === true) {
      await changeNetwork();
      try {
         const address = await checkIfOwner();
         return address;
      } catch (err) {
        alert("CONTRACT_ADDRESS not set properly");
        console.log(err);
      }
    } else {
      alert("Couldn't connect to Metamask");
    }
  }

 async function connectToMetamask() {
    try {
      await window.ethereum.enable();
      return true;
    } catch (err) {
      return false;
    }
  }

async function changeNetwork() {
    // switch network to avalanche
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x539" }],
      });
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x539",
                chainName: "Ganache",
                nativeCurrency: {
                  name: "Ethereum",
                  symbol: "ETH",
                  decimals: 18,
                },
                rpcUrls: ["http://127.0.0.1:7545"],
              },
            ],
          });
        } catch (addError) {
          alert("Error in adding Ganache network");
        }
      }
    }
  }


  async function checkIfOwner() {
     let contract = await initiateContract();
     const owner = await contract.owner();
     console.log(owner);
     return owner;
  }

  export async function initiateVesting() {
    const contract = await initiateContract();
    let provider = new ethers.BrowserProvider(window.ethereum);
     let signer = await provider.getSigner();

    const vestingStarted = await contract.vestingStarted();
    if (!vestingStarted) {
       let txn = await contract.startVesting({ gasLimit: 300000, from: `${signer.address}`});
       return await txn.wait();
    }
    else {
      alert ("Vesting has already started");
    }
  }

  export async function addBeneficiary() {
     const contract = await initiateContract();
     const tokenContract = await initiateTokenContract();
     let provider = new ethers.BrowserProvider(window.ethereum);
     let signer = await provider.getSigner();
     const beneficiaryAddress = document.getElementById('benefAddress').value.toLowerCase();
     const selectedRole = document.getElementById('role').value;
     const amount = document.getElementById('amount').value;

     console.log(beneficiaryAddress, selectedRole, amount);

     try{

     const totalSupply = await tokenContract.totalSupply();

     const allow = await tokenContract.approve(`${import.meta.env.VITE_VESTING_CONTRACT_ADDRESS}`, totalSupply.toString(), { gasLimit: 300000, from: `${signer.address}`});
     const success = await allow.wait();
    
     if (success.hash) {
        const ifUser = await contract.roles(beneficiaryAddress);
        if (ifUser > 0) {
          alert("Role already added");
        }
        else {
          const ifBeneficiary = await contract.vestingSchedules(beneficiaryAddress);
          if (ifBeneficiary.totalAmount > 0) {
            alert ('Beneficiary already added');
          }
          else {
              const addRole = await contract.setRole(beneficiaryAddress, selectedRole, { gasLimit: 300000, from: `${signer.address}`});
              const success = await addRole.wait();
              if (success.hash) {
                 const addBenef = await contract.addBeneficiary(beneficiaryAddress, amount, { gasLimit: 300000, from: `${signer.address}`});
                 const success2 = await addBenef.wait();
                 if(success2.hash) {
                    alert("Beneficiary added succesfully");
                    return true;
                 } 
                 else {
                    alert ('Error while adding beneficiary');
                 }
              }
              else {
                 alert("Error while adding role");
              }
          }
        }
     }
     else {
       alert("something went wrong");
     }
    } catch(e) {
      console.log(e);
    }
     
    return false;
     
  }

  export async function getCliffTime() {
    const contract = await initiateContract();
    let provider = new ethers.BrowserProvider(window.ethereum);
    let signer = await provider.getSigner();
    try {
      const ifUser = parseInt(await contract.roles(signer.address));
      console.log(ifUser);
        if (ifUser === 1) {
           return parseInt(await contract.USER_CLIFF_DURATION())/ (60 * 60 * 24 * 30);
        }
        else if(ifUser === 2) {
          return parseInt(await contract.PARTNER_CLIFF_DURATION()) / (60 * 60 * 24 * 30);
        }
        else if(ifUser === 3) {
          return parseInt(await contract.TEAM_CLIFF_DURATION()) / (60 * 60 * 24 * 30);
        }
        else {
          return "No Role assigned";
        }
    } catch (e) {
      console.log(e);
    }
  }

  export async function getReleaseAmount() {
    let provider = new ethers.BrowserProvider(window.ethereum);
    let signer = await provider.getSigner();
    const contract = await initiateContract();

    try {
       return parseInt(await contract.releasableAmount(signer.address));
    } catch(err) {
      console.log(err);
    }
  }

  export async function claimTokens() {
    let provider = new ethers.BrowserProvider(window.ethereum);
    let signer = await provider.getSigner();
    const contract = await initiateContract();

    try {
       const release = await contract.releaseTokens({ gasLimit: 300000, from: `${signer.address}`});
       const txn = await release.wait();
       if (txn.hash) {
        return true;
       }
    } catch(e) {
      alert("Something went wrong");
    }

    return false;
  }