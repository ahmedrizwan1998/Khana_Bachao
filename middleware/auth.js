const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const {USER_TYPES} = require('../constants'); 

const auth = async (req,res,next) => {
    try{
        const token = req.header("Authorization").replace("Bearer ","");
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ _id: decoded._id, "tokens.token": token});

        if(!user){
            throw new Error("User not found");
        }

        req.token = token;
        req.user = user;
        next();
    }catch(e){
        res.status(400).send({error: "Please authenticate."});
    }

}

const sourceAuth = async (req, res, next) => {
    try {
        if(req.user.userType !== USER_TYPES.SOURCE) throw new Error("This user is not authorized to perform this action.");
        next();
    } catch (e) {
        res.status(400).send({error: e.message});
    }
}

const consumerAuth = async (req, res, next) => {
    try {
        if(req.user.userType !== USER_TYPES.CONSUMER) throw new Error("This user is not authorized to perform this action.");
        next();
    } catch (e) {
        res.status(400).send({error: e.message});
    }
}

module.exports = {
    auth,
    sourceAuth,
    consumerAuth
};