import React, { useState, useEffect } from 'react';
import {useNavigate} from 'react-router-dom';
import {getCliffTime, getReleaseAmount, claimTokens} from './contractMethods';
import './styles.css';

function Beneficiary() {
  const navigate = useNavigate();
  const [cliffTime, setCliffTime] = useState('');
  const [releasableAmount, setReleasableAmount] = useState('');

  useEffect(() => {
    async function getDetails(){
    // Fetch cliff time and releasable amount logic here
    const cliff = await getCliffTime();
    const releaseAmount = await getReleaseAmount(); 

    console.log(cliff, releaseAmount);

    setCliffTime(cliff);
    setReleasableAmount(releaseAmount);
    }
    getDetails();
  }, []);

  const handleClaimTokens =async () => {
    const success = await claimTokens();
    if(success) {
      alert("Tokens transferred into your acount");
    }
  };
  const handleLogout = () => {
    localStorage.removeItem('beneficiaryAddress');
    navigate('/');
 }

  return (
    <div className="container">
      <h1>Beneficiary Page</h1>
      <p>Cliff Time: {cliffTime} Months</p>
      <p>Releasable Amount: {releasableAmount} MVT</p>
      <button className="claim" onClick={handleClaimTokens}>Claim Tokens</button>
      <button className='claim' onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Beneficiary;
