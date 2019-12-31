
const {BlockChain, Transaction} = require('./BlockChain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

//imports your private key
const myKey = ec.keyFromPrivate('1db7b34a60e30513e87ce133e027347110150e61cf8e40ad22d54d1f0a7e46de');

//imports corresponding public key is hex format
const myWalletAddress = myKey.getPublic('hex');

//initialize new BlockChain object
let myChain = new BlockChain();

//creating transactions
const transaction1 = new Transaction(myWalletAddress, 'publicKeyOfReceiver', 10);
//signing transaction with privateKey
transaction1.signTransaction(myKey);
myChain.addTransaction(transaction1);


//these transactions will be pending until they are mined into a block
console.log( '\nStarting the miner.');
myChain.minePendingTransactions(myWalletAddress);

console.log('\nBalance of Carson is', myChain.getBalanceOfAddress(myWalletAddress));

// console.log('\n Starting miner again...');
// myChain.minePendingTransactions(myWalletAddress);
// console.log('\nBalance of Carson is', myChain.getBalanceOfAddress(myWalletAddress));






















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
