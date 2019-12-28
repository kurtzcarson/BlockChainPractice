
// very common cryptographic hashing technique developed by the NSA
const SHA256 = require('crypto-js/sha256');

// designed to represent our blocks in the blockchain
class Block {

  // index: optional / where the block sits on chain
  // timeStamp: when block was created
  //transaction data: any data associated with block (details of transactions)
  //previousHash: string that contains hash of block before


  constructor(timeStamp, transactions, previousHash = '') {
    this.timeStamp = timeStamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
    this.nonce = 0; //should make this random later
  }

  //can consider building my own hashing function instead of library
  calculateHash() {
    //checks data of block and creates unique hashCode for identification
    return SHA256( this.previousHash + this.timeStamp + JSON.stringify(this.transactions) + this.nonce).toString();
  }

  mineBlock(difficulty) {
    //proof of work or mining/ set difficulty so steady amount of new blocks/ no overflow or hacking

    //guarentees all hash values are below some target hash...keeps calculating until finds a nonce that derives small hash based on unique data
    while (this.hash.substring(0, difficulty) != new Array(difficulty + 1).join("0")) {
      this.hash = this.calculateHash();
      this.nonce++; // avoids infinite while loop
    }

    console.log("Block mined: " + this.hash);

  }
}

  class BlockChain {

    constructor() {
      //first block on chain is called genesis block and initialized manually
      this.chain = [this.createGenesisBlock()]; // consider making this a LinkedList

      //helps control howcleard fast new blocks can be added to the blockchain
      this.difficulty = 5;

      //an array that holds all transactions that have yet to be processed as previous blocks are being mined
      this.pendingTransactions = [];
      this.miningReward = 50;
    }

    createGenesisBlock() {
      return new Block("12,23/19", "Genesis Block", "0");
    }

    getLatestBlock() {
      return this.chain[this.chain.length - 1]
    }

    minePendingTransactions(miningRewardAddress) {
      //if person with mining address successfully finds hash first, then send mining reward to them

      let block = new Block( Date.now(), this.pendingTransactions )
      block.mineBlock(this.difficulty);

      console.log("Block successfully mined.");
      this.chain.push(block);

      //does not have a from address/ algorithm just gives it to you
      this.pendingTransactions = [ new Transaction(null, miningRewardAddress, this.miningReward ) ];
    }

    createTransaction(transaction) {

      this.pendingTransactions.push(transaction);
      //need to guarentee that amount of fromAddress is valid and can be paid
    }

    getBalanceOfAddress(address) {
      //go through entire blockChain and find all blocks associated with your address to find your balance

      let balance = 0;

      //should consider improving this run time/ each person has calculated balance
      for (const block of this.chain) {
        for (const transaction of block.transactions) {

          if (transaction.toAddress == address) {
            balance += transaction.amount;
          }
          else if (transaction.fromAddress == address) {
            balance -= transaction.amount;
          }
        }
      } return balance;
    }


    addBlock(newBlock) {
      //really should have more checks in place before adding to the chain

      newBlock.previousHash = this.getLatestBlock().hash;
      newBlock.mineBlock(this.difficulty);
      this.chain.push(newBlock);
    }

    isChainValid() {
      //return true if chain is valid

      //checking if blocks are properly linked together
      for (let i = 1; i < this.chain.length; i++) {
        const currentBlock = this.chain[i];
        const previousBlock = this.chain[i-1];

        if (currentBlock.hash != currentBlock.calculateHash()) {
          return false; //actual hash is not accurate
        }
        if (currentBlock.previousHash != previousBlock.hash) {
          return false; // does not point to the proper block
        }
      }

      return true;

    }
  }

  class Transaction {

    constructor(fromAddress, toAddress, amount) {
      this.fromAddress = fromAddress;
      this.toAddress = toAddress;
      this.amount = amount;
    }
  }




  let myChain = new BlockChain();

  //names should be the public key of someone's wallet
  //these transactions will be pending until they are mined into a block
  myChain.createTransaction( new Transaction( 'Mark', 'Henry', 100));
  myChain.createTransaction( new Transaction( 'Henry', 'Mark', 20));

  console.log( '\nStarting the miner.');
  myChain.minePendingTransactions('Carson Address');

  console.log('\n Balance of Mark is', myChain.getBalanceOfAddress('Mark'));
  console.log('\n Balance of Henry is', myChain.getBalanceOfAddress('Henry'));
  console.log('\nBalance of Carson is', myChain.getBalanceOfAddress('Carson Address'));

  console.log( '\nStarting the miner again...');
  myChain.minePendingTransactions('Carson Address');

  console.log('\nBalance of Carson is', myChain.getBalanceOfAddress('Carson Address'));




















  // //data can be anything I want
  // console.log("Mining Block 1...");
  // myChain.addBlock( new Block(1, "12/23/2019", {amount: 4}));
  //
  // console.log("Mining Block 2...");
  // myChain.addBlock( new Block(2, "12/24 /2019", {amount: 10}) );
  //
  //
  //
  // //never delete or change a block to keep the blockChain valid/true
  // // myChain.chain[1].data = { amount: 100 };
  // // myChain.chain[1].hash = myChain.chain[1].calculateHash(); // the relationship with previousBlock now broken
  // //
  // // console.log('Is blockchain valid? ' + myChain.isChainValid());
  // //
  // // console.log(JSON.stringify(myChain, null, 4));
  //
  // /*
  // *
  // * Things to implement: block breaks chain need to 'rollback changes' and put blockchain back into original state
  // * Proof of work/ peer to peer network/ need to check if have funds to make a transaction
  // *
  // */
