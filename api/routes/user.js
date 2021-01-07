const express = require("express");
const router = express.Router();
const fetch = require('node-fetch');
const cloudinary = require("cloudinary");
const formData = require('form-data');

const User = require("../models/User");

const { createToken } = require('../tokenService');
const { isLoggedIn } = require('../middleware');
const { findByIdAndUpdate } = require("../models/User");
// /api/user

// Create a user and reply with token/user
router.post('/', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    const user = new User({
      firstName,
      lastName,
      email,
      password,
    });
    try {
      const foundUser = await User.findOne({ email });
      if (foundUser) {
        res.status(400).json({ message: `email ${email} already exists` });
        return;
      }
      const doc = await user.save();
      const token = createToken({ id: doc._id, role: doc.role });
      res.cookie("token", token);
      delete doc.password;
      res.json(doc);
    } catch (e) {
      console.log(e);
    }
})

router.patch('/', isLoggedIn, async (req, res) => {
  const { firstName, lastName, email } = req.body;
  const user = await User.findByIdAndUpdate(req.user.id, {
    firstName, lastName, email
  })
  res.json({user})
})

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
        res.status(400).json({ message: `email ${email} already exists` });
        return;
        }
        const isMatch = await user.comparePasswords(password);
        if (!isMatch) {
        res.status(400).json({ message: "password or email not valid" });
        return;
        }
        const token = createToken({ id: user._id });
        res.cookie("token", token);
        res.status(200).send({});
    } catch (e) {
        console.log(e);
    } 
})

router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.status(200).send({});
})


router.post('/signature', isLoggedIn, async (req, res) => {
  console.log(req.body);
  const { file, timestamp } = req.body;
  // const timestamp = new Date();
  const url =
    "https://api.cloudinary.com/v1_1/dss7yz6h0/image/upload";

  const apiSecret = "GZ0u-n6HuFOulTjidpKdyrGCWQg";
  const params = {
    timestamp: timestamp,
  };
  const signature = cloudinary.utils.api_sign_request(params, apiSecret);
  res.json({signature})
})

router.post('/photo', isLoggedIn, async (req, res) => {
  const { url } = req.body;
  const update = await User.findByIdAndUpdate(req.user.id, {
    profilePic: url,
  }, { new: true })
  res.json({user: update})
})



module.exports = router;