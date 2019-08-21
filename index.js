const express = require ('express');
require("express-async-errors");
const expressUtils = require('expressjs-utils');
const bodyParser = require('body-parser');
const cors = require("cors");
require("dotenv").config();
const clients = require('./src/clients');



const app = express();
app.use(bodyParser.json());
app.use(cors());

app.get("/", (req, res) => {
res.json('Welcome to the app')
});

app.get("/api/clients", async (req, res) => {
    res.json(await clients.getMultiple(req.query.page || 2));
});

app.get("/api/clients/:id?", async (req, res) => {
    res.json(await clients.get(req.params.id));
});

app.post("/api/clients", async (req, res) => {
    res.json(await clients.create(req.body));
});

app.put("/api/clients/:id", async (req, res) => {
    res.json(await clients.update(req.params, req.body));
});

app.delete("/api/clients", async (req, res) => {
    res.json(await clients.remove(req.body.clientIds));
});

app.listen(8080,()=>{
    console.log('App Running')
});