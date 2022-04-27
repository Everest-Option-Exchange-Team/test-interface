import React, { useState, useEffect, useCallback } from "react";
import EventSnackBar from "./Snackbar";
import NumericInput from "react-numeric-input";
import { ethers, BigNumber } from "ethers";
import './App.css';
import abi from './abis/Fund.json';
require("dotenv").config();

export default function App() {
  // smart contract event related
  const [showEventSnackbar, setShowEventSnackbar] = useState(false);
  const [addressOfEventInducer, setAddressOfEventInducer] = useState("");
  const [typeOfEvent, setTypeOfEvent] = useState("");
  const [amountChanged, setAmountChanged] = useState(0);
  // wallet connection
  const [currentAccount, setCurrentAccount] = useState("");
  const [isCurrentlyConnected, setCurrentlyConnected] = useState(false);
  const contractABI = abi.abi;
  // change of UI
  const [loadingDeposit, setLoadingDeposit] = useState(false);
  const [loadingWithdraw, setLoadingWithdraw] = useState(false);
  const [amountDeposit, setAmountDeposit] = useState(0);
  const [amountWithdraw, setAmountWithdraw] = useState(0);
  // stats of smart contract
  const [amountFunded, setAmountFunded] = useState(BigNumber.from('0'));
  const [totalAmountFunded, setTotalAmountFunded] = useState(BigNumber.from('0'));

  // Check if contract address is defined.
  const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;
  console.log(`Contract address: ${CONTRACT_ADDRESS}`);

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
        const fundContract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);

        fundContract
          .fund({ value: ethers.utils.parseEther(amountDeposit.toString())})
          .then((tx)=>{
            //action prior to transaction being mined
            provider.waitForTransaction(tx.hash)
          .then(()=>{
             //action after transaction is mined
            })
          })
          .catch(()=>{
          //action to perform when user clicks "reject"
            setShowEventSnackbar(true);
            setTypeOfEvent("failure");
            setLoadingDeposit(false);
          });
      } else {
        console.log("Ethereum object doesn't exist");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const withdraw = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const fundContract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);

        fundContract
          .withdraw(ethers.utils.parseEther(amountWithdraw.toString()))
          .then((tx)=>{
            //action prior to transaction being mined
            provider.waitForTransaction(tx.hash)
          .then(()=>{
             //action after transaction is mined
          })
       })
       .catch(()=>{
       //action to perform when user clicks "reject"
            setShowEventSnackbar(true);
            setTypeOfEvent("failure");
            setLoadingWithdraw(false);
       });
      } else {
        console.log("Ethereum object doesn't exist");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const readFundsByAccount = useCallback(async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const fundContract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);

        const amountTotalBigNum = BigNumber.from((await fundContract.getAddressToAmountFunded(currentAccount)).toHexString())
        setAmountFunded(amountTotalBigNum);
        
      } else {
        console.log("Ethereum object doesn't exist");
      }
    } catch (error) {
      console.log(error);
    }
  }, [CONTRACT_ADDRESS, contractABI, currentAccount]);

  const readTotalAmountFunded = useCallback(async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const fundContract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);

        const amountTotalContractBigNum = BigNumber.from((await fundContract.getTotalFunds()).toHexString())
        setTotalAmountFunded(amountTotalContractBigNum);
        
      } else {
        console.log("Ethereum object doesn't exist");
      }
    } catch (error) {
      console.log(error);
    }
  }, [CONTRACT_ADDRESS, contractABI]);

  const updateOnDeposit = useCallback(async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const fundContract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);

        // amountTotal is for one account (see smart contract Fund.sol)
        fundContract.on("Deposit", async (from, amountDeposited, amountTotal) => {

          const amountTotalBigNum = BigNumber.from(amountTotal.toHexString());
          const amountChangedBigNum = BigNumber.from(amountDeposited.toHexString());
          const amountChanged = formatAvax(amountChangedBigNum);
          const amountTotalContractBigNum = BigNumber.from((await fundContract.getTotalFunds()).toHexString());
          
          if (currentAccount === from.toLowerCase()){
            setAmountFunded(amountTotalBigNum);
            setShowEventSnackbar(true);
            setAddressOfEventInducer(from);
            setTypeOfEvent("deposited");
            setAmountChanged(amountChanged);
          }

          setTotalAmountFunded(amountTotalContractBigNum);
          setLoadingDeposit(false);
        })
        
      } else {
        console.log("Ethereum object doesn't exist");
      }
    } catch (error) {
      console.log(error);
    }
  }, [currentAccount, CONTRACT_ADDRESS, contractABI]); 

  const updateOnWithdraw = useCallback(async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const fundContract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);

        // amountTotal is for one account (see smart contract Fund.sol)
        fundContract.on("Withdraw", async (from, amountWithdrawn, amountTotal) => {

          const amountTotalBigNum = BigNumber.from(amountTotal.toHexString());
          const amountChangedBigNum = BigNumber.from(amountWithdrawn.toHexString());
          const amountChanged = formatAvax(amountChangedBigNum);
          const amountTotalContractBigNum = BigNumber.from((await fundContract.getTotalFunds()).toHexString());

          // only change these aspects of the UI for the inducer account
          if (currentAccount === from.toLowerCase()){
            setAmountFunded(amountTotalBigNum);
            setShowEventSnackbar(true);
            setAddressOfEventInducer(from);
            setTypeOfEvent("withdrew");
            setAmountChanged(amountChanged);
          }
          setTotalAmountFunded(amountTotalContractBigNum);
          setLoadingWithdraw(false);
        })
        
      } else {
        console.log("Ethereum object doesn't exist");
      }
    } catch (error) {
      console.log(error);
    }
  }, [currentAccount, CONTRACT_ADDRESS, contractABI]); 


  const formatAvax = (bigNumber) => {
    return ethers.utils.formatEther(bigNumber);
  }

  // for snackbar
  const handleClose = () => {
    setShowEventSnackbar(false);
  }

  // only calling once (mounting)
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  // calling when readTotalAmountFunded, readFundsByAccount are newly created => happens if one of the dependencies change
  useEffect(() => {
    readTotalAmountFunded();
    readFundsByAccount();
  },[readTotalAmountFunded, readFundsByAccount]);

  // called whenever there is a smart contract event
  useEffect(() => {
    updateOnDeposit(); 
    updateOnWithdraw();
  },[updateOnDeposit, updateOnWithdraw])
  
  return (
    <div className="mainContainer">
      <EventSnackBar showEvent={showEventSnackbar} close={handleClose} address={addressOfEventInducer} amount={amountChanged} type={typeOfEvent}/>
      <div className="dataContainer">
        <div className="header">
          Hey there!
        </div>

        <div className="bio">
          Funds of contract: {formatAvax(totalAmountFunded)} AVAX
        </div>

        { isCurrentlyConnected ? 
          (<div className="bio">
            connected with {currentAccount}
          </div>) : 
          ( <button className="connectWallet" onClick={connectWallet}>
              Connect Wallet
        </button>)
        }
        <div className="bio">
          My Avax Funds: {formatAvax(amountFunded)} AVAX
        </div>
        <div>
          <NumericInput min={0} value={amountDeposit} step={0.1} onChange={valueAsNumber => {setAmountDeposit(valueAsNumber)}}/>
          <button onClick={
            () => {
              deposit();
              setAmountDeposit(0);
              setLoadingDeposit(true);
            }
            }>
              {loadingDeposit ? "loading ..." : "Deposit"}
              </button>
        </div>
        <div>
          <NumericInput min={0} value={amountWithdraw} step={0.1} onChange={valueAsNumber => {setAmountWithdraw(valueAsNumber)}}/>
          <button onClick={
            () => {
              withdraw();
              setAmountWithdraw(0);
              setLoadingWithdraw(true);
            }
            }>
              {loadingWithdraw ? "loading ..." : "Withdraw"}
              
              </button>
        </div>
      </div>
    </div>
  );
}
