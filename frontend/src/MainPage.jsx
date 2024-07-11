import React, { useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import {ethers} from 'ethers';
import './styles.css';
import {connect} from './contractMethods';

const MainPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Check localStorage for myContract
        const ownerAddress = JSON.parse(localStorage.getItem('ownerAddress'));
        const beneficiaryAddress = JSON.parse(localStorage.getItem('beneficiaryAddress'));
        if (ownerAddress) {
          navigate('/admin');
        }
        else if (beneficiaryAddress){
          navigate('/beneficiary');
        }
        else {
          navigate('/');
        }
      }, []);

    async function connectMetamask() {
        let provider = new ethers.BrowserProvider(window.ethereum);
        let signer = await provider.getSigner();
        const owner = await connect();
        // Store myContract in localStorage
        if (owner === signer.address) {
          localStorage.setItem('ownerAddress', JSON.stringify(owner));
          navigate('/admin');
        }
        else {
          localStorage.setItem('beneficiaryAddress', JSON.stringify(signer.address));
          navigate('/beneficiary');
        }

    }

    return (
        <div className='connectWallet'>
            <div className='typingContainer'>
                <div className='typing'>Vesting App</div>
            </div>
            <div className="walletButtonContainer">
                <button className='walletButton' onClick={connectMetamask}>
                    Connect to Metamask
                </button>
            </div>
        </div>
    );
}

export default MainPage;