const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: String,
    password: String
});

userSchema.pre('save', async function(next) {
        const salt = await bcrypt.genSalt(10);//生成一个复杂度为10的盐值
        const hash = await bcrypt.hash(this.password, salt);//将盐值与密码使用hash算法处理来进行加密
        this.password = hash;//加密后数据储存到数据库中
    next();
});

module.exports = mongoose.model('user', userSchema);