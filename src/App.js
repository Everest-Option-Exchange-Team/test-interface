import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from './utils/Fund.json';

export default function App() {
  const [currentAccount, setCurrentAccount] = useState("");
  const contractAddress = "0x479E9da1f7a5a1Ae2EBD7bCBd05958107485afb6";
  const contractABI = abi.abi;

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
    } catch(error) {
      console.error(error);
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

        <button className="connectWallet" onClick={connectWallet}>
          Connect Wallet
        </button>
      </div>
    </div>
  );
}
