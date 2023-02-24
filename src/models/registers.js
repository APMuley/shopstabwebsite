const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username : {
        type:String,
        required:true
    },
    email : {
        type:String,
        required:true,
        unique:true
    },
    phoneNum : {
        type:Number,
        required:true,
        unique:true
    },
    password : {
        type:String,
        required:true
    },
    product_name : {
        type: [String],
    },
    product_desc : {
        type: [String],
    },
    product_price : {
        type: [String],
    },
    wishlist_name : {
        type: [String],
    },
    wishlist_desc : {
        type: [String],
    },
    wishlist_price : {
        type: [String],
    }
})

const Register = new mongoose.model("Register", userSchema);

module.exports = Register;