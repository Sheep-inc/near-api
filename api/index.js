const fetch = require('node-fetch');
async function getBalanceAtBlock(contract, account, block) {
	var jsonBal = {
		"jsonrpc": "2.0",
		"id": "dontcare",
		"method": "query",
		"params": {
			"request_type": "call_function",
			"account_id": contract,
			"method_name": "ft_balance_of",
			"args_base64": tob64(JSON.stringify({ "account_id": account }))
		}
	}
	var jsonMeta = {
		"jsonrpc": "2.0",
		"id": "dontcare",
		"method": "query",
		"params": {
			"request_type": "call_function",
			"finality": "final",
			"account_id": contract,
			"method_name": "ft_metadata",
			"args_base64": ""
		}
	}

	if (block) {
		jsonBal.params["block_id"] = block
	} else {
		jsonBal.params.finality = "final";
	}
	let metaData = await fetch("https://archival-rpc.mainnet.near.org", {
		body: JSON.stringify(jsonMeta),
		mode: "no-cors",
		method: "post",
		headers: {
			"content-type": "application/json"
		}
	}).then(res => res.json());
	let meta = JSON.parse("{" + dataToString(metaData) + "}")
	let data = await fetch("https://archival-rpc.mainnet.near.org", {
		body: JSON.stringify(jsonBal),
		mode: "no-cors",
		method: "post",
		headers: {
			"content-type": "application/json"
		}
	}).then(res => res.json());
	let output = dataToString(data)
	return ({ meta: meta, balance: output })
}
function dataToString(data) {
	let hex = toHexString(data.result.result)
	let str = hex_to_ascii(hex)
	return str.substring(2, str.length - 1)
}

function tob64(s) {
	return Buffer.from(s).toString('base64');
}

function hex_to_ascii(str1) {
	var hex = str1.toString();
	var str = '';
	for (var n = 0; n < hex.length; n += 2) {
		str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
	}
	return str;
}
function toHexString(byteArray) {
	var s = '0x';
	byteArray.forEach(function (byte) {
		s += ('0' + (byte & 0xFF).toString(16)).slice(-2);
	});
	return s;
}

// getBalanceAtBlock("meta-token.near", "thephilosopher.near",59004953)
// getBalanceAtBlock("metacoin.tkn.near", "thephilosopher.near",59004953)
// /fungi/metacoin.tkn.near/thephilosopher.near/0

const express = require('express')
const app = express()
app.get('/api/', function (req, res) {
	res.send("hi")
})

app.get('/api/fungi/:contract/:wallet/:block', function (req, res) {
	getBalanceAtBlock(req.params.contract, req.params.wallet, Number(req.params.block)).then(data => {
		res.send({
			wallet: req.params.wallet,
			contract: req.params.contract,
			balance: (Number(data.balance) / Math.pow(10, data.meta.decimals)).toFixed(5),
			rawBal: data.balance,
			block: req.params.block,
		})
	}).catch((err) => {
		console.log(err)
		res.send({ status: 400 })
	})
})
app.get('/api/nonfungi/:contract/:wallet/:block', function (req, res) {
	getBalanceAtBlockNonFungi(req.params.contract, req.params.wallet, Number(req.params.block)).then(data => {
		res.send({
			wallet: req.params.wallet,
			contract: req.params.contract,
			balance: (Number(data.balance) / Math.pow(10, data.meta.decimals)).toFixed(5),
			rawBal: data.balance,
			block: req.params.block,
		})
	}).catch((err) => {
		console.log(err)
		res.send({ status: 400 })
	})
})

async function getBalanceAtBlockNonFungi(contract, account, block) {
	var jsonBal = {
		"jsonrpc": "2.0",
		"id": "dontcare",
		"method": "query",
		"params": {
			"request_type": "call_function",
			"account_id": contract,
			"method_name": "ft_balance_of",
			"args_base64": tob64(JSON.stringify({ "account_id": account }))
		}
	}
	var jsonMeta = {
		"jsonrpc": "2.0",
		"id": "dontcare",
		"method": "query",
		"params": {
			"request_type": "call_function",
			"finality": "final",
			"account_id": contract,
			"method_name": "ft_metadata",
			"args_base64": ""
		}
	}

	if (block) {
		jsonBal.params["block_id"] = block
	} else {
		jsonBal.params.finality = "final";
	}
	let metaData = await fetch("https://archival-rpc.mainnet.near.org", {
		body: JSON.stringify(jsonMeta),
		mode: "no-cors",
		method: "post",
		headers: {
			"content-type": "application/json"
		}
	}).then(res => res.json());
	let meta = JSON.parse("{" + dataToString(metaData) + "}")
	let data = await fetch("https://archival-rpc.mainnet.near.org", {
		body: JSON.stringify(jsonBal),
		mode: "no-cors",
		method: "post",
		headers: {
			"content-type": "application/json"
		}
	}).then(res => res.json());
	let output = dataToString(data)
	return ({ meta: meta, balance: output })
}
module.exports = app