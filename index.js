require('dotenv').config();
const express = require('express');
const cors = require('cors');
const {startDatabaseConnection} = require('./setup/db');
const userRoutes = require('./routes/user');
const postRoutes = require('./routes/post');
const eventRoutes = require('./routes/event');
const path = require('path'); 

const port = process.env.SERVER_PORT || 3000;
const app = express();

const uploadsPath = path.join(__dirname, 'uploads'); 

app.use('/uploads', express.static(uploadsPath));

app.use(express.json());
app.use(cors())

startDatabaseConnection();

app.get('/', (req, res) => res.json({message: "Bem-vindo à API eviene"}));
app.use('/user', userRoutes);
app.use('/post', postRoutes);
app.use('/event', eventRoutes);

app.listen(port, ()=>{
  console.log(`App rodando na porta: ${port}`);
});
