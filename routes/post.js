const express = require('express');

const router = express.Router();

const Post = require('../models/Post')
const User = require('../models/User')
const {checkToken} = require('../middlewares/auth');
const upload = require('../middlewares/upload');

router.post('/', checkToken, upload, async (req, res)=>{
    const author = req.user.id;
    const content = req.body.content || null;
    const images = req.files.map(file => file.path);

    if(!content){
        return res.status(400).json({message: "O conteúdo é obrigatório"})
    }
    const newPost = new Post({
        author: author,
        description: content,
        images: images
    });

    try {
        await newPost.save();
        res.status(201).json({message: "post criado com sucesso"});
    } catch (error) {
        console.error("Erro ao criar o post:", error);
        res.status(500).json({ message: "Ocorreu um erro ao criar o post." });
    }
});

router.delete('/:idPost', async (req, res)=>{
    const post =  Post.findById(req.params.idPost);

    res.status(200).json({id: req.params.idPost});

    if(!post){
        res.status(404).json({message: "Post não encontrado"})
    }

    try{
        post.visible = false;
        await post.save();
        res.status(200).json({message: "Post excluído com sucesso"})
    }catch(error){
        res.status(500).json({message: "Erro ao tentar excluir o post"})
    }
});

router.put('/like/:idPost', checkToken, async(req, res)=>{
    const idPost = req.params.idPost
    const post = Post.findById(idPost);
    const idUser = req.user.id;
    const isLiked = post.likes.include(idUser)
        
    try{
        if(!isLiked){
            await Post.findByIdAndUpdate(idPost, {$push:{like: idUser}});;
        }else{
            const likeIndex = post.likes.indexOf(idUser)
            post.likes.slice(likeIndex, 1)
            await post.save()
        }
        return res.status(200).json({message: 'Like'})
    }catch(error){
        return res.status(500).json({message: "Erro ao dar like"});
    }
    
});

router.put('/comment/:idPost', checkToken, async(req, res)=>{
    const idPost = req.params.idPost;
    const idUser = req.user.id;
    const content = req.body.content;

    const newComment = {
        author: idUser,
        content: content
    }

    try{
        await Post.findByIdAndUpdate(idPost, {$push:{comment: newComment}});
        res.status(200).json({message: "Comentário feito com sucesso"})
    }catch(error){
        res.status(500).json({message: "Erro ao criar novo comentário"})
    }
});

router.get('/feed', checkToken, async(req,res)=>{
    const userID = req.user.id;
    const user = await User.findById(userID);
    const usersFollowed = user.following;
    try{
        const posts = await Post.find({author: {$in: usersFollowed}}).sort({createdAt: -1}).exec();
        if(posts.length == 0){
            res.status(400).json({message: "Não há posts disponíveis"});
        }else{
            res.status(200).json(posts);
        }
    }catch(error){
        res.status(500).json({message: "Erro ao buscar o feed"})
    }

});

module.exports = router;
