# 新生项目课程：云计算环境下的博客系统开发实践
## 开发环境：
1. 操作系统：WIndows11
2. 编程工具：Visual Studio
3. 浏览器：Edge浏览器
## 项目描述：
本项目使用 Node.js 作为后端运行环境，Express 框架来处理 HTTP 请求，以及 MongoDB 作为数据库存储文章及用户数据，实现了用户的注册和登录功能，以及用户对文章的增，删，改，查等基础功能
## 功能实现：
### 代码具体讲解：
1. 用户管理：
注册与登录功能
```
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
```

用户密码加密
```
userSchema.pre('save', async function(next) {
        const salt = await bcrypt.genSalt(10);//生成一个复杂度为10的盐值
        const hash = await bcrypt.hash(this.password, salt);//将盐值与密码使用hash算法处理来进行加密
        this.password = hash;//加密后数据储存到数据库中
    next();
});
```

验证用户是否登录
```
//验证
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 600000 },
}));
```
```
const requireLogin = (req, res, next) => {
  if (req.session.oneuser) {
    next();
  } else {
    res.render('login', { message: null })//若检测到用户未登录，返回登录界面
  }
};
```
2. 文章的增删改查功能
```
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
```
3. 各页面的ejs文件的编写
以索引界面为例
```
<!DOCTYPE html>
<html lang="en">
<head>
  <title>Blog</title>
  <link rel="stylesheet" type="text/css" href="/css/bootstrap.min.css" />
  <style>
  .left {float: left;}
  .right {float: right;}//设置浮动
  .clear {clear: both;}//解除浮动
  body{
    background: url("/image/background.png") no-repeat fixed center;
    color: white;
  }
  .card-body{
    background-color: rgba(0, 0, 0, 0.6);//设置背景透明度
  }
  </style>
</head>
<body>
  <div class="container">
    <h1 class="mt-4 left">Articles</h1>
    <h1 class="mt-4 right"><%= name %></h1>
    <div class="clear">
    <hr/>
    <a href="/new" class="btn btn-success">New Article</a>
    </div>
    <% articles.forEach(article => { %>
    <div class="card mt-4 bg-transparent">
        <div class="card-body">
        <h2><%= article.title %></h2>
            <div class="text-muted mb-2">
               <%= article.createdAt.toLocaleDateString() %>
            </div>
        <p><%= article.description %></p>
        <a href="/display/<%= article._id %>" class="btn btn-primary">Read More</a>
        <a href="/edit/<%= article._id %>" class="btn btn-info">Edit</a>
        <form action="/<%= article._id %>?_method=DELETE" method="POST" class="d-inline">
            <button type="submit" class="btn btn-danger">Delete</button>
        </form>
        </div>
    </div>
    <% }) %>
  </div>
</body>
</html>
```
## 项目总结
该项目基本实现了一个简易博客系统的功能
