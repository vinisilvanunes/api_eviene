require("dotenv").config();
const mongoose = require('mongoose');

async function startDatabaseConnection(){
  try{
    await mongoose.connect(`mongodb+srv://eviene_adm:${process.env.DB_PASS}@eviene.izgvr0p.mongodb.net/?retryWrites=true&w=majority&appName=eviene`);
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
