// const { Password } = require("@mui/icons-material");
const mongoose = require("mongoose");

const meetingSchema = new mongoose.Schema({
    user_id : {type : String},
    meetingCode : {type : String},
    date : {type : String , default : Date.now()}
});

const Meeting = mongoose.model("Meeting",meetingSchema);

module.exports =  Meeting;