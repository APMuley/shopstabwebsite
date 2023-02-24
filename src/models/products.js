const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    product_name : {
        type:String,
        required:true
    },
    description : {
        type:String,
        required:true,
    },
    price : {
        type:String,
        required:true
    },
    username: {
        type:String
    }
})

const Product = new mongoose.model("Product", productSchema);

module.exports = Product;