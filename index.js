require('dotenv').config();
const express = require('express');
const {startDatabaseConnection} = require('./setup/db');
const userRoutes = require('./routes/user');
const postRoutes = require('./routes/post');
const eventRoutes = require('./routes/event');

const port = process.env.SERVER_PORT || 3000;
const app = express();

app.use(express.json());

startDatabaseConnection();

app.get('/', (req, res) => res.json({message: "Bem-vindo à API eviene"}));
app.use('/user', userRoutes);
app.use('/post', postRoutes);
app.use('/event', eventRoutes);

app.listen(port, ()=>{
  console.log(`App rodando na porta: ${port}`);
});
