const mongoose = require('mongoose');
const validator = require('validator');

const organizationSchema = new mongoose.Schema({
    name: {
        unique: true,
        type: String,
        required: true,
    },
    email: {
        unique: true,
        type: String,
        required: true,
        trim: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Enter correct Email!");
            }
        }
    },
    phone: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    }
},  {
    timestamps: true,
}
);

const Organization =  mongoose.model('Organization', organizationSchema);

module.exports = Organization;