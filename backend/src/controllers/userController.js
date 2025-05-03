// import User from "../models/userModel.js";
const User = require("../models/userModel.js");
const Meeting = require("../models/meeting.js");
const { status } = require("http-status");
const bcrpyt = require("bcrypt");
const crypto = require("crypto");

module.exports.register = async (req, res) => {
  const { name, userName, password } = req.body;
  try {
    const user = await User.findOne({ userName });

    if (user) {
      return res.status(status.FOUND).json({ message: "User already exist" });
    }

    const hashedPassword = await bcrpyt.hash(password, 10);

    const newUser = new User({
      name,
      userName,
      password: hashedPassword,
    });

    await newUser.save();
    return res.status(status.CREATED).json({ message: "User Registered" });
  } catch (error) {
    res.json({
      message: `Something Wrong in to get Data From DataBase ${error}`,
    });
  }
};

module.exports.login = async (req, res) => {
  const { userName, password } = req.body;
  if (!userName || !password) {
    return res.json({ message: "Something missing username or password" });
  }
  try {
    const userData = await User.findOne({ userName });

    if (!userData) {
      return res
        .status(status.NOT_FOUND)
        .json({ message: "Username not exist" });
    }

    let isPasswordCorrect = await  bcrpyt.compare(password ,userData.password);
    // console.log(isPasswordCorrect);
    
    if (isPasswordCorrect) {
      let token = crypto.randomBytes(20).toString("hex");
      userData.token = token;
      await userData.save();
      return res.status(status.OK).json({ token });
    }
    return res.status(status.UNAUTHORIZED).json({message : "Password Wrong"});
  } catch (error) {
      return res.status(500).json({message : `Something wents wrong ${error}`});
  }
};


module.exports.getUserHistory = async (req,res) => {
  const {token}= req.query;

    try {
      const user = await User.findOne({token:token});
      const meetings = await Meeting.find({user_id:user.name});
     return req.json(meetings);
    } catch (error) {
      res.json({message :`Someting is wrong ${error}`});
    }
}

module.exports.addToHistory = async (req,res) => {
  const {token,meeting_code} = req.body;
  try {
    const user = await User.findOne({token:token});
    const newMeeting = new Meeting({
      user_id : user.userName,
      meetingCode : meeting_code
    })

    await newMeeting.save();

    return res.status(status.CREATED)
        .json({ message: "Added to History" });
  } catch (error) {
    res.json({message : `Something is Wrong ${error}`});
  }
}