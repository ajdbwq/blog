const mongoose = require('mongoose');
const marked = require('marked')
const user = require('./user');

const articleSchema = new mongoose.Schema({
    title: String,
    description: String,
    content: String,
    html: String,
    createdAt: {type: Date, default: Date.now},
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }
});

articleSchema.pre('validate', function(next) {
  if (this.content) {
    this.html = marked(this.content)
  }
  next()
})

module.exports = mongoose.model('article', articleSchema)