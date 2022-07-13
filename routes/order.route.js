const express = require("express");

const Order = require('../models/order.model');
const { auth, sourceAuth, consumerAuth} = require("../middleware/auth");

const {USER_TYPES, ORDER_STATUS} = require('../constants');
const router = express.Router();

// Creating an order
router.post('/orders', auth, consumerAuth ,async (req, res) => {
    try {
        const newOrder = new Order({
            ...req.body,
            consumer: req.user._id
        });
        await newOrder.save();

        res.status(201).send({ order_id: newOrder._id });
    } catch (e) {
        res.status(400).send({ Error: e.message });
    }
});

// Fetching orders
//completed=true/false
//limit=2&skip=0
//sortBy=createdAt:asc
router.get('/orders', auth, async (req,res)=>{
    const match = {};
    const sort = {};
    if (req.user.userType === USER_TYPES.SOURCE){
        match.source = req.user.organization;
    }else{
        match.consumer = req.user.organization;
    }
    
    if(req.query.status){
        match.status = req.query.completed === 'true' ?  ORDER_STATUS.COMPLETED : ORDER_STATUS.IN_PROGRESS;
    }

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(":");
        sort[parts[0]] = parts[1] === 'desc'  ? -1 : 1;
    }
    
    try{
        const order = await Order.find(
            match,
        ).skip(parseInt(req.query.skip)).limit(parseInt(req.query.limit)).sort(sort);

        res.status(200).send(order);
    }catch(e){
        res.status(400).send({ Error: e.message });
    }
    
});

// Fetch single order
router.get('/orders/:id', auth, async(req, res) => {
    try {
        const match = {_id: req.params.id};
        if (req.user.userType === USER_TYPES.SOURCE){
            match.source = req.user.organization;
        }else{
            match.consumer = req.user.organization;
        }
        

        const order = await Order.findOne(match);
        if(!order) throw new Error("Not found");

        res.status(200).send(order);
    } catch (e) {
        res.status(400).send({ Error: e.message });
    }
});


// update order
router.patch('/orders/:id', auth, consumerAuth, async(req, res) =>{
    const update = Object.keys(req.body);
    const allowedUpdates = ['quantity'];
    const isValidUpdate = update.every((update) => allowedUpdates.includes(update));

    if (!isValidUpdate) {
        res.status(400).send("Invalid update option!");
    }

    try {
        update.forEach((update) => {
            req.user[update] = req.body[update];
        })

        await req.user.save();
        res.status(200).send("updated");
    } catch (e) {
        res.status(400).send({Error : e.message});
    }


})

// cancel order
router.delete('/orders/:id', auth, consumerAuth, async(req, res) => {
    try {
        const order = await Order.findByIdAndDelete({_id: req.params.id});
        res.status(200).send(order);
    } catch (e) {
        res.status(400).send(e.message);
    }
})

module.exports = router;