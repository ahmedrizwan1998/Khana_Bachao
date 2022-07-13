const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require("bcryptjs"); // for password hasing
const jwt = require("jsonwebtoken");

const {USER_TYPES} = require('../constants'); 

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
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
    password: {
        type: String,
        minlength: 6,
        validate(value){
            if(value.toLowerCase().includes("password")){
                throw new Error("Password can't be password!");
            }
        }
    },
    userType: {
        type: String,
        enum: [USER_TYPES.SOURCE, USER_TYPES.CONSUMER], /*enum is used to specify allowed values, like in this case 
                                                        only values that match any on the ones in array would be accepted*/
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Organization'
    },
    tokens: [{
        token: {
            type: String,
            required: true,
        }
    }],
},  {
    timestamps: true,
}
);

// use of normal function defination in some functions down below because arrow functions won't have "this" binding that give us access to the user. 
// using arrow function would enforce us to actually pass the user object as a parameter 

userSchema.methods.toJSON = function(){
    const user = this;
    const userObject = user.toObject(); // converting into a Javascript object because right now user is a mongoose object that means certain Javascript object methods (delete etc) won't apply to it

     // we don't want to send some sensitive data back to frontend
    delete userObject.password;
    delete userObject.tokens;
    // delete userObject.avatar;

    return userObject;
}

userSchema.methods.generateAuthenticationToken = async function() {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
    user.tokens = user.tokens.concat({token: token}); // .concat is a js array method that basically adds an item to the end of array
    await user.save();
    return token; 
}


userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({email});
    
    if(!user){
        throw new Error("Unable to login");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if(!isMatch){
        throw new Error("Unable to login");
    }

    return user;

}

// hashing the password
userSchema.pre('save', async function(next){
    const user = this;
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});

const User =  mongoose.model('User', userSchema);

module.exports = User;