require('dotenv').config();
const express = require('express');

const port = process.env.SERVER_PORT;
const app = express();

app.listen(port, ()=>{
  console.log(`App rodando na porta: ${port}`);
});
