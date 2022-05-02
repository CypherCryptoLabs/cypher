const net = require('net');
const server = net.createServer();
const crypto = require('crypto');
const BigNumber = require('bignumber.js');
const { resolve } = require('path');

class networking {

   server = net.createServer();

   constructor(host, port, bcrypto, transactionQueue, stableNode, stableNodePort, blockchain) {
      this.host = host;
      this.port = port;
      this.nodeList = new Array();
      this.stableNode = stableNode;
      this.stableNodePort = stableNodePort;
      this.bcrypto = bcrypto;
      this.transactionQueue = transactionQueue;
      this.registerToNetwork();
      this.potentialBlock;
      this.forger;
      this.validators;
      this.signatures = {};
      this.blockchain = blockchain;
   }

   async broadcastToRandomNodes(packet, numOfRandomPeers = -1) {
      if (numOfRandomPeers == -1) {
         numOfRandomPeers = this.nodeList.length;
      } else {
         var numOfRandomPeers = (numOfRandomPeers > this.nodeList.length) ? this.nodeList.length - 1 : 8;
      }
      var notifiedNodes = [this.host];
      var successfullyNotifiedNodes = [this.host];

      while (successfullyNotifiedNodes.length - 1 < numOfRandomPeers && notifiedNodes.length - 1 < this.nodeList.length) {
         var randomNodeIndex = Math.floor(Math.random() * (this.nodeList.length));
         var randomNode = this.nodeList[randomNodeIndex];

         if (notifiedNodes.indexOf(randomNode.ipAddress) == -1 && successfullyNotifiedNodes.indexOf(randomNode.ipAddress) == -1) {
            let client = new net.Socket();

            var randomNodeNotified = new Promise(function (resolve, reject) {
               client.connect(randomNode.port, randomNode.ipAddress, () => {
                  //console.log(`client connected to ${randomNode.ipAddress}:${randomNode.port}`);

                  client.write(JSON.stringify(packet));
                  client.end();
               });

               client.on('data', (data) => {
                  data = data.toString();
                  //console.log(data);
                  resolve();
                  client.destroy();
               });

               // Add a 'close' event handler for the client socket 
               client.on('close', () => {
                  //console.log('Client closed');
               });

               client.on('error', (err) => {
                  console.error(err);
                  reject();
               });
            });

            try {
               var x = await randomNodeNotified;
               successfullyNotifiedNodes.push(randomNode.ipAddress);
            } catch (error) {
               //console.log(error);
            }

            notifiedNodes.push(randomNode.ipAddress);
         }

      }
   }

   async syncBlockchain() {
      var syncSuccessful = false;

      /*var packet = {queryID:5, unixTimestamp: Date.now(), type: "request", payload:{blockHeight:JSON.parse(this.blockchain.getNewestBlock()).id}, publicKey: this.bcrypto.getPubKey().toPem()};
      var packetCopy = JSON.parse(JSON.stringify(packet));
      delete packetCopy.queryID;
      packet.signature = this.bcrypto.sign(JSON.stringify(packetCopy));*/
      var packet = this.createPacket(5, {type: "request", blockHeight:JSON.parse(this.blockchain.getNewestBlock()).id});

      var newBlocks = "";

      while(!syncSuccessful && this.nodeList.length > 1) {
         let randomNodeIndex = Math.floor(Math.random() * (this.nodeList.length));
         if(this.nodeList[randomNodeIndex].publicKey != this.bcrypto.getPubKey().toPem()) {
            var blockchainSyncSuccessPromise = new Promise((resolve, reject) => {
               let client = new net.Socket();
               client.connect(this.nodeList[randomNodeIndex].port, this.nodeList[randomNodeIndex].ipAddress, () => {
                  client.write(JSON.stringify(packet));
               });

               client.on('data', (data) => {
                  newBlocks = data.toString();
                  resolve();
               })

               client.on('error', (error) => {
                  console.log(error);
                  reject();
               })
            });

            try {
               await blockchainSyncSuccessPromise;
               //console.log(newBlocks);
               
               var blockchainUpdate = JSON.parse(newBlocks).blocks;
               var newestBlock = JSON.stringify(blockchainUpdate[blockchainUpdate.length - 1]);
               console.log(newestBlock);

               /*var validatePacket = {queryID:5, unixTimestamp: Date.now(), type: "verification", payload:{hash:this.bcrypto.hash(newestBlock)}, publicKey: this.bcrypto.getPubKey().toPem()};
               var validatePacketCopy = JSON.parse(JSON.stringify(validatePacket));
               delete validatePacketCopy.queryID;
               validatePacket.signature = this.bcrypto.sign(JSON.stringify(validatePacketCopy));*/

               var validatePacket = this.createPacket(5, {type: "verification", hash:this.bcrypto.hash(newestBlock)});

               let validationRandomNode = Math.floor(Math.random() * (this.nodeList.length));
               var blockchainValidateSuccessPromise = new Promise((resolve, reject) => {
                  let validateClient = new net.Socket();
                  validateClient.connect(this.nodeList[validationRandomNode].port, this.nodeList[validationRandomNode].ipAddress, () => {
                     validateClient.write(JSON.stringify(validatePacket));
                  });
   
                  validateClient.on('data', (data) => {
                     if(JSON.parse(data.toString()).status) {
                        resolve();
                     } else {
                        reject();
                     }
                  })
   
                  validateClient.on('error', (error) => {
                     console.log(error);
                     reject();
                  })
               });

               await blockchainValidateSuccessPromise;

               if(blockchainUpdate.length > 1) {
                  var syncIsInvalid = false;
                  if(this.bcrypto.hash(this.blockchain.getNewestBlock()) != blockchainUpdate[1].previousBlockHash)
                     syncIsInvalid = true;
                  
                  for(var i = 2; i < blockchainUpdate.length && !syncIsInvalid; i++) {
                     if(this.bcrypto.hash(JSON.stringify(blockchainUpdate[i-1])) != blockchainUpdate[i].previousBlockHash)
                        syncIsInvalid = true;
                  }

                  if(syncIsInvalid)
                     throw "one or more blocks are invalid!";

                  for(var i = 1; i < blockchainUpdate.length; i++) {
                     this.blockchain.appendBlockToBlockchain(blockchainUpdate[i]);
                  }
               }

               syncSuccessful = true;

            } catch (error) {
               console.log(error);
            }
         }
      }
   }

   async registerToNetwork() {
      this.addNodeToNodeList({ payload: { ipAddress: this.host, port: this.port }, publicKey: this.bcrypto.getPubKey(true) });

      /*var packet = {
         queryID: 2,
         unixTimestamp: Date.now(),
         payload: {
            ipAddress: this.host,
            port: this.port
         },
         publicKey: this.bcrypto.getPubKey().toPem(),
         signature: ""
      }

      var packetCopy = JSON.parse(JSON.stringify(packet));

      delete packetCopy.queryID;
      delete packetCopy.signature;

      packet.signature = this.bcrypto.sign(JSON.stringify(packetCopy));*/
      var _this = this;

      var packet = this.createPacket(2, {ipAddress: this.host, port: this.port});

      // send it to the stableNode
      var registration = new Promise(function (resolve, reject) {
         var client = new net.Socket();
         client.connect(_this.stableNodePort, _this.stableNode, () => {
            //console.log(`client connected to ${_this.stableNode}:${_this.port}`);

            client.write(JSON.stringify(packet));
            client.end();
         });

         client.on('data', (data) => {
            data = JSON.parse(data);
            for (var i in data) {
               _this.addNodeToNodeList({ payload: { ipAddress: data[i].ipAddress, port: data[i].port }, publicKey: data[i].publicKey });
            }

            client.destroy();
            resolve();
         });

         // Add a 'close' event handler for the client socket 
         client.on('close', () => {
            //console.log('Client closed');
         });

         client.on('error', (err) => {
            console.error(err);
            reject();
         });
      });

      try {
         await registration;
         for (var i = 0; i < this.nodeList.length; i++) {
            var registeredToNode = new Promise(function (resolve, reject) {
               var client = new net.Socket();
               client.connect(_this.nodeList[i].port, _this.nodeList[i].ipAddress, () => {
                  client.write(JSON.stringify(packet));
                  client.end();
                  resolve();
               });

               client.on('error', (err) => {
                  console.error(err);
                  reject();
               });
            });

            try { await registeredToNode; } catch (error) { /*console.log(error)*/ }
         }
      } catch (error) {
         //console.log(error);
      }

      this.syncBlockchain();
   }

   addNodeToNodeList(packet) {
      var newNode = {
         ipAddress: packet.payload.ipAddress,
         port: packet.payload.port,
         publicKey: packet.publicKey,
         blockchainAddress: this.bcrypto.getFingerprint(packet.publicKey)
      };
      var nodeIsAlreadyRegistered = false;
      var nodeIndex = -1;

      for (var i = 0; i < this.nodeList.length && !nodeIsAlreadyRegistered; i++) {
         if (JSON.stringify(this.nodeList[i].publicKey) == JSON.stringify(packet.publicKey)) {
            nodeIsAlreadyRegistered = true;
            nodeIndex = i;
         }
      }

      if (!nodeIsAlreadyRegistered) {
         this.nodeList.push(newNode);
      } else {
         this.nodeList.splice(nodeIndex, 1);
         this.nodeList.push(newNode);
      }
   }

   async isReachable(address, port) {
      let _this = this;
      var isReachable = false;

      var nodeIsReachablePromise = new Promise((resolve, reject) => {

         var socket = new net.Socket();

         socket.connect(port, address, () => {
            let packet = _this.createPacket(6, []);
            socket.write(packet);
         })

         socket.on('data', (data) => {
            var timestamp = JSON.parse(data.toString()).timestamp;

            if(timestamp < Date.now() && timestamp >= Date.now() - 60000) {
               isReachable = true;
               socket.destroy();
               resolve();
            } else {
               socket.destroy();
               resolve();
            }
         })

         socket.on('error', (error) => {
            console.log(error);
            reject();
         })
      })

      try {
         await nodeIsReachablePromise;
         console.log(isReachable);
         return isReachable;
      } catch(error) {
         console.log(error);
         return false;
      }
   }

   connectionHandler() {
      server.listen(this.port, this.host, () => {
         console.log(`Node listening on ${this.host}:${this.port}`);
      });

      server.on('connection', (socket) => {
         var clientAddress = `${socket.remoteAddress}:${socket.remotePort}`;

         socket.on('data', (data) => {
            //console.log("received :"  + data.toString());
            // handle incomming data
            if (this.verrifyPacket(data.toString())) {
               var packet = JSON.parse(data.toString());

               switch (packet.queryID) {
                  case 1:
                     let status = this.transactionQueue.addTransaction(JSON.parse(data.toString()))
                     socket.write(JSON.stringify({ status: status }));

                     if (status) {
                        this.broadcastToRandomNodes(packet, 8);
                     }

                     break;
                  case 2:
                     if(this.isReachable(packet.payload.ipAddress, packet.payload.port)) {
                        this.addNodeToNodeList(packet);
                        socket.write(JSON.stringify(this.nodeList));
                     } else {
                        socket.write(this.createPacket(2, {status:false}));
                     }
                     break;

                  case 3:
                     if(packet.payload.type == "request")
                        socket.write(JSON.stringify(this.potentialBlock));

                     if(packet.payload.type == "vote") {
                        var blockToVoteOnCopy;
                        if(typeof this.potentialBlock == "string") {
                           blockToVoteOnCopy = JSON.parse(this.potentialBlock);
                        } else if(typeof this.potentialBlock == "object") {
                           blockToVoteOnCopy = JSON.parse(JSON.stringify(this.potentialBlock));
                        }
                        delete blockToVoteOnCopy.validators;

                        var senderIsValidator = false;
                        if(this.validators != undefined && this.validators.hasOwnProperty('length')) {
                           for(var i = 0; i < this.validators.length; i++) {
                              if(packet.publicKey == this.validators[i].publicKey)
                                 senderIsValidator = true;
                           }
                        }

                        if(this.bcrypto.verrifySignature(packet.payload.signature, packet.publicKey, JSON.stringify(blockToVoteOnCopy)) && senderIsValidator) {
                           this.signatures[this.bcrypto.getFingerprint(packet.publicKey)] = packet.payload.signature;
                        }
                     }
                               
                     break;

                  case 4:

                     if(JSON.parse(this.blockchain.getNewestBlock()).id == packet.payload.block.id - 1) {
                        socket.write(JSON.stringify({ status: true }));
                        this.broadcastToRandomNodes(packet);

                        if(this.blockchain.addBlockToQueue(packet.payload.block)) {
                           this.blockchain.appendBlockToBlockchain();
                           this.transactionQueue.clean(packet.payload.block.payload);
                        }
                     } else {
                        socket.write(JSON.stringify({ status: false }));
                     }

                     break;
                  case 5:
                        if(packet.payload.type == "request")
                           socket.write(this.blockchain.getNewestNBlocks(packet.payload.blockHeight));
                        
                        if(packet.payload.type == "verification") {
                           socket.write("{\"status\":" + (this.bcrypto.hash(JSON.stringify(JSON.parse(this.blockchain.getNewestBlock()))) == packet.payload.hash) + "}");
                        }

                     break;
                  case 6:
                     socket.write("{\"timestamp\":" + Date.now() + "}");
                     break;
               }
            }
            socket.end();
            socket.destroy();
         });

         socket.on('error', (err) => {
            //console.log(`[` + Date.now().toString + `] Error occurred in ${clientAddress}: ${err.message}`);
         });
      });
   }

   verrifyPacket(packetJSON) {
      try {
         let packet = JSON.parse(packetJSON);
         var packetCopy = JSON.parse(packetJSON);

         if(JSON.stringify(Object.getOwnPropertyNames(packet)) != JSON.stringify(["queryID", "unixTimestamp", "payload", "publicKey", "signature"]))
            return false;

         delete packetCopy.queryID;
         delete packetCopy.signature;

         if(!this.bcrypto.verrifySignature(packet.signature, packet.publicKey, JSON.stringify(packetCopy)))
            return false;
         
         switch (packet.queryID) {
            case 1:
               break;
            case 2:
               break;
            case 3:
               break;
            case 4:
               break;
            case 5:
               break;
            case 6:
               break;
            default:
               return false;
               break;
         }

         return true;
      } catch (error) {
         console.log(error);
         return false;
      }
   }

   pickValidators(latestBlockHash, nextVotingSlot) {
      var validators = {validators:[], forger:{}};

      let numOfValidators = (this.nodeList.length - 1 < 128) ? this.nodeList.length - 1 : 128;
      var forgerAproximateAddress = new BigNumber(this.bcrypto.hash(latestBlockHash + nextVotingSlot), 16);


      var forgerAddress = new BigNumber("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff", 16);
      var forgerAddressDifference = new BigNumber("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff", 16);

      for(var i = 0; i < numOfValidators; i++) {

         var difference = forgerAproximateAddress.minus(this.nodeList[i].blockchainAddress, 16);
         if(difference.isNegative())
            difference = difference.negated();

         if(difference.lt(forgerAddressDifference)) {
            validators.forger = this.nodeList[i];
            forgerAddress = new BigNumber(this.nodeList[i].blockchainAddress, 16);
            forgerAddressDifference = difference;
         }
      }

      var validatorAproximateAddress = forgerAproximateAddress;
      while(validators.validators.length < numOfValidators) {
         validatorAproximateAddress = this.bcrypto.hash(validatorAproximateAddress.toString(16));

         var nodeListCopy = JSON.parse(JSON.stringify(this.nodeList));
         nodeListCopy.push({blockchainAddress: validatorAproximateAddress});
         
         nodeListCopy = nodeListCopy.sort((a, b) => (a.blockchainAddress > b.blockchainAddress) ? 1 : -1);
         var index = nodeListCopy.map(function(e) { return e.blockchainAddress; }).indexOf(validatorAproximateAddress);

         var indexesToAdd = new Array();
         if(index == 0) {
            indexesToAdd.push(index + 1);
         } else if(index == nodeListCopy.length - 1) {
            indexesToAdd.push(index - 1);
         } else {
            indexesToAdd.push(index - 1);
            indexesToAdd.push(index + 1);
         }

         for(var i = 0; i < indexesToAdd.length; i++) {
            if(validators.validators.map(function(e) { return e.blockchainAddress; }).indexOf(nodeListCopy[indexesToAdd[i]].blockchainAddress) == -1 && 
            validators.forger.blockchainAddress != nodeListCopy[indexesToAdd[i]].blockchainAddress) {
               validators.validators.push(nodeListCopy[indexesToAdd[i]]);
            }
         }
      }

      this.validators = validators.validators;
      this.forger = validators.forger;
      
      return validators;

   }

   async voteOnBlock(forger, currentVotingSlot, validators, transactionQueue) {
      var client = new net.Socket();
      var blockToVoteOn;

      var retrieveBlockPromise = new Promise((resolve, reject) => {
         client.connect(forger.port, forger.ipAddress, () => {
            /*var packet = {queryID:3, unixTimestamp: Date.now(), type:"request", publicKey:this.bcrypto.getPubKey().toPem()};
            var packetCopy = JSON.parse(JSON.stringify(packet));
            delete packetCopy.queryID;
   
            packet.signature = this.bcrypto.sign(JSON.stringify(packetCopy));*/
            var packet = this.createPacket(3, {type: "request"});
   
            client.write(JSON.stringify(packet))
         });
   
         client.on('data', (data) => {
            blockToVoteOn = data.toString();
            resolve();
         });

         client.on('error', (error) => {
            reject();
         })
      })

      var transactionQueueCopy = JSON.parse(JSON.stringify(transactionQueue));
      transactionQueueCopy.forEach(object => {
         delete object["queryID"];
      });

      try {
         await retrieveBlockPromise;
         if (this.blockchain.validateBlock(blockToVoteOn, currentVotingSlot, validators, forger, transactionQueueCopy)) {
            // send signature to Forger
            this.updatePotentialBlock(blockToVoteOn);
            var blockToVoteOnCopy = JSON.parse(blockToVoteOn);
            delete blockToVoteOnCopy.validators;

            var blockVoteSignature = this.bcrypto.sign(JSON.stringify(blockToVoteOnCopy));
            /*var packetVote = {queryID:3, unixTimestamp: Date.now(), type:"vote", payload: {signature:blockVoteSignature},publicKey:this.bcrypto.getPubKey().toPem()};
            var packetVoteCopy = JSON.parse(JSON.stringify(packetVote));
            delete packetVoteCopy.queryID;
   
            packetVote.signature = this.bcrypto.sign(JSON.stringify(packetVoteCopy));*/
            var packetVote = this.createPacket(3, {type: "vote", signature: blockVoteSignature});

            for(var i = 0; i < validators.length; i++) {
               if(validators[i].publicKey != this.bcrypto.getPubKey(true)) {
                  let z = i;
                  let clientVote = new net.Socket();
                  //console.log(validators[z]);
                  clientVote.connect(validators[z].port, validators[z].ipAddress, () => {
                     //console.log("send vote package (" + validators[z].ipAddress + ":" + validators[z].port + "): " + JSON.stringify(packetVote));
            
                     clientVote.write(JSON.stringify(packetVote))
                  });
            
                  clientVote.on('data', (data) => {
                  });
         
                  clientVote.on('error', (error) => {
                  })
               }
            }

            var timeToWait = currentVotingSlot + 15000 - Date.now();

            var sleepPromise = new Promise((resolve) => {
               setTimeout(resolve, timeToWait);
            });
            await sleepPromise;
            
            var votes = this.signatures;
            this.signatures = {};

            if(votes != undefined && Object.keys(votes).length >= ((Object.keys(validators).length / 2) - 1)) {
               var votedBlock = JSON.parse(blockToVoteOn);

               for(var i = 0; i < Object.keys(votes).length; i++) {
                  votedBlock.validators[Object.keys(votes)[i]] = votes[Object.keys(votes)[i]];
               }
               
               votedBlock.validators[this.bcrypto.getFingerprint()] = blockVoteSignature;
               var broadcastPacket = {queryID:4, unixTimestamp: Date.now(), payload: {block:votedBlock},publicKey:this.bcrypto.getPubKey().toPem()};
               var broadcastPacketCopy = JSON.parse(JSON.stringify(broadcastPacket));
               delete broadcastPacketCopy.queryID;
      
               broadcastPacket.signature = this.bcrypto.sign(JSON.stringify(broadcastPacketCopy));

               this.broadcastToRandomNodes(broadcastPacket);

            }

         }
      } catch (error) {
         console.log(error);
      }
   }

   async updatePotentialBlock(potentialBlock) {
      this.potentialBlock = potentialBlock;
      //console.log(this.potentialBlock);

      var sleepPromise = new Promise((resolve) => {
         setTimeout(resolve, 15000);
      });
      await sleepPromise;

      this.potentialBlock = {};
   }

   getVotes() {
      return this.signatures;
   }

   createPacket(queryID, payload) {
      var packet = {
         queryID:queryID, 
         unixTimestamp: Date.now(),
         payload:{payload}, 
         publicKey: this.bcrypto.getPubKey().toPem()
      };

      var packetCopy = JSON.parse(JSON.stringify(packet));
      delete packetCopy.queryID;
      packet.signature = this.bcrypto.sign(JSON.stringify(packetCopy));

      return JSON.stringify(packet);
   }

}

module.exports = networking;