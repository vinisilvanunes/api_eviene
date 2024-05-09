const express = require('express');
const Event = require('../models/Event'); 
const { checkToken } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

const router = express.Router();

router.post("/", checkToken, upload, async(req, res)=>{
    const author = req.user.id;
    const banner = req.files;
    const [description, location, attractions, date ] = req.body;

    const newEvent = new Event({
        author, author,
        banner: banner,
        description: description,
        location: location,
        attractions: attractions,
        date: date
    });

    try{
        await newEvent.save();
        return res.status(200).json({message: "Evento criado com sucesso!"});
    }catch(error){
        return res.status(500).json({message: "Erro ao criar o evento tente novamente mais tarde"});
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

router.put("/", (req, res)=>{
    
})

router.get("/", async(req, res)=>{
    try{
        const event = await Event.find({}).sort({createdAt: -1}).exec()
        res.status(200).json(event)
    }catch(error){
        res.status(500).json()
    }
})

module.exports = router;