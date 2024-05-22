const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: String,
    password: String
});

userSchema.pre('save', async function(next) {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(this.password, salt);
        this.password = hash;
    next();
});

module.exports = mongoose.model('user', userSchema);