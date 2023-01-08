// App.js

import { useEffect, useState } from "react";
import "./App.css";
import contract from "./contracts/NFTCollectible.json";
import { ethers } from "ethers";
import Footer from "./components/Footer";
import Header from "./components/Header";
import SquirrelsImg from './assets/rinkeby_squirrels.gif';

const contractAddress = "0x50566cbc02082868bc48c047fc16446582237875";
const OPENSEA_LINK = "https://testnets.opensea.io/collection/rinkeby-squirrels";
const abi = contract.abi;

function App() {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [isPolygonNetwork, setIsPolygonNetwork] = useState(true);
  const [mineStatus, setMineStatus] = useState(null);
  const [txnHash, setTxnHash] = useState(null);

  const checkWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have MetaMask installed!");
      return;
    } else {
      console.log("Wallet exists! We're ready to go!");
    }

    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account: ", account);
      setCurrentAccount(account);
    } else {
      console.log("No authorized account found");
    }
  };

  const checkNetworkIsPolygon = async () => {
    if (window.ethereum) {
      try {
        let chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const mumbaiChainId = "0x13881";
        if (chainId !== mumbaiChainId) {
          alert("Switch your network to Polygon Testnet.");
          setIsPolygonNetwork(false);
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      // window.ethereum が見つからない場合メタマスクのインストールを促します。
      alert('MetaMask is not installed. Please install it to use this app: https://metamask.io/download.html');
    }
  };

  const connectWalletHandler = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      alert("Please install MetaMask!");
    }

    try {
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Found an account! Address: ", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (err) {
      console.log(err);
    }
  };

  const mintNftHandler = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const nftContract = new ethers.Contract(contractAddress, abi, signer);

        setMineStatus("mining");
        console.log("Initialize payment");
        let nftTxn = await nftContract.mintNFTs(1, {
          value: ethers.utils.parseEther("0.01"),
        });

        console.log("Mining... please wait");
        await nftTxn.wait();

        console.log(`Mined, see transaction: ${nftTxn.hash}`);
        setMineStatus("success");
        setTxnHash(nftTxn.hash);
      } else {
        console.log("Ethereum object does not exist");
        setMineStatus("error");
      }
    } catch (err) {
      console.log(err);
      setMineStatus("error");
    }
  };

  const connectWalletButton = () => {
    return (
      <button
        onClick={connectWalletHandler}
        className="cta-button connect-wallet-button"
      >
        Connect Wallet
      </button>
    );
  };

  const mintNftButton = () => {
    return (
      <button onClick={mintNftHandler} className="cta-button mint-nft-button">
        Mint NFT
      </button>
    );
  };

  useEffect(() => {
    checkWalletIsConnected();
    checkNetworkIsPolygon();
  }, []);

  return (
    <div className="main-app">
      <Header opensea={OPENSEA_LINK}/>
      <div>
        <div className="img-banner">
          <img src={SquirrelsImg} className="gif"></img>
        </div>
        {currentAccount && isPolygonNetwork ? mintNftButton() : connectWalletButton()}
        {mineStatus === "mining" && <p className="text">Now Loading.....</p>}
        {mineStatus === "error" &&
         <p>Transaction failed. Make sure you have at least 0.01 MATIC in your Metamask wallet and try again.</p>}
        {txnHash != null && <h3>Your previous txn-hash is "{txnHash}"</h3>}
      </div>
      <Footer address={contractAddress}/>
    </div>
  );
}

export default App;