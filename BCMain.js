
// very common cryptographic hashing technique developed by the NSA
const SHA256 = require('crypto-js/sha256.js');

// designed to represent our blocks in the blockchain
class Block {

  // index: optional / where the block sits on chain
  // timeStamp: when block was created
  //transaction data: any data associated with block (details of transactions)
  //previousHash: string that contains hash of block before


  constructor(index, timeStamp, data, previousHash = '') {
    this.index = index;
    this.timeStamp = timeStamp;
    this.data = data;
    this.previousHash = previousHash;

    //holds the hash of our block
    this.hash = calculatehash();
  }

  //can consider building my own hashing function instead of library
  calculatehash() {
    //checks data of block and creates unique hashCode for identification
    return SHA256( this.index + this.previousHash + this.timeStamp + JSON.stringify(this.data).toString() );
  }

  class BLockChain {

    constructor() {
      //first block on chain is called genesis block and initialized manually
      this.chain = [createGenesisBlock]; // consider making this a LinkedList
    }

    createGenesisBlock() {
      return new Block(0, "12,23/19", "Genesis Block", "0");
    }

    getLatestBlock() {
      return this.chain[this.chain.length-1]
    }

    addBlock(newBlock) {
      //really should have more checks in place before adding to the chain

      newBlock.previousHash = this.getLatestBlock().hash;
      newBlock.hash = newBlock.calculateHash();
      this.chain.push(newBlock);
    }
  }
}
