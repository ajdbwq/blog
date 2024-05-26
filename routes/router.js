const express = require('express');
const article = require('./../models/article');
const user = require('./../models/user');
const bcrypt = require('bcryptjs');
const router = express.Router();
var session = require("express-session"); 

//验证
const requireLogin = (req, res, next) => {
  if (req.session.oneuser) {
    next();
  } else {
    res.render('login', { message: null })//若检测到用户未登录，返回登录界面
  }
};

//索引
router.get('/', requireLogin, async (req, res) => {
    const all = await article.find({ author: req.session.oneuser._id }).sort({ createdAt: 'desc' });
    res.render('index', { articles: all, name: req.session.oneuser.username })
})

//新增
router.get('/new', requireLogin, (req, res) => {
  res.render('new');
})

router.post('/new', requireLogin, async (req,res) => {
    one = new article({ title: req.body.title, description: req.body.description, content: req.body.content, author: req.session.oneuser._id });
    await one.save();
    res.render('display', { article: one })
})

//编辑
router.get('/edit/:id', requireLogin, async (req, res) => {
    const one = await article.findOne({ _id: req.params.id });
    res.render('edit', { article: one })
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

//展示
router.get('/display/:id', requireLogin, async (req, res) => {
    const one = await article.findOne({ _id: req.params.id });
    res.render('display', { article: one })
})

//删除
router.delete('/:id', requireLogin, async (req, res) => {
  await article.deleteMany({ _id: req.params.id });
  res.redirect('/')
})

//注册
router.get('/register', (req, res) => {
  res.render('register');
})

router.post('/register', async (req, res) => {
    try{
        let oneuser = await user.findOne({ username: req.body.username });
        if(oneuser)
        {
            return res.render('login', { message: 'The username already exists' });//如果用户已存在，返回错误信息并返回登录界面
        }
        one = new user({ username: req.body.username, password: req.body.password });
        await one.save();
        res.render('login', { message: 'User registered' });//弹出注册成功的信息并返回登录界面
    }
    catch (error) {
        res.render('login', { message: 'error' });
    }
});

//登录
router.post('/login', async (req, res) => {
    try{
        var username = req.body.username;
        var password = req.body.password;
        var oneuser = await user.findOne({ username: username });
        if (!oneuser) {
            return res.render('login', { message: 'user does not exist' });//如果用户不存在，返回错误信息并返回登录界面
        }
        const match = await bcrypt.compare(password, oneuser.password);//比较明文密码和hash后的密码是否匹配
        if (!match) {
            return res.render('login', { message: 'password error' });//密码错误，返回错误信息并返回登录界面
        }
        req.session.oneuser = oneuser;//创建一个session储存用户登录信息
        res.redirect('/');
    }
    catch (error) {
        res.render('login', { message: 'error' });
    }
});

module.exports = router;