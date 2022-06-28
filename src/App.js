//importing required libraries
import React, { useState, useEffect } from "react";
import './App.css';
import twitterLogo from "./assets/twitter-logo.svg";

import * as fcl from '@onflow/fcl';
import * as types from '@onflow/types';

fcl.config({
  'flow.network': 'testnet',
  'app.detail.title': 'NFTszz', // dapp name
  'accessNode.api': 'https://rest-testnet.onflow.org', // url of node that interact with blockchain
  'app.detail.icon': 'https://placekitten.com/g/200/240', // app icon
  'discovery.wallet': 'https://fcl-discovery.onflow.org/testnet/authn',
});

const TWITTER_HANDLE = "kharioki";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

function App() {
  const [user, setUser] = useState();

  const logIn = () => {
    fcl.authenticate()
  }

  const logOut = () => {
    fcl.unauthenticate()
  }

  useEffect(() => {
    fcl.currentUser().subscribe(setUser);
  }, []);

  const RenderLogin = () => {
    return (
      <div>
        <button className="cta-button button-glow" onClick={() => logIn()}>
          Log In
        </button>
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

  return (
    <div className="App">
      <RenderLogout />
      <div className="container">
        <div className="header-container">
          <div className="logo-container">
            <img src="./logo.png" className="flow-logo" alt="flow logo" />
            <p className="header">✨Awesome NFTzz ✨</p>
          </div>

          <p className="sub-text">The easiest NFT mint experience ever!</p>
        </div>

        {/* If not logged in, render login button */}
        {user && user.addr ? "Wallet connected!" : <RenderLogin />}

        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a className="footer-text" href={TWITTER_LINK} target="_blank" rel="noreferrer">{`built by @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
}

export default App;