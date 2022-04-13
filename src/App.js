import * as React from "react";
import { ethers } from "ethers";
import './App.css';

export default function App() {

  const connectWallet = () => {
    
  }
  
  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        Hey there!
        </div>

        <div className="bio">
          So far only rinkeby, soon fuji
        </div>

        <button className="connectWallet" onClick={connectWallet}>
          Connect Wallet
        </button>
      </div>
    </div>
  );
}
