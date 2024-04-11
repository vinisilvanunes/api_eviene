const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const router = express.Router();

router.post('/register', async (req,res)=>{
  const {name, username, email, password, confirmPassword, birthDate} = req.body;
  if(!name || !username || !email || !password || !birthDate){
    return res.status(400).json({message: "Preencha todos os campos"});
  }

  const checkUsername = await User.findOne({username: username});
  if(checkUsername){
    return res.status(400).json({message: "Nome de usuário já cadastrado"});
  }

  const eighteenYearsAgo = new Date();
  eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
  if (new Date(birthDate) > eighteenYearsAgo) {
    return res.status(400).json({ message: 'Usuário deve ter mais de 18 anos para se cadastrar' });
  }

  const checkEmail = await User.findOne({email: email});
  if(checkEmail){
    return res.status(400).json({message: "E-mail já cadastrado"});
  }
  if(password !== confirmPassword){
    return res.status(400).json({message: "Senhas não conferem"});
  }

  const salt = await bcrypt.genSalt(12)
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = new User({
    name,
    username,
    email,
    password: hashedPassword,
    birthDate: birthDate,
  })
  try{
    await newUser.save();
    return res.status(200).json({message:"Usuário cadastrado com sucesso"});
  }catch(error){
    return res.status(500).json({message: "Erro ao cadastrar o usuário, tente novamente mais tarde!"});
  }
})

module.exports = router;