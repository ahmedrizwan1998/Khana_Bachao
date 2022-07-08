const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
    },
    original_quantity: {
        type: Number,
        required: true,
    },
    source: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Organization'
    },
    current_quantity: {
        type: Number,
        required: true,
        validate(value){
            if(value < 0){
                throw new Error("Current quantity can't be less than zero");
            }
        }
    }
},  {
    timestamps: true,
}
);


// checking
foodSchema.pre('save', async function(next){
    const food = this;
    if(food.original_quantity < food.current_quantity){
        throw new Error("Current quantity can't be greater than original quantity");
    }
    next();
});


const Food =  mongoose.model('Food', foodSchema);

module.exports = Food;