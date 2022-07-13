const express = require("express");

const User = require("../models/user.model");
const Organization = require('../models/organization.model');
const { auth } = require("../middleware/auth");
const { remove, findOne, findByIdAndDelete, findOneAndDelete } = require("../models/user.model");

const router = express.Router();

// registering a user
router.post('/users', async (req, res) => {
    try {
        const organization = await Organization.findById(req.body.organization);
        if(!organization) throw new Error("Please create the organziation first");

        const newUser = new User(req.body);

        const token = await newUser.generateAuthenticationToken(); // this ones also saves the user in db
        res.status(201).send({ user_id: newUser._id, token });
    } catch (e) {
        res.status(400).send({ Error: e.message });
    }
})

// logging a user in
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthenticationToken();
        res.status(200).send({ user_id: user._id, token: token });
    } catch (e) {
        res.status(500).send({ Error: e.message });
    }
})

// logging out a user
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        });
        await req.user.save();
        res.send();
    } catch (e) {
        res.status(500).send({ Error: "Contact Dev support" });
    }
})

// logout all
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.send();
    } catch (e) {
        res.status(500).send({ Error: "Contact Dev support" });
    }
})


// reading a user's profile
router.get('/users/profile', auth, async (req, res) => {
    res.status(200).send(req.user);
})


// updating a user's profile
router.patch('/users', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'password'];
    const isValidUpdate = updates.every((update) => allowedUpdates.includes(update));
    if (!isValidUpdate) {
        res.status(400).send("Invalid Update options!");
    }

    try {
        updates.forEach((update) => {
            req.user[update] = req.body[update];
        });

        await req.user.save();

        res.status(200).send(req.user);
    } catch (e) {
        res.status(400).send({Error: e.message});
    }
});

// delete user's profile
router.delete('/users', auth, async (req, res) => {
    try {
        const user = await User.findOneAndDelete({email: req.user.email})
        res.status(200).send(user);
    } catch (e) {
        res.status(400).send(e.message);
    }
    
})
module.exports = router;