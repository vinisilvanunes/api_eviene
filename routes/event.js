const express = require('express');
const Event = require('../models/Event'); 
const { checkToken } = require('../middlewares/auth');
const upload = require('../middlewares/upload');
require("dotenv").config()

const router = express.Router();

router.post("/", checkToken, upload, async (req, res, next) => {    
    const author = req.user.id;
    const { description, location, attractions, date } = req.body;

    if (!description || !location || !date) {
        return res.status(400).json({ message: "Por favor, preencha todos os campos obrigatórios." });
    }

    const newEvent = new Event({
        author: author,
        description: description,
        location: location,
        attractions: attractions,
        date: date
    });

    if (req.files && req.files.length > 0) {
        const banner = `${req.files[0].location}`;
        newEvent.banner = banner;
    }

    try {
        await newEvent.save();
        return res.status(201).json({ message: "Evento criado com sucesso!" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erro ao criar o evento. Tente novamente mais tarde." });
    }
});



router.delete("/:id", async(req, res)=>{
    const id = req.params.id;

    const event = await Event.findById(id);

    if(!event){
        res.status(404).json({message: "Evento não encontrado"});
    }

    event.visible = false;

    try{
        event.save();
        res.status(200).json({message: "Evento deletado com sucesso"});
    }catch(error){
        res.status(500).json({message: "Erro ao tentar apagar o evento"});
    }
});

router.get('/search', checkToken, async (req, res) =>{
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }
  
    try {
      const events = await Event.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { username: { $regex: query, $options: 'i' } }
        ]
      }, { name: 1, username: 1, profilePicture: 1 });
  
      res.status(200).json(events);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching users' });
    }
  })

router.get("/", async(req, res)=>{
    try{
        const event = await Event.find({}).sort({createdAt: -1}).exec()
        if(event.length == 0){
            return  res.status(400).json({message: "Não há eventos disponiveis"})
        }else{
         res.status(200).json(event)
        }
    }catch(error){
        res.status(500).json({message: "Erro no servidor tente novamente mais tarde!"})
    }
})

module.exports = router;
