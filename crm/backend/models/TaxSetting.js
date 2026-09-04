const mongoose = require("mongoose");

const taxSchema = new mongoose.Schema({
    taxName:{
        type:String,
        required:true
    },

    percentage:Number,

    status:{
        type:String,
        default:"Active"
    }
},{
    timestamps:true
});

module.exports = mongoose.model("TaxSetting",taxSchema);