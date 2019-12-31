
// very common cryptographic hashing technique developed by the NSA
const SHA256 = require('crypto-js/sha256');

// utilizing elliptic curves for encrypting data to save space for comparable security
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

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

  hasValidTransactions() {

    //checks each transaction in the block
    for (const trans of this.transactions) {

      //if transaction is not valid
      if (!trans.isValid()) return false;
    }

    return true;
  }
}

  class BlockChain {

    constructor() {
      //first block on chain is called genesis block and initialized manually
      this.chain = [this.createGenesisBlock()]; // consider making this a LinkedList

      //helps control howcleard fast new blocks can be added to the blockchain
      this.difficulty = 2;

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

    addTransaction(transaction) {

      //what if transaction does not have a fromAddress bc being paid?
      if(!transaction.fromAddress || !transaction.toAddress ) {
        throw new Error('Transaction must include from and to address');
      }

      //verify that the transaction is valid
      if (!transaction.isValid()) {
        throw new Error('Cannot pass invalid transaction to the chain');
      }

      //need to verify that the fromAddress has high enough balance to guarentee transaction
      this.pendingTransactions.push(transaction);

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

        if (!currentBlock.hasValidTransactions()) return false;

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

    calculateHash() {
      return SHA256(this.fromAddress + this.toAddress + this.amount).toString()
    }

    signTransaction(signingKey) {

      if(signingKey.getPublic('hex') != this.fromAddress) {
        throw new Error("You cannot sign transaction for other wallets");
      }

      //signingKey is object received from elliptic library i.e ec.genKeyPair();
      const hashTrans = this.calculateHash();
      const signiture = signingKey.sign(hashTrans, 'base64');
      this.signiture = signiture.toDER('hex');

    }

    isValid() {

      //if payment for mining a block with no from address
      if (this.fromAddress == null) return true;

      //if there is no signiture or is empty
      if(!this.signiture || this.signiture.length == 0) {
        throw new Error('No signiture in this transaction.')
      }

      //if there is a signiture, but need to verify it's correct
      const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
      return publicKey.verify(this.calculateHash(), this.signiture);

    }
}


module.exports.BlockChain = BlockChain;
module.exports.Transaction = Transaction;
