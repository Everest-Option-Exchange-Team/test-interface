import React, { useState, useEffect } from "react";
import NumericInput from "react-numeric-input";
import { ethers } from "ethers";
import './App.css';
import abi from './utils/Fund.json';

export default function App() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [isCurrentlyConnected, setCurrentlyConnected] = useState(false);
  const contractAddress = "0x5897b2b05e90501Fb9b6107FD8eFe006c199A82B";
  const contractABI = abi.abi;
  const [amountFunded, setAmountFunded] = useState("");

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure  you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: 'eth_accounts'});

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account: ", account);
        setCurrentAccount(account);
        setCurrentlyConnected(true);
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.error(error);
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get Metamask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts"});

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
      setCurrentlyConnected(true);
    } catch(error) {
      console.error(error);
    }
  }

  const deposit = async () => {

  }

  const withdraw = async () => {

  }

  const updateAmountFunded = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const fundContract = new ethers.Contract(contractAddress, contractABI, signer);

        console.log(signer.address);
        console.log(signer);
        console.log(fundContract);
        console.log(currentAccount);

        const amount = await fundContract.getAddressToAmountFunded(currentAccount);
        setAmountFunded(amount);
      } else {
        console.log("Ethereum object doesn't exist");
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);


  
  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        Hey there!
        </div>

        <div className="bio">
          Fuji!!
        </div>

        { isCurrentlyConnected ? 
          (<div>
            connected with {currentAccount}
          </div>) : 
          ( <button className="connectWallet" onClick={connectWallet}>
              Connect Wallet
        </button>)
        }
        <div>
          <button onClick={updateAmountFunded}> Update amount Funded </button>
          Avalanche Funded: {amountFunded}
        </div>
        <div>
          <NumericInput min={0} value={0} step={0.1}/>
          <button onClick={deposit}>Deposit</button>
        </div>
        <div>
          <NumericInput min={0} value={0} step={0.1}/>
          <button onClick={withdraw}>Withdraw</button>
        </div>
      </div>
    </div>
  );
}
