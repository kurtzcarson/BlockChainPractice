
// very common cryptographic hashing technique developed by the NSA
const SHA256 = require('crypto-js/sha256');

// utilizing elliptic curves for encrypting data to save space with comparable security
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

// designed to represent our blocks in the blockchain
class Block {

  constructor(timeStamp, transactions, previousHash = '') {
    this.timeStamp = timeStamp; //when the block was created
    this.transactions = transactions; // array of transactions
    this.previousHash = previousHash; // hash value of previous block in chain
    this.hash = this.calculateHash();
    this.nonce = 0; //should make this random later
  }

  calculateHash() {
    //pre: given data of block
    //post: returns a hash value as a string

    //checks data of block and creates unique hashCode for identification (takes in a string)
    return SHA256( this.previousHash + this.timeStamp + JSON.stringify(this.transactions) + this.nonce).toString();

  }

  mineBlock(difficulty) {
    // pre: integer representing the difficulting with higher integers being more difficult
    //post: makes time to mine block (proof of work) more laborious

    //continue changing nonce until zeros on front of hash meet number of zeroes of difficulty
    while (this.hash.substring(0, difficulty) != new Array(difficulty + 1).join("0")) {
      this.hash = this.calculateHash();
      this.nonce++; //arbitrary number added to data to change hash value
    }

    //mainly for debugging purposes
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

  //chain of blocks with array as an underlying implemenation (consider SLL where next references hash value)
  class BlockChain {

    constructor() {

      //first block on chain is called genesis block and initialized manually
      this.chain = [this.createGenesisBlock()];

      //number of leading zeroes hash needs to contain when finding hash
      this.difficulty = 2;

      //an array that holds all transactions that have yet to be processed as previous blocks are being mined
      this.pendingTransactions = [];

      //reward given to miners that mine blocks
      this.miningReward = 50;
    }

    createGenesisBlock() {

      //creates a block with trivial data to start the blockchain
      return new Block( Date.now(), "Genesis Block (No Transactions) ");
    }

    getLatestBlock() {

      //grabs the most recent block of the blockchain
      return this.chain[this.chain.length - 1]
    }

    minePendingTransactions(miningRewardAddress) {
      //pre: public key of the miner
      //post: miner given cryptocurrency award by the network

      //adds the reward as a transaction to the miners address
      this.pendingTransactions.push( new Transaction( null, miningRewardAddress, this.miningReward ) )
      /**** Reconsider ordering of this transaction when having multiple people mining transaction ****/

      //creates a new block with array of pending transactions as the data of the block
      let newBlock = new Block( Date.now(), this.pendingTransactions )
      newBlock.mineBlock(this.difficulty);
      console.log("Block successfully mined.");

      //adds newly mined block to the chain
      this.addBlock(newblock);


    }

    addTransaction(transaction) {
      //pre: non-empty, existent, valid transaction
      //post: adds the transaction to the transactinons array

      //what if transaction does not have a fromAddress bc being paid?
      if(!transaction.fromAddress || !transaction.toAddress ) {
        throw new Error('Transaction must include from and to address');
      }

      //verify that the transaction is valid
      if (!transaction.isValid()) {
        throw new Error('Cannot pass invalid transaction to the chain');
      }

      //veryify that person has enough money to pay transaction
      if (this.getBalanceOfAddress(transaction.fromAddress) < transaction.amount) {
        throw new Error('Not enough money in account for transaction.');
      }

      this.pendingTransactions.push(transaction);

    }

    getBalanceOfAddress(address) {
      //pre: public key
      //post: number of 'coins' associated with public key

      let balance = 0;

      //iterates through each block and corresponding transactions to find transactions involving 'address'
      for (const block of this.chain) {
        for (const transaction of block.transactions) {
          if (transaction.toAddress == address) {
            balance += transaction.amount;
          }
          else if (transaction.fromAddress == address) {
            balance -= transaction.amount;
          }
        }

        //balance associated with the transaction
      } return balance;
    }


    addBlock(newBlock) {
      //pre: given a mined block
      //post: adds the block to the blockchain

      newBlock.previousHash = this.getLatestBlock().hash;
      this.chain.push(newBlock);
      this.pendingTransactions = [];
    }

    isChainValid() {
      //post: returns true if chain is valid

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
      //pre: signingKey pair of private and public values for block on chain
      //post: create verifiable signiture tied to transaction

      //signingKey is object received from elliptic library i.e ec.genKeyPair();

      if(signingKey.getPublic('hex') != this.fromAddress) {
        throw new Error("You cannot sign transaction for other wallets");
      }

      //calculates hash of transaction (unique with data and public key of sender)
      const hashTrans = this.calculateHash();

      //creates a signiture with the hash of the transaction
      const signiture = signingKey.sign(hashTrans, 'base64');
      this.signiture = signiture.toDER('hex');

    }

    isValid() {

      //if payment for mining a block with no from address or genesis block
      if (this.fromAddress == null) return true;

      //if there is no signiture or is empty
      if(!this.signiture || this.signiture.length == 0) {
        throw new Error('No signiture in this transaction.')
      }

      //public key of the specified address
      const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');

      //verifies the hash of the transaction equals the signiture with the publicKey being the sender
      return publicKey.verify(this.calculateHash(), this.signiture);

    }

    getToAddress() {
      return this.toAddress;
    }

    getFromAddress() {
      return this.fromAddress;
    }

    getSigniture() {
      return this.signiture;
    }
}


module.exports.BlockChain = BlockChain;
module.exports.Transaction = Transaction;
