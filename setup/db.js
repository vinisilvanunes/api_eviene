require("dotenv").config();
const mongoose = require('mongoose');

async function startDatabaseConnection(){
  try{
    await mongoose.connect(`mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.DB_NAME}?authSource=admin`);
    console.log('Conexão com o banco de dados bem sucedida')
  }catch(error){
    console.error('Falha ao conectar com o banco de dados: ', error)
  }
}
async function closeDatabaseConnection() {
  try {
      await mongoose.connection.close();
  } catch (error) {
      console.error('Erro ao fechar a conexão com o banco de dados:', error);
  }
}

module.exports = {startDatabaseConnection, closeDatabaseConnection};
