const express = require("express");

const Organization = require('../models/organization.model');
const { auth } = require("../middleware/auth");

const router = express.Router();

// registering an organization
router.post('/organizations', async (req, res) => {
    try {
        const newOrg = new Organization(req.body);
        await newOrg.save();

        res.status(201).send({ organization_id: newOrg._id });
    } catch (e) {
        res.status(400).send({ Error: e.message });
    }
});

// fetch organization data
router.get('/organizations', auth, async(req, res) => {
    try {
        const organization = await Organization.findOne({_id: req.user.organization});

        if (!organization) throw new Error("Not found");

        res.status(200).send(organization);
    } catch (e) {
        res.status(400).send({Error: e.message});
    }
});

// Update organization
router.patch('/organizations', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'location', 'phone'];
    const isValidUpdate = updates.every((update) => allowedUpdates.includes(update));
    if (!isValidUpdate) {
        res.status(400).send("Invalid Update options!");
    }

    try {
        const organization = await Organization.findById(req.user.organization);

        if (!organization) throw new Error("Not found");

        updates.forEach((update) => {
            organization[update] = req.body[update];
        });

        await organization.save();

        res.status(200).send(organization);
    } catch (e) {
        res.status(400).send({Error: e.message});
    }
});

// (soft)Delete organziation
router.delete('/organizations', auth, async (req, res) => {
    try {
        const organization = await Organization.findById(req.user.organization);

        if (!organization) throw new Error("Not found");

        organization.isActive = false;

        await organization.save();
        res.status(200).send();
    } catch (e) {
        res.status(400).send({Error: e.message});
    }
});


module.exports = router;