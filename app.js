const express = require("express");
const debug = require('debug')('cryptodosth');
const app = express();

app.get('/', (req, res) => {
	res.send("Coming soon!");
})

module.exports = app;