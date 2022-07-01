const fs = require("fs");
const BCrypto = require("../src/bcrypto");
const Blockchain = require("../src/blockchain")
const Networking = require("../src/networking")
const bcrypto = new BCrypto("");
const blockchain = new Blockchain(bcrypto);
const networking = new Networking();

var newestBlock;
var nextBlock;

test("creates cache file", () => {
    expect(fs.existsSync("private.pem")).toBe(true);
})

test("Cache file populated", () => {
    expect(fs.readFileSync("cache.json").toString("utf-8")).toBe('{"01b364f173998197db2d4924d00ea41c38c0693245826502c78b5493e2e46936":{"balance":24999994.999,"balanceChanges":[0,1,2]},"e12a31ecaf53389b7ed9063dd48292a50015414466fc9777c0a45cb6d5e59233":{"balance":1,"balanceChanges":[1]},"0000000000000000000000000000000000000000000000000000000000000000":{"balance":3,"balanceChanges":[1,2]},"1b9e59b69808320df10583bbb4d3204ac2a8c78a377348010c65ac671c8909ea":{"balance":2,"balanceChanges":[2]}}');
})

test("Cache loading", () => {
    expect(JSON.stringify(blockchain.addressCache)).toBe('{"01b364f173998197db2d4924d00ea41c38c0693245826502c78b5493e2e46936":{"balance":24999994.999,"balanceChanges":[0,1,2]},"e12a31ecaf53389b7ed9063dd48292a50015414466fc9777c0a45cb6d5e59233":{"balance":1,"balanceChanges":[1]},"0000000000000000000000000000000000000000000000000000000000000000":{"balance":3,"balanceChanges":[1,2]},"1b9e59b69808320df10583bbb4d3204ac2a8c78a377348010c65ac671c8909ea":{"balance":2,"balanceChanges":[2]}}');
})

test("get newest Block", () => {
    newestBlock = JSON.parse(blockchain.getNewestBlock());
    expect(newestBlock).toStrictEqual(JSON.parse("{\"id\":2,\"timestamp\":1655896980042,\"previousBlockHash\":\"7aef73ae79c557a928ff2fa13d1c3ad382a0c51eb501582c383e8e155bd00b58\",\"rewardAddress\":\"1b9e59b69808320df10583bbb4d3204ac2a8c78a377348010c65ac671c8909ea\",\"rewardAmount\":2,\"payloadHash\":\"d4edecafcde579ece1fba4c7f6755fddc8aab1b1f70cf225c3a38ef21d8434f8\",\"payload\":[{\"unixTimestamp\":1655896899186,\"payload\":{\"blockchainSenderAddress\":\"01b364f173998197db2d4924d00ea41c38c0693245826502c78b5493e2e46936\",\"blockchainReceiverAddress\":\"0000000000000000000000000000000000000000000000000000000000000000\",\"unitsToTransfer\":1,\"networkFee\":1},\"publicKey\":\"-----BEGIN PUBLIC KEY-----\\nMFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAEJ7QBCmN0/iIzTGwzQ5yKoO1dErex/mOj\\nXxs2K/gEjndXVhLU5+SbIqegAU1KKY9Xjh+AS+YNMbSYgF901gz7YQ==\\n-----END PUBLIC KEY-----\\n\",\"signature\":\"MEYCIQCq+YusbITDhBOjZn0O5U1wg1GuxQPPTIvTXACwoKbfdAIhAMyApb4dGgtcvO+oQz88yrJ8t1nTdf1+63VyG4AU378B\"},{\"unixTimestamp\":1655896899814,\"payload\":{\"blockchainSenderAddress\":\"01b364f173998197db2d4924d00ea41c38c0693245826502c78b5493e2e46936\",\"blockchainReceiverAddress\":\"0000000000000000000000000000000000000000000000000000000000000000\",\"unitsToTransfer\":1,\"networkFee\":1},\"publicKey\":\"-----BEGIN PUBLIC KEY-----\\nMFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAEJ7QBCmN0/iIzTGwzQ5yKoO1dErex/mOj\\nXxs2K/gEjndXVhLU5+SbIqegAU1KKY9Xjh+AS+YNMbSYgF901gz7YQ==\\n-----END PUBLIC KEY-----\\n\",\"signature\":\"MEUCIGuDvh+t8N9MmK67JdjLifEqWl1CfFe4JwywX7yZ6J14AiEAge0akBgdU7cjJc1y8P8wzfJ3DuxTpG3Xr73MGhSvbT8=\"}],\"networkDiff\":{\"registered\":[],\"left\":[]},\"validators\":{\"7d68452d72d1de28c250b6a26150b2080f673b77b4477652228a1df5b4ebffe1\":\"MEQCIAUtvi+FLeuSUHkiMpSO04lotj8YCcBFY4BJ0zGxpPhmAiAoAGJO4AKRtiFmqGwXeVFK10TxJkIzV2y13mue2fsLbA==\",\"01b364f173998197db2d4924d00ea41c38c0693245826502c78b5493e2e46936\":\"MEYCIQDa7SRvY2SF38MV9TuRZvHHwy+EAq5w+P5Gri7nHIyN7QIhAPMUu4gmxh/1JXRar3lnbb0uQCbpgpy3eFcP0l/CT2of\",\"e12a31ecaf53389b7ed9063dd48292a50015414466fc9777c0a45cb6d5e59233\":\"MEUCIQDD0GiXNJZwUw1ROmmFTCJ/6XKfxeRVxB0eUm9ipdGKDAIganXeQeF/iAiQ6Xjr8B4tbecOM4rlYYCU9V9EWclMhd0=\"},\"forgerSignature\":\"MEYCIQCeQCG54DhnYnWaTfSQr4AgMfVA5o5N81a27eZ0zhFfowIhAJCfObd5SaRrO/Wi/O2mfUISIbm2L8s12xJsL8VurhFa\"}"));
})

test("get newest Block without Validators", () => {
    expect(JSON.parse(blockchain.getNewestBlock(true))).toStrictEqual(JSON.parse("{\"id\":2,\"timestamp\":1655896980042,\"previousBlockHash\":\"7aef73ae79c557a928ff2fa13d1c3ad382a0c51eb501582c383e8e155bd00b58\",\"rewardAddress\":\"1b9e59b69808320df10583bbb4d3204ac2a8c78a377348010c65ac671c8909ea\",\"rewardAmount\":2,\"payloadHash\":\"d4edecafcde579ece1fba4c7f6755fddc8aab1b1f70cf225c3a38ef21d8434f8\",\"payload\":[{\"unixTimestamp\":1655896899186,\"payload\":{\"blockchainSenderAddress\":\"01b364f173998197db2d4924d00ea41c38c0693245826502c78b5493e2e46936\",\"blockchainReceiverAddress\":\"0000000000000000000000000000000000000000000000000000000000000000\",\"unitsToTransfer\":1,\"networkFee\":1},\"publicKey\":\"-----BEGIN PUBLIC KEY-----\\nMFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAEJ7QBCmN0/iIzTGwzQ5yKoO1dErex/mOj\\nXxs2K/gEjndXVhLU5+SbIqegAU1KKY9Xjh+AS+YNMbSYgF901gz7YQ==\\n-----END PUBLIC KEY-----\\n\",\"signature\":\"MEYCIQCq+YusbITDhBOjZn0O5U1wg1GuxQPPTIvTXACwoKbfdAIhAMyApb4dGgtcvO+oQz88yrJ8t1nTdf1+63VyG4AU378B\"},{\"unixTimestamp\":1655896899814,\"payload\":{\"blockchainSenderAddress\":\"01b364f173998197db2d4924d00ea41c38c0693245826502c78b5493e2e46936\",\"blockchainReceiverAddress\":\"0000000000000000000000000000000000000000000000000000000000000000\",\"unitsToTransfer\":1,\"networkFee\":1},\"publicKey\":\"-----BEGIN PUBLIC KEY-----\\nMFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAEJ7QBCmN0/iIzTGwzQ5yKoO1dErex/mOj\\nXxs2K/gEjndXVhLU5+SbIqegAU1KKY9Xjh+AS+YNMbSYgF901gz7YQ==\\n-----END PUBLIC KEY-----\\n\",\"signature\":\"MEUCIGuDvh+t8N9MmK67JdjLifEqWl1CfFe4JwywX7yZ6J14AiEAge0akBgdU7cjJc1y8P8wzfJ3DuxTpG3Xr73MGhSvbT8=\"}],\"networkDiff\":{\"registered\":[],\"left\":[]},\"forgerSignature\":\"MEYCIQCeQCG54DhnYnWaTfSQr4AgMfVA5o5N81a27eZ0zhFfowIhAJCfObd5SaRrO/Wi/O2mfUISIbm2L8s12xJsL8VurhFa\"}"));
})

test("get Blocks since Block Height N", () => {
    expect(blockchain.getNewestNBlocks(0)).toStrictEqual(JSON.parse("{\"blocks\":[{\"id\":0,\"timestamp\":1650566995125,\"previousBlockHash\":\"e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855\",\"rewardAddress\":\"01b364f173998197db2d4924d00ea41c38c0693245826502c78b5493e2e46936\",\"rewardAmount\":25000000,\"payload\":[],\"networkDiff\":{\"registered\":[],\"left\":[]}},{\"id\":1,\"timestamp\":1655896860017,\"previousBlockHash\":\"6716e7633c39f7d2632423f83fce1b0001d898e5d14d943c4cfd82e3d4c66cdb\",\"rewardAddress\":\"e12a31ecaf53389b7ed9063dd48292a50015414466fc9777c0a45cb6d5e59233\",\"rewardAmount\":1,\"payloadHash\":\"5af6a2e1160ae892836609216ac5def0efb8397e9fcb5b03ffc8c2a012521cf5\",\"payload\":[{\"unixTimestamp\":1655896751814,\"payload\":{\"blockchainSenderAddress\":\"01b364f173998197db2d4924d00ea41c38c0693245826502c78b5493e2e46936\",\"blockchainReceiverAddress\":\"0000000000000000000000000000000000000000000000000000000000000000\",\"unitsToTransfer\":1,\"networkFee\":0.001},\"publicKey\":\"-----BEGIN PUBLIC KEY-----\\nMFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAEJ7QBCmN0/iIzTGwzQ5yKoO1dErex/mOj\\nXxs2K/gEjndXVhLU5+SbIqegAU1KKY9Xjh+AS+YNMbSYgF901gz7YQ==\\n-----END PUBLIC KEY-----\\n\",\"signature\":\"MEYCIQDvAVMjcRDv5idTHdluJkqXgx3f/qRQofwRDRx9ZGaTfAIhAJueiF8uGVrMsoYIombKLay6fu1EkUIuoLTS7i/VJVkA\"}],\"networkDiff\":{\"registered\":[{\"ipAddress\":\"192.168.178.39\",\"port\":1236,\"publicKey\":\"-----BEGIN PUBLIC KEY-----\\nMFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAEKK5CHMpnX7y9MIVnND3vZLkNGJb9vGyK\\nyqI7i63SrwRsBzJhA5HThTItF4hkJppswskZya0tK3XUQe7D5EUFaw==\\n-----END PUBLIC KEY-----\\n\",\"blockchainAddress\":\"e12a31ecaf53389b7ed9063dd48292a50015414466fc9777c0a45cb6d5e59233\"},{\"ipAddress\":\"192.168.178.39\",\"port\":1234,\"publicKey\":\"-----BEGIN PUBLIC KEY-----\\nMFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAEJ7QBCmN0/iIzTGwzQ5yKoO1dErex/mOj\\nXxs2K/gEjndXVhLU5+SbIqegAU1KKY9Xjh+AS+YNMbSYgF901gz7YQ==\\n-----END PUBLIC KEY-----\\n\",\"blockchainAddress\":\"01b364f173998197db2d4924d00ea41c38c0693245826502c78b5493e2e46936\"},{\"ipAddress\":\"192.168.178.39\",\"port\":1235,\"publicKey\":\"-----BEGIN PUBLIC KEY-----\\nMFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAE6x9RJRVMnhvYlrPtX7Nt5aDNoQp9gkv0\\nZC7uDgXYEFDwK8vOYjhLIC+VIoGNYtPhS0XWUK9kiJyzCqLdgmiR0g==\\n-----END PUBLIC KEY-----\\n\",\"blockchainAddress\":\"1b9e59b69808320df10583bbb4d3204ac2a8c78a377348010c65ac671c8909ea\"},{\"ipAddress\":\"192.168.178.39\",\"port\":1237,\"publicKey\":\"-----BEGIN PUBLIC KEY-----\\nMFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAETYQkPHlXaARBt11Km3DMoTn04wvlECSi\\nDf8e5t2mAaba+hXyuh1UjGlWj6K19UjYthq+nXKUCYHY7vUQ+8Higw==\\n-----END PUBLIC KEY-----\\n\",\"blockchainAddress\":\"7d68452d72d1de28c250b6a26150b2080f673b77b4477652228a1df5b4ebffe1\"}],\"left\":[]},\"validators\":{\"1b9e59b69808320df10583bbb4d3204ac2a8c78a377348010c65ac671c8909ea\":\"MEUCIQC8wb/morIUNT7yijmjIOK9vb+hW+6EfA+aLUCdLVvDtwIgFkkL1zc+Ktj0hhttF8I7Q9IYaIFuTfXSOYbmPm7A6VE=\",\"7d68452d72d1de28c250b6a26150b2080f673b77b4477652228a1df5b4ebffe1\":\"MEUCIQDfTNTC72ctudyU3qcRtu8K0Oc52UzsO4j0IBe40MVw5QIgejXXgj/ePhbFUuWJ9u7dUaiD2KHDwt8zHgUK6gjwm6c=\",\"01b364f173998197db2d4924d00ea41c38c0693245826502c78b5493e2e46936\":\"MEUCIQCTk3VWoKJuVgXsIHNq6hinnVwfHswFr+1G4XB7ZlK9/wIgej29dpL4kjmf65PoUhqv3e1TEJSWvgweijHF9Vy5dWY=\"},\"forgerSignature\":\"MEQCIAYveG4sGJl0BnpFxr9s+0jw9HiTJyU4GhAJb2JVj1vFAiAE6Qd0dgMY3w2vr8YEB5sC7ewKJmIUrjIkrYNlW4mf1Q==\"},{\"id\":2,\"timestamp\":1655896980042,\"previousBlockHash\":\"7aef73ae79c557a928ff2fa13d1c3ad382a0c51eb501582c383e8e155bd00b58\",\"rewardAddress\":\"1b9e59b69808320df10583bbb4d3204ac2a8c78a377348010c65ac671c8909ea\",\"rewardAmount\":2,\"payloadHash\":\"d4edecafcde579ece1fba4c7f6755fddc8aab1b1f70cf225c3a38ef21d8434f8\",\"payload\":[{\"unixTimestamp\":1655896899186,\"payload\":{\"blockchainSenderAddress\":\"01b364f173998197db2d4924d00ea41c38c0693245826502c78b5493e2e46936\",\"blockchainReceiverAddress\":\"0000000000000000000000000000000000000000000000000000000000000000\",\"unitsToTransfer\":1,\"networkFee\":1},\"publicKey\":\"-----BEGIN PUBLIC KEY-----\\nMFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAEJ7QBCmN0/iIzTGwzQ5yKoO1dErex/mOj\\nXxs2K/gEjndXVhLU5+SbIqegAU1KKY9Xjh+AS+YNMbSYgF901gz7YQ==\\n-----END PUBLIC KEY-----\\n\",\"signature\":\"MEYCIQCq+YusbITDhBOjZn0O5U1wg1GuxQPPTIvTXACwoKbfdAIhAMyApb4dGgtcvO+oQz88yrJ8t1nTdf1+63VyG4AU378B\"},{\"unixTimestamp\":1655896899814,\"payload\":{\"blockchainSenderAddress\":\"01b364f173998197db2d4924d00ea41c38c0693245826502c78b5493e2e46936\",\"blockchainReceiverAddress\":\"0000000000000000000000000000000000000000000000000000000000000000\",\"unitsToTransfer\":1,\"networkFee\":1},\"publicKey\":\"-----BEGIN PUBLIC KEY-----\\nMFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAEJ7QBCmN0/iIzTGwzQ5yKoO1dErex/mOj\\nXxs2K/gEjndXVhLU5+SbIqegAU1KKY9Xjh+AS+YNMbSYgF901gz7YQ==\\n-----END PUBLIC KEY-----\\n\",\"signature\":\"MEUCIGuDvh+t8N9MmK67JdjLifEqWl1CfFe4JwywX7yZ6J14AiEAge0akBgdU7cjJc1y8P8wzfJ3DuxTpG3Xr73MGhSvbT8=\"}],\"networkDiff\":{\"registered\":[],\"left\":[]},\"validators\":{\"7d68452d72d1de28c250b6a26150b2080f673b77b4477652228a1df5b4ebffe1\":\"MEQCIAUtvi+FLeuSUHkiMpSO04lotj8YCcBFY4BJ0zGxpPhmAiAoAGJO4AKRtiFmqGwXeVFK10TxJkIzV2y13mue2fsLbA==\",\"01b364f173998197db2d4924d00ea41c38c0693245826502c78b5493e2e46936\":\"MEYCIQDa7SRvY2SF38MV9TuRZvHHwy+EAq5w+P5Gri7nHIyN7QIhAPMUu4gmxh/1JXRar3lnbb0uQCbpgpy3eFcP0l/CT2of\",\"e12a31ecaf53389b7ed9063dd48292a50015414466fc9777c0a45cb6d5e59233\":\"MEUCIQDD0GiXNJZwUw1ROmmFTCJ/6XKfxeRVxB0eUm9ipdGKDAIganXeQeF/iAiQ6Xjr8B4tbecOM4rlYYCU9V9EWclMhd0=\"},\"forgerSignature\":\"MEYCIQCeQCG54DhnYnWaTfSQr4AgMfVA5o5N81a27eZ0zhFfowIhAJCfObd5SaRrO/Wi/O2mfUISIbm2L8s12xJsL8VurhFa\"}]}"));
})

test("getting balance for wallet", () => {
    expect(blockchain.getBalanceForAddress("01b364f173998197db2d4924d00ea41c38c0693245826502c78b5493e2e46936")).toBe(24999994.999);
})

test("generating Node List", () => {
    expect(blockchain.generateNodeList()).toStrictEqual(JSON.parse("{\"blockHeight\":2,\"nodeList\":[{\"ipAddress\":\"192.168.178.39\",\"port\":1236,\"publicKey\":\"-----BEGIN PUBLIC KEY-----\\nMFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAEKK5CHMpnX7y9MIVnND3vZLkNGJb9vGyK\\nyqI7i63SrwRsBzJhA5HThTItF4hkJppswskZya0tK3XUQe7D5EUFaw==\\n-----END PUBLIC KEY-----\\n\",\"blockchainAddress\":\"e12a31ecaf53389b7ed9063dd48292a50015414466fc9777c0a45cb6d5e59233\"},{\"ipAddress\":\"192.168.178.39\",\"port\":1234,\"publicKey\":\"-----BEGIN PUBLIC KEY-----\\nMFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAEJ7QBCmN0/iIzTGwzQ5yKoO1dErex/mOj\\nXxs2K/gEjndXVhLU5+SbIqegAU1KKY9Xjh+AS+YNMbSYgF901gz7YQ==\\n-----END PUBLIC KEY-----\\n\",\"blockchainAddress\":\"01b364f173998197db2d4924d00ea41c38c0693245826502c78b5493e2e46936\"},{\"ipAddress\":\"192.168.178.39\",\"port\":1235,\"publicKey\":\"-----BEGIN PUBLIC KEY-----\\nMFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAE6x9RJRVMnhvYlrPtX7Nt5aDNoQp9gkv0\\nZC7uDgXYEFDwK8vOYjhLIC+VIoGNYtPhS0XWUK9kiJyzCqLdgmiR0g==\\n-----END PUBLIC KEY-----\\n\",\"blockchainAddress\":\"1b9e59b69808320df10583bbb4d3204ac2a8c78a377348010c65ac671c8909ea\"},{\"ipAddress\":\"192.168.178.39\",\"port\":1237,\"publicKey\":\"-----BEGIN PUBLIC KEY-----\\nMFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAETYQkPHlXaARBt11Km3DMoTn04wvlECSi\\nDf8e5t2mAaba+hXyuh1UjGlWj6K19UjYthq+nXKUCYHY7vUQ+8Higw==\\n-----END PUBLIC KEY-----\\n\",\"blockchainAddress\":\"7d68452d72d1de28c250b6a26150b2080f673b77b4477652228a1df5b4ebffe1\"}]}"))
})

test("Block Queue", () => {
    expect(blockchain.addBlockToQueue(newestBlock)).toBe(true);
    expect(blockchain.addBlockToQueue(newestBlock)).toBe(false);
})

test("Validate Block", () => {
    let payload = [
        {
            unixTimestamp: 1655896751814,
            payload: {
                blockchainSenderAddress: "01b364f173998197db2d4924d00ea41c38c0693245826502c78b5493e2e46936",
                blockchainReceiverAddress: "0000000000000000000000000000000000000000000000000000000000000000",
                unitsToTransfer: 1,
                networkFee: 0.001
            },
            publicKey: "-----BEGIN PUBLIC KEY-----\nMFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAEJ7QBCmN0/iIzTGwzQ5yKoO1dErex/mOj\nXxs2K/gEjndXVhLU5+SbIqegAU1KKY9Xjh+AS+YNMbSYgF901gz7YQ==\n-----END PUBLIC KEY-----\n",
            signature: "MEYCIQDvAVMjcRDv5idTHdluJkqXgx3f/qRQofwRDRx9ZGaTfAIhAJueiF8uGVrMsoYIombKLay6fu1EkUIuoLTS7i/VJVkA"
        }
    ]

    nextblock = {
        id: 3,
        timestamp: Date.now(),
        previousBlockHash: bcrypto.hash(blockchain.getNewestBlock(true)),
        rewardAddress: bcrypto.getFingerprint(),
        rewardAmount: 0.001,
        payloadHash: bcrypto.hash(JSON.stringify(payload)),
        payload: payload,
        networkDiff: {
            registered: [],
            left: []
        },
        validators: {
            "7d68452d72d1de28c250b6a26150b2080f673b77b4477652228a1df5b4ebffe1":"",
            "01b364f173998197db2d4924d00ea41c38c0693245826502c78b5493e2e46936":"",
            "e12a31ecaf53389b7ed9063dd48292a50015414466fc9777c0a45cb6d5e59233":""

        }
    }

    nextblock.forgerSignature = bcrypto.sign(JSON.stringify(nextblock));

    expect(blockchain.validateBlock(
        JSON.stringify(nextblock),
        newestBlock.timestamp + 1,
        [
            "7d68452d72d1de28c250b6a26150b2080f673b77b4477652228a1df5b4ebffe1",
            "01b364f173998197db2d4924d00ea41c38c0693245826502c78b5493e2e46936",
            "e12a31ecaf53389b7ed9063dd48292a50015414466fc9777c0a45cb6d5e59233"
        ],
        {
            ipAddress: "192.168.178.39",
            port: 1236,
            publicKey: bcrypto.getPubKey(true),
            blockchainAddress: bcrypto.getFingerprint()
        },
        [
            {
                unixTimestamp: 1655896751814,
                payload: {
                    blockchainSenderAddress: "01b364f173998197db2d4924d00ea41c38c0693245826502c78b5493e2e46936",
                    blockchainReceiverAddress: "0000000000000000000000000000000000000000000000000000000000000000",
                    unitsToTransfer: 1,
                    networkFee: 0.001
                },
                publicKey: "-----BEGIN PUBLIC KEY-----\nMFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAEJ7QBCmN0/iIzTGwzQ5yKoO1dErex/mOj\nXxs2K/gEjndXVhLU5+SbIqegAU1KKY9Xjh+AS+YNMbSYgF901gz7YQ==\n-----END PUBLIC KEY-----\n",
                signature: "MEYCIQDvAVMjcRDv5idTHdluJkqXgx3f/qRQofwRDRx9ZGaTfAIhAJueiF8uGVrMsoYIombKLay6fu1EkUIuoLTS7i/VJVkA"
            }
        ],
        {
            registered: [],
            left: []
        }
    )).toBe(true);
})

test("append Block", ()=> {
    blockchain.appendBlockToBlockchain({updateNetworkCache: ()=>{}}, nextblock)
    expect(blockchain.getNewestBlock()).toBe(JSON.stringify(nextblock));
})

test("generate Block", ()=> {
    let generatedBlock = blockchain.generateBlock([], {validators:[{ipAddress: "192.168.178.39", port: 1236, publicKey: bcrypto.getPubKey(true),blockchainAddress: bcrypto.getFingerprint()}]}, {registered: [], left: []});
    var expectedBlock = {
        id:4,
        timestamp:0,
        previousBlockHash:bcrypto.hash(blockchain.getNewestBlock(true)),
        rewardAddress:"30c442f72e92c0ddcd5662ebf399a1e9ea00f8f77fac95b8ac4c4456a2661d47",
        rewardAmount:1,
        payloadHash:"4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945",
        payload:[],
        networkDiff:{
            registered:[],
            left:[]
        },
        validators:{
            "30c442f72e92c0ddcd5662ebf399a1e9ea00f8f77fac95b8ac4c4456a2661d47":""
        },
        forgerSignature:"MEYCIQDj2yMf4AOlX6Y3PYl7O59iSPw1KUv/6oQz21Wprfc/ZwIhAJN8pKb3mO60LSHvULP/A0Bjqip9gUdXpnRBzPaMEMYg"
    }

    expectedBlock.timestamp = generatedBlock.timestamp;
    expectedBlock.forgerSignature = generatedBlock.forgerSignature;
    expect(generatedBlock).toStrictEqual(expectedBlock);
})

afterAll(() => {
    fs.rmSync("cache.json");
    fs.writeFileSync("blockchain.json", "{\"blockchain\":[{\"id\":0,\"timestamp\":1650566995125,\"previousBlockHash\":\"e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855\",\"rewardAddress\":\"01b364f173998197db2d4924d00ea41c38c0693245826502c78b5493e2e46936\",\"rewardAmount\":25000000,\"payload\":[],\"networkDiff\":{\"registered\":[],\"left\":[]}},{\"id\":1,\"timestamp\":1655896860017,\"previousBlockHash\":\"6716e7633c39f7d2632423f83fce1b0001d898e5d14d943c4cfd82e3d4c66cdb\",\"rewardAddress\":\"e12a31ecaf53389b7ed9063dd48292a50015414466fc9777c0a45cb6d5e59233\",\"rewardAmount\":1,\"payloadHash\":\"5af6a2e1160ae892836609216ac5def0efb8397e9fcb5b03ffc8c2a012521cf5\",\"payload\":[{\"unixTimestamp\":1655896751814,\"payload\":{\"blockchainSenderAddress\":\"01b364f173998197db2d4924d00ea41c38c0693245826502c78b5493e2e46936\",\"blockchainReceiverAddress\":\"0000000000000000000000000000000000000000000000000000000000000000\",\"unitsToTransfer\":1,\"networkFee\":0.001},\"publicKey\":\"-----BEGIN PUBLIC KEY-----\\nMFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAEJ7QBCmN0/iIzTGwzQ5yKoO1dErex/mOj\\nXxs2K/gEjndXVhLU5+SbIqegAU1KKY9Xjh+AS+YNMbSYgF901gz7YQ==\\n-----END PUBLIC KEY-----\\n\",\"signature\":\"MEYCIQDvAVMjcRDv5idTHdluJkqXgx3f/qRQofwRDRx9ZGaTfAIhAJueiF8uGVrMsoYIombKLay6fu1EkUIuoLTS7i/VJVkA\"}],\"networkDiff\":{\"registered\":[{\"ipAddress\":\"192.168.178.39\",\"port\":1236,\"publicKey\":\"-----BEGIN PUBLIC KEY-----\\nMFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAEKK5CHMpnX7y9MIVnND3vZLkNGJb9vGyK\\nyqI7i63SrwRsBzJhA5HThTItF4hkJppswskZya0tK3XUQe7D5EUFaw==\\n-----END PUBLIC KEY-----\\n\",\"blockchainAddress\":\"e12a31ecaf53389b7ed9063dd48292a50015414466fc9777c0a45cb6d5e59233\"},{\"ipAddress\":\"192.168.178.39\",\"port\":1234,\"publicKey\":\"-----BEGIN PUBLIC KEY-----\\nMFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAEJ7QBCmN0/iIzTGwzQ5yKoO1dErex/mOj\\nXxs2K/gEjndXVhLU5+SbIqegAU1KKY9Xjh+AS+YNMbSYgF901gz7YQ==\\n-----END PUBLIC KEY-----\\n\",\"blockchainAddress\":\"01b364f173998197db2d4924d00ea41c38c0693245826502c78b5493e2e46936\"},{\"ipAddress\":\"192.168.178.39\",\"port\":1235,\"publicKey\":\"-----BEGIN PUBLIC KEY-----\\nMFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAE6x9RJRVMnhvYlrPtX7Nt5aDNoQp9gkv0\\nZC7uDgXYEFDwK8vOYjhLIC+VIoGNYtPhS0XWUK9kiJyzCqLdgmiR0g==\\n-----END PUBLIC KEY-----\\n\",\"blockchainAddress\":\"1b9e59b69808320df10583bbb4d3204ac2a8c78a377348010c65ac671c8909ea\"},{\"ipAddress\":\"192.168.178.39\",\"port\":1237,\"publicKey\":\"-----BEGIN PUBLIC KEY-----\\nMFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAETYQkPHlXaARBt11Km3DMoTn04wvlECSi\\nDf8e5t2mAaba+hXyuh1UjGlWj6K19UjYthq+nXKUCYHY7vUQ+8Higw==\\n-----END PUBLIC KEY-----\\n\",\"blockchainAddress\":\"7d68452d72d1de28c250b6a26150b2080f673b77b4477652228a1df5b4ebffe1\"}],\"left\":[]},\"validators\":{\"1b9e59b69808320df10583bbb4d3204ac2a8c78a377348010c65ac671c8909ea\":\"MEUCIQC8wb/morIUNT7yijmjIOK9vb+hW+6EfA+aLUCdLVvDtwIgFkkL1zc+Ktj0hhttF8I7Q9IYaIFuTfXSOYbmPm7A6VE=\",\"7d68452d72d1de28c250b6a26150b2080f673b77b4477652228a1df5b4ebffe1\":\"MEUCIQDfTNTC72ctudyU3qcRtu8K0Oc52UzsO4j0IBe40MVw5QIgejXXgj/ePhbFUuWJ9u7dUaiD2KHDwt8zHgUK6gjwm6c=\",\"01b364f173998197db2d4924d00ea41c38c0693245826502c78b5493e2e46936\":\"MEUCIQCTk3VWoKJuVgXsIHNq6hinnVwfHswFr+1G4XB7ZlK9/wIgej29dpL4kjmf65PoUhqv3e1TEJSWvgweijHF9Vy5dWY=\"},\"forgerSignature\":\"MEQCIAYveG4sGJl0BnpFxr9s+0jw9HiTJyU4GhAJb2JVj1vFAiAE6Qd0dgMY3w2vr8YEB5sC7ewKJmIUrjIkrYNlW4mf1Q==\"},{\"id\":2,\"timestamp\":1655896980042,\"previousBlockHash\":\"7aef73ae79c557a928ff2fa13d1c3ad382a0c51eb501582c383e8e155bd00b58\",\"rewardAddress\":\"1b9e59b69808320df10583bbb4d3204ac2a8c78a377348010c65ac671c8909ea\",\"rewardAmount\":2,\"payloadHash\":\"d4edecafcde579ece1fba4c7f6755fddc8aab1b1f70cf225c3a38ef21d8434f8\",\"payload\":[{\"unixTimestamp\":1655896899186,\"payload\":{\"blockchainSenderAddress\":\"01b364f173998197db2d4924d00ea41c38c0693245826502c78b5493e2e46936\",\"blockchainReceiverAddress\":\"0000000000000000000000000000000000000000000000000000000000000000\",\"unitsToTransfer\":1,\"networkFee\":1},\"publicKey\":\"-----BEGIN PUBLIC KEY-----\\nMFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAEJ7QBCmN0/iIzTGwzQ5yKoO1dErex/mOj\\nXxs2K/gEjndXVhLU5+SbIqegAU1KKY9Xjh+AS+YNMbSYgF901gz7YQ==\\n-----END PUBLIC KEY-----\\n\",\"signature\":\"MEYCIQCq+YusbITDhBOjZn0O5U1wg1GuxQPPTIvTXACwoKbfdAIhAMyApb4dGgtcvO+oQz88yrJ8t1nTdf1+63VyG4AU378B\"},{\"unixTimestamp\":1655896899814,\"payload\":{\"blockchainSenderAddress\":\"01b364f173998197db2d4924d00ea41c38c0693245826502c78b5493e2e46936\",\"blockchainReceiverAddress\":\"0000000000000000000000000000000000000000000000000000000000000000\",\"unitsToTransfer\":1,\"networkFee\":1},\"publicKey\":\"-----BEGIN PUBLIC KEY-----\\nMFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAEJ7QBCmN0/iIzTGwzQ5yKoO1dErex/mOj\\nXxs2K/gEjndXVhLU5+SbIqegAU1KKY9Xjh+AS+YNMbSYgF901gz7YQ==\\n-----END PUBLIC KEY-----\\n\",\"signature\":\"MEUCIGuDvh+t8N9MmK67JdjLifEqWl1CfFe4JwywX7yZ6J14AiEAge0akBgdU7cjJc1y8P8wzfJ3DuxTpG3Xr73MGhSvbT8=\"}],\"networkDiff\":{\"registered\":[],\"left\":[]},\"validators\":{\"7d68452d72d1de28c250b6a26150b2080f673b77b4477652228a1df5b4ebffe1\":\"MEQCIAUtvi+FLeuSUHkiMpSO04lotj8YCcBFY4BJ0zGxpPhmAiAoAGJO4AKRtiFmqGwXeVFK10TxJkIzV2y13mue2fsLbA==\",\"01b364f173998197db2d4924d00ea41c38c0693245826502c78b5493e2e46936\":\"MEYCIQDa7SRvY2SF38MV9TuRZvHHwy+EAq5w+P5Gri7nHIyN7QIhAPMUu4gmxh/1JXRar3lnbb0uQCbpgpy3eFcP0l/CT2of\",\"e12a31ecaf53389b7ed9063dd48292a50015414466fc9777c0a45cb6d5e59233\":\"MEUCIQDD0GiXNJZwUw1ROmmFTCJ/6XKfxeRVxB0eUm9ipdGKDAIganXeQeF/iAiQ6Xjr8B4tbecOM4rlYYCU9V9EWclMhd0=\"},\"forgerSignature\":\"MEYCIQCeQCG54DhnYnWaTfSQr4AgMfVA5o5N81a27eZ0zhFfowIhAJCfObd5SaRrO/Wi/O2mfUISIbm2L8s12xJsL8VurhFa\"}]}")
})
