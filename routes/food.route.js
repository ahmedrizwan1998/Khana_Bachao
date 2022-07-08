const express = require("express");

const Food = require('../models/food.model');
const { auth, sourceAuth} = require("../middleware/auth");

const {USER_TYPES} = require('../constants'); 

const router = express.Router();

// Adding food
router.post('/food', auth, sourceAuth ,async (req, res) => {
    try {
        const newFood = new Food({
            ...req.body,
            source: req.user.organization, 
            current_quantity: req.body.original_quantity
        });
        await newFood.save();

        res.status(201).send({ food_id: newFood._id });
    } catch (e) {
        res.status(400).send({ Error: e.message });
    }
});

// View foods
//completed=true/false
//limit=2&skip=0
//sortBy=createdAt:asc
//reading multiple foods
router.get('/food', auth, async (req,res)=>{
    const match = {};
    const sort = {};

    
    // source users can only view their food
    if(req.user.userType === USER_TYPES.SOURCE){
        match.source = req.user.organization;
    }

    if(req.query.completed){
        match.current_quantity = req.query.completed === 'true' ? 0 : { $ne: 0 };
    }

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(":");
        sort[parts[0]] = parts[1] === 'desc'  ? -1 : 1;
    }
    
    try{
        const food = await Food.find(
            match,
        ).skip(parseInt(req.query.skip)).limit(parseInt(req.query.limit)).sort(sort);

        res.status(200).send(food);
    }catch(e){
        res.status(400).send({ Error: e.message });
    }
    
});

// fetch a single food
router.get('/food/:id', auth, async(req, res) => {
    try {
        const match = {_id: req.params.id};
        if (req.user.userType === USER_TYPES.SOURCE){
            match.organization = req.user.organization;
        }
        const food = await Food.findOne(match);
        if(!food) throw new Error("Not found");

        res.status(200).send(food);
    } catch (e) {
        res.status(400).send({ Error: e.message });
    }
});

// Update food (source)
router.patch('/food/:id', auth, sourceAuth, async (req,res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'original_quantity', 'current_quantity'];

    const isValidUpdate = updates.every((update)=>allowedUpdates.includes(update));
    
    if(!isValidUpdate){
        res.status(400).send("Invalid Update options!");
    }

    try{
        const food = await Food.findOne({ _id: req.params.id, source: req.user.organization});
        
        if(!food) throw new Error("Not found");
        
        
        if(food.current_quantity != food.original_quantity) throw new Error("Items can't be updated after a donation request has been placed");

        updates.forEach((update)=>{
            food[update] = req.body[update];
        })

        await food.save();
        
        res.status(200).send(food);

    }catch(e){
        res.status(400).send({ Error: e.message });
    }
})

// deleting a food
router.delete('/food/:id', auth, sourceAuth, async (req, res) => {
    try{
        const food =  await Food.findOne({_id: req.params.id, source: req.user.organization});
        
        if(!food) throw new Error("Not found");
        
        console.log('here');
        if(food.current_quantity != food.original_quantity) throw new Error("Items can't be deleted after a donation request has been placed");

        await food.remove();

        res.status(200).send(food);
    }catch(e){
        res.status(500).send({ Error: e.message });
    }
})



module.exports = router;