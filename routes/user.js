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

router.put('/follow/:username', checkToken, async (req, res) => {
  const username = req.params.username;
  const authenticatedID = req.user.id;

  try {
    const userFollowed = await User.findOne({ username: username });
    const userFollowing = await User.findById(authenticatedID);

    if (!userFollowed || !userFollowing) {
      return res.status(500).json({ message: 'Usuário não existe' });
    }

    if (userFollowed.id === userFollowing.id) {
      return res.status(400).json({ message: 'Você não pode seguir você mesmo' });
    }

    const isFollower = userFollowing.following.includes(userFollowed.id);
    if (isFollower) {
      const followedIndex = userFollowing.following.indexOf(userFollowed.id);
      const followingIndex = userFollowed.followers.indexOf(userFollowing.id);

      userFollowing.following.splice(followedIndex, 1);
      userFollowed.followers.splice(followingIndex, 1);

      await userFollowing.save();
      await userFollowed.save();

      return res.status(200).json({ message: 'Deixando de seguir com sucesso' });
    } else {
      userFollowed.followers.push(userFollowing.id);
      userFollowing.following.push(userFollowed.id);

      await userFollowing.save();
      await userFollowed.save();

      return res.status(200).json({ message: 'Seguindo com sucesso' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro na consulta' });
  }
});

router.get('/:username', checkToken, async (req, res)=>{
  const username = req.params.username;

  try{
    const user = await User.find({username: username}, {username: 1, profilePicture: 1});
    if(user.length == 0){
      res.status(500).json({message: 'Usuário não encontrado'});
    }else{
      res.status(200).json(user);
    }
  }catch(error){
    console.error(error);
    res.status(500).json({message: 'Erro na consulta'});
  }
});

module.exports = router;