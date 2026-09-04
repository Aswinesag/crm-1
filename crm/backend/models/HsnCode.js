const mongoose = require("mongoose");

const hsnSchema = new mongoose.Schema({
    hsnCode:{
        type:String,
        required:true
    },

    description:String,

    gstPercentage:Number
},{
    timestamps:true
});

module.exports = mongoose.model("HsnCode",hsnSchema);