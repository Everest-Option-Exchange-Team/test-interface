import React, { useState, useEffect, useCallback } from "react";
import EventSnackBar from "./Snackbar";
import WrongBlockchainDialog from "./AlertDialog";
import NumericInput from "react-numeric-input";
import { ethers, BigNumber } from "ethers";
import './constants/address';
import './App.css';
import abi from './abis/Fund.json';
import { AVALANCHE_MAINNET_ID, FUJI_TESTNET_BLOCK_EXPLORER_URL, FUJI_TESTNET_CHAIN_NAME, FUJI_TESTNET_ID, FUJI_TESTNET_ID_HEX, FUJI_TESTNET_RPC_URL, MAIN_CURRENCY_DECIMALS, MAIN_CURRENCY_NAME, MAIN_CURRENCY_SYMBOL } from "./constants/address";
require("dotenv").config();

export default function App() {
  // smart contract event related
  const [showEventSnackbar, setShowEventSnackbar] = useState(false);
  const [typeOfEvent, setTypeOfEvent] = useState("");
  // transaction chain data
  const [transactionHash, setTransactionHash] = useState("");
  const [transactionBlockNumber, setTransactionBlockNumber] = useState("");
  // wallet connection
  const [currentAccount, setCurrentAccount] = useState("");
  const [isCurrentlyConnected, setCurrentlyConnected] = useState(false);
  const [showDialogWrongBlockchain, setShowDialogWrongBlockchain] = useState(false);
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

  const checkIfCorrectBlockchain = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get Metamask!");
        return;
      }
      const provider = new ethers.providers.Web3Provider(ethereum);
      const networkInfo = await provider.getNetwork();
      const { chainId } = networkInfo;
      if (!(chainId === FUJI_TESTNET_ID || chainId === AVALANCHE_MAINNET_ID)) {
        setShowDialogWrongBlockchain(true);
      }
    } catch (error) {
      
    }
  }

  const updateOnBlockchainChanged = useCallback(async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get Metamask!");
        return;
      }

      ethereum.on('chainChanged', (chainId) => {
        console.log(chainId);
        // Handle the new chain.
        if (!(chainId === FUJI_TESTNET_ID || chainId === AVALANCHE_MAINNET_ID)) {
          setShowDialogWrongBlockchain(true);
        }
      });
    } catch (error) {
      
    }
  }, [setShowDialogWrongBlockchain])

  const changeBlockchain = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Get Metamask!");
        return;
      }

      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: FUJI_TESTNET_ID_HEX }],}); // chainId must be in hexadecimal numbers
      setShowDialogWrongBlockchain(false);
      window.location.reload();

    } catch (switchError) {
      //error code (error.code) is 4902, then the requested chain has not been added by MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: FUJI_TESTNET_ID_HEX,
                chainName: FUJI_TESTNET_CHAIN_NAME,
                rpcUrls: [FUJI_TESTNET_RPC_URL],
                blockExplorerUrls: [FUJI_TESTNET_BLOCK_EXPLORER_URL],
                nativeCurrency: {
                  name: MAIN_CURRENCY_NAME,
                  symbol: MAIN_CURRENCY_SYMBOL, 
                  decimals: MAIN_CURRENCY_DECIMALS
                }
              },
            ],
          });
          
          setShowDialogWrongBlockchain(false);
          window.location.reload();
        } catch (addError) {
          // handle "add" error
          alert("Please add Fuji to your Metamask!");
          console.log(addError);
        }
    }
  }
};

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
              setTypeOfEvent("sent");
              setShowEventSnackbar(true);
              /* 
              directly queue not displaying snackbar, otherwise with re-rendering page
              with the same snackbar (with withdraw the same)
              */
              setShowEventSnackbar(false);
              provider.waitForTransaction(tx.hash)
                .then((transactionReceipt)=>{
                  //action after transaction is mined
                  setShowEventSnackbar(false);
                  setTypeOfEvent("mined");
                  setTransactionHash(transactionReceipt.transactionHash);
                  setTransactionBlockNumber(transactionReceipt.blockNumber);
                  setShowEventSnackbar(true);
                  setShowEventSnackbar(false);
                  })
          })
          .catch(()=>{
              //action to perform when user clicks "reject" in the metamask interface
              setTypeOfEvent("failure");
              setLoadingDeposit(false);
              setShowEventSnackbar(true);
              setShowEventSnackbar(false);
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
              setTypeOfEvent("sent");
              setShowEventSnackbar(true);
              setShowEventSnackbar(false);
              provider.waitForTransaction(tx.hash)
                .then((transactionReceipt)=>{
                  //action after transaction is mined
                  setTypeOfEvent("mined");
                  setTransactionHash(transactionReceipt.transactionHash);
                  setTransactionBlockNumber(transactionReceipt.blockNumber);
                  setShowEventSnackbar(true);
                  setShowEventSnackbar(false);
              })
       })
       .catch(()=>{
       //action to perform when user clicks "reject"
          setTypeOfEvent("failure");
          setLoadingWithdraw(false);
          setShowEventSnackbar(true);
          setShowEventSnackbar(false);
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
          const amountTotalContractBigNum = BigNumber.from((await fundContract.getTotalFunds()).toHexString());
          
          if (currentAccount === from.toLowerCase()){
            setAmountFunded(amountTotalBigNum);
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
          const amountTotalContractBigNum = BigNumber.from((await fundContract.getTotalFunds()).toHexString());

          // only change these aspects of the UI for the inducer account
          if (currentAccount === from.toLowerCase()){
            setAmountFunded(amountTotalBigNum);
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



  // for Alertdialog wrong blockchain
  const handleCloseDialogWrongBlockchain = () => {
    // setShowDialogWrongBlockchain is set to false, once the rpc response of changing blockchain is successful
    //setShowDialogWrongBlockchain(false);
  }

  // only calling once (mounting (also page refresh))
  useEffect(() => {
    checkIfWalletIsConnected();
    checkIfCorrectBlockchain();
  }, []);

  // call ...
  useEffect(() => {
    updateOnBlockchainChanged();
  }, [updateOnBlockchainChanged]);

  // calling when readTotalAmountFunded, readFundsByAccount are newly created => happens if one of the dependencies change
  useEffect(() => {
    readTotalAmountFunded();
    readFundsByAccount();
  },[readTotalAmountFunded, readFundsByAccount]);

  // called whenever one of the dependencies of the callbacks change
  useEffect(() => {
    updateOnDeposit(); 
    updateOnWithdraw();
  },[updateOnDeposit, updateOnWithdraw])
  
  return (
    <div className="mainContainer">
      <EventSnackBar showEvent={showEventSnackbar} transactionHash={transactionHash} blockNumber={transactionBlockNumber} type={typeOfEvent}/>
      <WrongBlockchainDialog showDialog={showDialogWrongBlockchain} close={handleCloseDialogWrongBlockchain} action={changeBlockchain}/>
      <div className="dataContainer">
        <div className="header">
          Welcome to the Everest Protocol!
        </div>

        <div className="bio">
          Funds of contract: {formatAvax(totalAmountFunded)} AVAX
        </div>

        { isCurrentlyConnected ? 
          (<div className="bio">
            connected with {currentAccount.slice(0,5)}...{currentAccount.slice(-5,-1)}
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
          <button onClick={() => {setAmountWithdraw(formatAvax(amountFunded).toString())}}>Select all my funds</button>
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

