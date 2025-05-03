// const { Password } = require("@mui/icons-material");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name : {type : String},
    userName : {type : String},
    password : {type : String},
    token : {type : String}
});

const User = mongoose.model("User",userSchema);

module.exports = User;