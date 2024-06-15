const express = require('express');
const Event = require('../models/Event'); 
const { checkToken } = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const multer = require('multer');

const router = express.Router();

router.post("/", checkToken, (req, res, next) => {    
    upload(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ message: err.message });
        } else if (err) {
            return res.status(500).json({ message: "Erro no servidor ao processar o upload." });
        }

        const author = req.user.id;
        const banner = req.files;
        const { bannerName, description, location, attractions, date } = req.body;

        if (!banner || !description || !location || !date) {
            return res.status(400).json({ message: "Por favor, preencha todos os campos obrigatórios." });
        }
        const bannerPath = `${Date.now()}-${bannerName}`;

        const newEvent = new Event({
            author: author,
            banner: bannerPath,
            description: description,
            location: location,
            attractions: attractions,
            date: date
        });

        try {
            await newEvent.save();
            return res.status(201).json({ message: "Evento criado com sucesso!" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Erro ao criar o evento. Tente novamente mais tarde." });
        }
    });
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
            return  res.status(400).json(message: "Não há eventos disponiveis")
        }else{
         res.status(200).json(event)
        }
    }catch(error){
        res.status(500).json()
    }
})

module.exports = router;
