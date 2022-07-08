const mongoose = require('mongoose');

const Food = require('./food.model');

const {ORDER_STATUS} = require('../constants'); 

const orderSchema = new mongoose.Schema({
    food: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Food'
    },
    quantity: {
        type: Number,
        required: true,
    },
    consumer: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Organization'
    },
    source: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Organization'
    },
    status: {
        type: String,
        enum: [ORDER_STATUS.IN_PROGRESS, ORDER_STATUS.COMPLETED],
    }
},  {
    timestamps: true,
}
);

// updating the relevant food
orderSchema.pre('save', async function(next){
    const order = this;
    
    const food = await Food.findById(order.food);
    if(!food) throw new Error("No such food found");

    food.current_quantity = food.current_quantity - order.quantity;
    await food.save();
    next();
});


const Order =  mongoose.model( 'Order', orderSchema);

module.exports = Order;