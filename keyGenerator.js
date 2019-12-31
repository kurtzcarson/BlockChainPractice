
//Utilize elliptic curve cryptographic strategy (vs RSA) to save key space
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

//asymmetric encryption method to verify public and private keys between parties transacting
const key = ec.genKeyPair();
const publicKey = key.getPublic('hex');
const privateKey = key.getPrivate('hex');

console.log();
console.log('Private Key', privateKey);

console.log();
console.log('Public Key', publicKey);
