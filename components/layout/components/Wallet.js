import styled from "styled-components";
import { ethers } from "ethers";
import { useState } from "react";

const networks = {
  sepolia: {
    chainId: `0xAA36A7`, // 11155111 in hex
    chainName: "Ethereum Sepolia Testnet",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://rpc.sepolia.org"],
    blockExplorerUrls: ["https://sepolia.etherscan.io"],
  },
};

const Wallet = () => {
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState("");

  const connectWallet = async () => {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.providers.Web3Provider(window.ethereum, "any");

      // Check the network and switch to Sepolia if not already connected
      const network = await provider.getNetwork();
      if (network.chainId !== 11155111) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [networks["sepolia"]],
        });
      }

      // Get wallet address and balance
      const account = provider.getSigner();
      const Address = await account.getAddress();
      setAddress(Address);
      const Balance = ethers.utils.formatEther(await account.getBalance());
      setBalance(Balance);
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  return (
    <ConnectWalletWrapper onClick={connectWallet}>
      {balance === "" ? (
        <Balance>Loading...</Balance>
      ) : (
        <Balance>{balance.slice(0, 6)} ETH</Balance>
      )}
      {address === "" ? (
        <Address>Connect Wallet</Address>
      ) : (
        <Address>{address.slice(0, 6)}...{address.slice(38)}</Address>
      )}
    </ConnectWalletWrapper>
  );
};

const ConnectWalletWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: ${(props) => props.theme.bgDiv};
  padding: 5px 9px;
  height: 100%;
  color: ${(props) => props.theme.color};
  border-radius: 10px;
  margin-right: 15px;
  font-family: 'Roboto';
  font-weight: bold;
  font-size: small;
  cursor: pointer;
`;

const Address = styled.h2`
  background-color: ${(props) => props.theme.bgSubDiv};
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
  border-radius: 10px;
`;

const Balance = styled.h2`
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
  margin-right: 5px;
`;

export default Wallet;
