import React, { useState, useEffect } from "react";
import NumericInput from "react-numeric-input";
import { ethers, BigNumber } from "ethers";
import './App.css';
import abi from './abis/Fund.json';

export default function App() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [isCurrentlyConnected, setCurrentlyConnected] = useState(false);
  const contractAddress = "0x5081f431918Ccc62DBDfaCBc11f34B4166A27450";
  const contractABI = abi.abi;
  const [amountFunded, setAmountFunded] = useState(BigNumber.from('0'));
  const [amountDeposit, setAmountDeposit] = useState(0);
  const [amountWithdraw, setAmountWithdraw] = useState(0);
  const [totalAmountFunded, setTotalAmountFunded] = useState(BigNumber.from('0'));

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
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const fundContract = new ethers.Contract(contractAddress, contractABI, signer);

        await fundContract.fund({ value: ethers.utils.parseEther(amountDeposit.toString())});
        updateAmountFunded();
      } else {
        console.log("Ethereum object doesn't exist");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const withdraw = async () => {
    updateAmountFunded();
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const fundContract = new ethers.Contract(contractAddress, contractABI, signer);

        fundContract.withdraw(ethers.utils.parseEther(amountWithdraw.toString()));
      } else {
        console.log("Ethereum object doesn't exist");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const updateAmountFunded = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const fundContract = new ethers.Contract(contractAddress, contractABI, signer);

        setAmountFunded(BigNumber.from((await fundContract.getAddressToAmountFunded(currentAccount)).toHexString()));
        
      } else {
        console.log("Ethereum object doesn't exist");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const updateTotalAmountFunded = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const fundContract = new ethers.Contract(contractAddress, contractABI, signer);

        setTotalAmountFunded(BigNumber.from((await fundContract.getTotalFunds().toHexString())));
        
      } else {
        console.log("Ethereum object doesn't exist");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const formatAvax = (bigNumber) => {
    return ethers.utils.formatEther(bigNumber);
  }

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  useEffect(() => {
    updateAmountFunded();
    //updateTotalAmountFunded();
  }, [currentAccount, amountFunded]);


  
  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        Hey there!
        </div>

        <div className="bio">
          Total funds of contract: {formatAvax(totalAmountFunded).toString()}
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
          <button onClick={updateAmountFunded}> Update amount Funded</button>
          Avalanche Funded: {formatAvax(amountFunded).toString()} AVAX
        </div>
        <div>
          <NumericInput min={0} value={amountDeposit} step={0.1} onChange={valueAsNumber => {setAmountDeposit(valueAsNumber)}}/>
          <button onClick={deposit}>Deposit</button>
        </div>
        <div>
          <NumericInput min={0} value={amountWithdraw} step={0.1} onChange={valueAsNumber => {setAmountWithdraw(valueAsNumber)}}/>
          <button onClick={withdraw}>Withdraw</button>
        </div>
      </div>
    </div>
  );
}
