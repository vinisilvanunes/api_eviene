require('dotenv').config();
const express = require('express');
const {startDatabaseConnection} = require('./setup/db');
const userRoutes = require('./routes/user');

const port = process.env.SERVER_PORT;
const app = express();

app.use(express.json());

startDatabaseConnection();

app.use('/user', userRoutes);

app.listen(port, ()=>{
  console.log(`App rodando na porta: ${port}`);
});
