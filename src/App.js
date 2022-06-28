//importing required libraries
import React, { useState, useEffect } from "react";
import './App.css';
import twitterLogo from "./assets/twitter-logo.svg";

import * as fcl from '@onflow/fcl';
import * as types from '@onflow/types';

import { mintNFT } from './cadence/transactions/mintNFT_tx';
import { getTotalSupply } from './cadence/scripts/getTotalSupply_script';
import { getMetadata } from './cadence/scripts/getMetadata_script';
import { getIDs } from './cadence/scripts/getID_script';

fcl.config({
  'flow.network': 'testnet',
  'app.detail.title': 'GearHead NFTs', // dapp name
  'accessNode.api': 'https://rest-testnet.onflow.org', // url of node that interact with blockchain
  // 'app.detail.icon': 'https://placekitten.com/g/200/240', // app icon
  'app.detail.icon': 'https://res.cloudinary.com/khariokitony/image/upload/c_scale,h_240,w_240/v1656422286/8.jpg', // app icon
  'discovery.wallet': 'https://fcl-discovery.onflow.org/testnet/authn',
});

const TWITTER_HANDLE = "kharioki";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

function App() {
  const [user, setUser] = useState();
  const [images, setImages] = useState([]);
  const [network, setNetwork] = useState('');

  const logIn = () => {
    fcl.authenticate()
  }

  const logOut = () => {
    // clear out images incase we switch wallets
    setImages([]);
    fcl.unauthenticate()
  }

  const RenderGif = () => {
    const gifUrl = user?.addr
      ? "https://media.giphy.com/media/cugOguK3T7rpK/giphy.gif"
      : "https://media.giphy.com/media/cKseb5FURNxW44ol5q/giphy.gif";
    return <img className="gif-image" src={gifUrl} height="300px" alt="gears gif" />;
  };

  const RenderLogin = () => {
    return (
      <div>
        <button className="cta-button button-glow" onClick={() => logIn()}>
          Log In
        </button>
      </div>
    )
  }

  const RenderMint = () => {
    return (
      <div>
        <div className="button-container">
          <button className="cta-button button-glow" onClick={() => mint()}>
            Mint NFT
          </button>
        </div>

        {images.length > 0 ?
          <>
            <h2>Your NFTs</h2>
            <div className="images-container">
              {images}
            </div>
          </>
          : ""}
      </div>
    )
  }

  const RenderLogout = () => {
    if (user && user.addr) {
      return (
        <div className="logout-container">
          <button className="cta-button logout-btn" onClick={() => logOut()}>
            ❎ {"  "}
            {user.addr.substring(0, 6)}...{user.addr.substring(user.addr.length - 4)}
          </button>
        </div>
      )
    }
    return undefined;
  }

  const fetchNFTs = async () => {
    // empty the images array
    setImages([]);
    let IDs = [];

    // fetch the IDs with our script (no fees and no signers necessary)
    try {
      IDs = await fcl.query({
        cadence: `${getIDs}`,
        args: (arg, t) => [
          arg(user.addr, types.Address),
        ]
      })
    } catch (e) {
      console.log('No NFTs owned by this user');
    }

    let _imageSrc = [];
    try {
      for (let i = 0; i < IDs.length; i++) {
        const result = await fcl.query({
          cadence: `${getMetadata}`,
          args: (arg, t) => [
            arg(user.addr, types.Address),
            arg(IDs[i].toString(), types.UInt64),
          ],
        });

        // if the resource is an IPFS link, remove the "ipfs://" prefix
        if (result["thumbnail"].startsWith("ipfs://")) {
          _imageSrc.push(result["thumbnail"].substring(7));
          // Add a gateway prefix to the image link
          _imageSrc[i] = `https://nftstorage.link/ipfs/${_imageSrc[i]}`;
        }
        else {
          _imageSrc.push(result["thumbnail"]);
        }
      }
    } catch (e) {
      console.log(e)
    }

    if (images.length < _imageSrc.length) {
      setImages((Array.from({ length: _imageSrc.length }, (_, i) => i).map((number, index) =>
        <img style={{ margin: "10px", height: "150px" }} src={_imageSrc[index]} alt={"NFT #" + number} key={number} />
      )))
    }
  }

  const mint = async () => {
    let _totalSupply;
    try {
      _totalSupply = await fcl.query({
        cadence: `${getTotalSupply}`
      })
    } catch (e) {
      console.log(e);
    }

    const _id = parseInt(_totalSupply) + 1;

    try {
      const transactionId = await fcl.mutate({ // this is just a write request
        cadence: `${mintNFT}`,
        args: (arg, t) => [
          arg(user.addr, types.Address), // address to which the NFT will be minted
          arg("GearHead #" + _id.toString(), types.String), // name of the NFT"
          arg("Biker and pet", types.String), // description of the NFT
          arg("https://nftstorage.link/ipfs/bafybeiha3j5ebqx3cx6jy2hv3n4kd7sirnhpuq6vvmqgj4ptnb6uuuw2fe/" + _id + ".jpeg", types.String), // image of the NFT
        ],
        proposer: fcl.currentUser, // account sending transaction
        payer: fcl.currentUser, // account paying gas fees
        limit: 99 // computation limit for this transaction
      })
      console.log('Minting NFT now with transaction ID: ', transactionId);
      const transaction = await fcl.tx(transactionId).onceSealed();
      console.log('Testnet explorer link: ', `https://testnet.flowscan.org/transaction/${transactionId}`);
      console.log(transaction);
      alert('NFT minted successfully!');
    } catch (e) {
      console.log(e);
      alert('Error minting NFT!');
    }
  }

  useEffect(() => {
    fcl.currentUser().subscribe(setUser);
  }, []);

  useEffect(() => {
    if (user && user.addr) {
      fetchNFTs();
    }
  }, [user]);

  useEffect(() => {
    window.addEventListener('message', d => {
      // for Lilico testnet
      if (d.data.type === 'LILICO:NETWORK') setNetwork(d.data.network);
    });
  }, []);

  return (
    <div className="App">
      <RenderLogout />
      <div className="container">
        <div className="header-container">
          <div className="logo-container">
            <img src="./logo.png" className="flow-logo" alt="flow logo" />
            <p className="header">✨Awesome GearHead Nfts ✨</p>
          </div>

          <RenderGif />

          <p className="sub-text">The easiest NFT mint experience ever!</p>
        </div>

        {/* If not logged in, render login button */}
        {user && user.addr ? <RenderMint /> : <RenderLogin />}

        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a className="footer-text" href={TWITTER_LINK} target="_blank" rel="noreferrer">{`built by @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
}

export default App;