const mongoose = require('mongoose');

// always encode special characters

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then( ()=>{
    console.log("[+] DB Connected!!!");
})
.catch( (err) => {
    console.log("[-] Something Went Wrong!!!");
    console.log(err.message);
});