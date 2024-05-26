const express = require('express');
const mongoose = require('mongoose');
const article = require('./models/article');
const user = require('./models/user');
const articleRouter = require('./routes/router');
const methodOverride = require('method-override');
const session = require('express-session');
const app = express();

mongoose.connect('mongodb://my-mongo/yjx');

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }))
app.use(methodOverride('_method'))

app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 600000 },
}));

app.use('/',require('./routes/router'));

app.listen(12306)