const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {checkToken} = require('../middlewares/auth');
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
});

router.post('/login', async (req, res)=>{
  const {email, password} = req.body;

  if(!email || !password){
    return res.status(400).json({message: "Preencha todos os campos"});
  }

  const user = await User.findOne({email: email});
  if(!user){
    return res.status(400).json({message: "Usuário não encontrado"});
  }

  const checkPassword = await bcrypt.compare(password, user.password);
  if(!checkPassword){
    return res.status(400).json({message: "Usuário ou senha incorreto"});
  }

  try{
    const secret = process.env.SECRET;
    const token = jwt.sign({
      id: user.id
    }, secret)
    return res.status(200).json({message: "Login realizado com sucesso", token, id: user.id});
  }catch(error){
    return res.status(500).json({message: "Erro ao logar o usuário, tente novamente mais tarde!"});
  }
});

router.delete('/:username', checkToken, async (req, res) => {
  const username = req.params.username;
  const authenticatedID = req.user.id;

  const user = await User.findOne({ username });
  if (!user) {
    return res.status(404).json({ message: 'Usuário não encontrado' });
  }

  if(authenticatedID !== user.id){
    return res.status(404).json({ message: 'Acesso negado' });
  }

  try {
    user.active = false;
    await user.save();
    res.status(200).json({ message: 'Usuário desativado com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao desativar usuário' });
  }
});

module.exports = router;