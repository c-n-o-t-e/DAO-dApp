import React, { useEffect, useState } from 'react';
import Voting from './contracts/DAO.json';
import { getWeb3 } from './utils.js';

function App() {
  const [web3, setWeb3] = useState(undefined);
  const [accounts, setAccounts] = useState(undefined);
  const [contract, setContract] = useState(undefined);
  const [proposalId, setProposalId] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [voteTime, setVoteTime] = useState(undefined);
  const [proposal, setProposal] = useState([]);
  const [investor, setInvestor] = useState(undefined);
  const [shares, setShares] = useState(undefined);
  const [vt, setVt] = useState(undefined);


  useEffect(() => {
    const init = async () => {
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = Voting.networks[networkId];
      const contract = new web3.eth.Contract(
        Voting.abi,
        deployedNetwork && deployedNetwork.address,
      );
      
      setWeb3(web3);
      setAccounts(accounts);
      setContract(contract);
    }
    init();
    window.ethereum.on('accountsChanged', accounts => {
      setAccounts(accounts);
    });
  }, []);

  const isReady = () => {
    return (
      typeof contract !== 'undefined' 
      && typeof web3 !== 'undefined'
      && typeof accounts !== 'undefined'
    );
  }

  useEffect(() => {
    if(isReady()) {
      updateBalance();
      voteTimee();
      nextProposalId();
      vT();
    }
  }, [accounts, contract, web3]);

 async function updateBalance() {
    const balance = await web3.eth.getBalance(contract.options.address);
    setBalance(balance);
  }
 async function createProposal(e) {
    e.preventDefault();
    const name = e.target.elements[0].value;
    const amount = e.target.elements[1].value;
    const address = e.target.elements[2].value;
    await contract.methods.createProposal(name,amount,address)
    .send({from: accounts[0]});
    await nextProposalId();
  } 

  async function vote(e) {
    e.preventDefault();
    const id = e.target.elements[0].value;
    await contract.methods.vote(id)
    .send({from: accounts[0]});
  }

  async function executeProposal(e) {
    e.preventDefault();
    const id = e.target.elements[0].value;
    await contract.methods.vote(id)
    .send({from: accounts[0]});
    await updateBalance();
  }

  async function voteTimee() {
    const id = await contract.methods
      .voteTime()
      .call();
    setVoteTime(id)
  }

   async function nextProposalId() {
    const id = (await contract.methods
      .nextProposalId()
      .call()) - 1;
    setProposalId(id)
  }

  async function proposals(e) {
    e.preventDefault();
    const id = e.target.elements[0].value;
    const props = await contract.methods.proposals(id)
      .call() ;
    setProposal(props);
  }

  async function investorss(e) {
    e.preventDefault();
    const id = e.target.elements[0].value;
    const inv = await contract.methods
      .investors(id)
      .call();
      setInvestor(inv);
  }

  async function sharess(e) {
    e.preventDefault();
    const id = e.target.elements[0].value;
    const sha = await contract.methods
      .shares(id)
      .call();
      setShares(sha);
  }

  async function redeemFunds(e) {
    e.preventDefault();
    const amount = e.target.elements[0].value;
    await contract.methods.redeemShares(amount)
    .send({from: accounts[0]});
    await updateBalance();
  }

  async function transferFunds(e) {
    e.preventDefault();
    const amount = e.target.elements[0].value;
    const to = e.target.elements[1].value;
    await contract.methods.transferShares(amount, to)
    .send({from: accounts[0]});
  }

  async function withdrawFunds(e) {
    e.preventDefault();
    const amount = e.target.elements[0].value;
    const to = e.target.elements[1].value;
    await contract.methods.withdrawEther(amount, to)
    .send({from: accounts[0]});
    await updateBalance();
  }

  async function fallBack(e) {
    e.preventDefault();
    const amount = e.target.elements[0].value;
    await web3.eth.sendTransaction({from: accounts[0], to: contract.options.address, value: web3.utils.toWei(amount, 'ether')})
    await updateBalance();
  }

  async function vT() {
    const id = (await contract.methods
      .nextProposalId()
      .call()) - 1;
    const sha = await contract.methods
      .votes(accounts[0], id)
      .call();
      setVt(sha);
  }


  if (!isReady()) {
    return <div>Loading...</div>;
  }

  return (
    <div>

      <h1> DAO dApp </h1>

      <p> Available Funds: <b>{balance}</b> wei</p>

      <p> Proposal Ids: {proposalId}</p>

      <p> Vote Time(s): {voteTime}</p>

     <div className='pos'> <h2> Create A Proposal </h2> <h2> Vote </h2> </div>

     <div className='pos'> <form onSubmit={e => createProposal(e)}>
      <input type = 'text' placeholder="enter name" />
      <input type = '' placeholder="enter amount" />
      <input type = '' placeholder="enter address" />
      <input type = 'submit' />
      </form>

      <form onSubmit={e => vote(e)}>
      <input type = 'number' placeholder="enter id" />
      {vt ? 'Already voted' :(

      <input type = 'submit' />)}
      </form></div>

      <div className='pos'><h2> Execute Proposal </h2> <h2> Proposals Info </h2></div>

      <div className='pos'><form onSubmit={e => executeProposal(e)}>
      <input type = 'number' placeholder="enter id"  />
      <input type = 'submit' />
      </form>

      <div><form onSubmit={e => proposals(e)}>
        <input type = 'number' placeholder="enter id"  />
        <input type = 'submit' />
      </form>
      
      <p> Id: {proposal.id}</p>
      <p> Amount: {proposal.amount}</p>
      <p> Recipient: {proposal.recipient}</p>
      <p> Votes: {proposal.votes}</p>
      <p> End{proposal.end}</p>
      <p> Executed: {JSON.stringify(proposal.executed)}</p></div></div>

      <div className='pos'><h2> Check Investor Status </h2> <h2> Check Investor Shares </h2></div>

      <div className='pos'><div><form onSubmit={e => investorss(e)}>
        <input type = '' placeholder="enter address" />
        <input type = 'submit' />
      </form>

      <p> Is Investor: {JSON.stringify(investor)}</p></div>
    
      <div><form onSubmit={e => sharess(e)}>
        <input type = '' placeholder="enter address"/>
        <input type = 'submit' />
      </form>

      <p> Amount: {shares}</p></div></div>

      <div className='pos'><h2> Redeem Shares </h2> <h2> Transfer Shares </h2></div>

      <div className='pos'><form onSubmit={e => redeemFunds(e)}>
        <input type = '' placeholder="enter amount"/>
        <input type = 'submit' />
      </form>
     
      <form onSubmit={e => transferFunds(e)}>
        <input type = '' placeholder="enter amount"/>
        <input type = '' placeholder="enter address"/>
        <input type = 'submit' />
      </form></div>

      <div className='pos'><h2> Withdraw Ether </h2> <h2> Donate </h2></div>

      <div className='pos'><form onSubmit={e => withdrawFunds(e)}>
        <input type = '' placeholder="enter amount"/>
        <input type = '' placeholder="enter address"/>
        <input type = 'submit' />
      </form>
      
      <form onSubmit={e => fallBack(e)}>
        <input type = '' placeholder="enter amount"/>
        <input type = 'submit' />
      </form></div>

    </div>
)
}

export default App;
