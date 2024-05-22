const express = require('express');
const article = require('./../models/article');
const user = require('./../models/user');
const bcrypt = require('bcryptjs');
const router = express.Router();
var session = require("express-session"); 

const requireLogin = (req, res, next) => {
  if (req.session.oneuser) {
    next();
  } else {
    res.render('login', { message: null })
  }
};

router.get('/', requireLogin, async (req, res) => {
    const all = await article.find({ author: req.session.oneuser._id }).sort({ createdAt: 'desc' });
    res.render('index', { articles: all, name: req.session.oneuser.username })
})

router.get('/register', (req, res) => {
  res.render('register');
})

router.get('/new', requireLogin, (req, res) => {
  res.render('new');
})

router.get('/edit/:id', requireLogin, async (req, res) => {
    const one = await article.findOne({ _id: req.params.id });
    res.render('edit', { article: one })
})

router.get('/display/:id', requireLogin, async (req, res) => {
    const one = await article.findOne({ _id: req.params.id });
    res.render('display', { article: one })
})

router.post('/new', requireLogin, async (req,res) => {
    one = new article({ title: req.body.title, description: req.body.description, content: req.body.content, author: req.session.oneuser._id });
    await one.save();
    res.render('display', { article: one })
})

router.delete('/:id', requireLogin, async (req, res) => {
  await article.deleteMany({ _id: req.params.id });
  res.redirect('/')
})

router.put('/:id', requireLogin, async (req, res) => {
    let data = {}
    data._id = req.params.id
    data.title = req.body.title
    data.description = req.body.description
    data.content = req.body.content

    var one = await article.findOne({ _id: req.params.id });
    if (one != null) {
        one.title = data.title;
        one.description = data.description;
        one.content =data.content;
        await one.save();       
    }  
    res.redirect(`/display/${req.params.id}`)
})

router.post('/register', async (req, res) => {
    try{
        let oneuser = await user.findOne({ username: req.body.username });
        if(oneuser)
        {
            return res.render('login', { message: 'The username already exists' });
        }
        one = new user({ username: req.body.username, password: req.body.password });
        await one.save();
        res.render('login', { message: 'User registered' });
    }
    catch (error) {
        res.render('login', { message: 'error' });
    }
});

router.post('/login', async (req, res) => {
    
        var username = req.body.username;
        var password = req.body.password;
        var oneuser = await user.findOne({ username: username });
        if (!oneuser) {
            return res.render('login', { message: 'user does not exist' });
        }
        const match = await bcrypt.compare(password, oneuser.password);
        if (!match) {
            return res.render('login', { message: 'password error' });
        }
        req.session.oneuser = oneuser;
        res.redirect('/');
    
    /*catch (error) {
        res.render('login', { message: 'error' });
    }*/
});

router.get('/register', (req, res) => {
  res.render('register');
})

module.exports = router;