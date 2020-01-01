
const {BlockChain, Transaction} = require('./BlockChain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const networkKey = ec.keyFromPrivate('f842e7f16c6b9689e3716730af7c2cf103c64adca80f2a8f0ff715848d618a31');
//imports private key (same one as keyGenerator.js)
const myKey = ec.keyFromPrivate('1db7b34a60e30513e87ce133e027347110150e61cf8e40ad22d54d1f0a7e46de');

//imports corresponding public key is hex format
const myWalletAddress = myKey.getPublic('hex');
const networkAddress = networkKey.getPublic('hex');

//initialize new BlockChain object
let myChain = new BlockChain();

//creating transactions
const transaction = new Transaction(networkAddress, myWalletAddress, 100);
const transaction1 = new Transaction(myWalletAddress, networkAddress, 30);
//signing transaction with privateKey
transaction1.signTransaction(myKey);
transaction.signTransaction(networkKey);
myChain.addTransaction(transaction);
myChain.addTransaction(transaction1);


//these transactions will be pending until they are mined into a block
console.log( '\nStarting the miner.');
myChain.minePendingTransactions(myWalletAddress);

console.log('\nBalance of Carson is', myChain.getBalanceOfAddress(myWalletAddress));
