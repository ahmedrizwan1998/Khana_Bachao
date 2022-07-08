require('dotenv').config();
require("./db/mongoose");
const express = require("express");

const userRouter = require("./routes/user.route");
const organizationRouter = require("./routes/organization.route");
const foodRouter = require("./routes/food.route");
const orderRouter = require("./routes/order.route");



const app = express();
const port = process.env.PORT;

// Allowing all domains
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });


app.use(express.json());

app.use(userRouter);
app.use(organizationRouter);
app.use(foodRouter);
app.use(orderRouter);



app.listen(port, ()=>{
    console.log("server running on " + port);
})