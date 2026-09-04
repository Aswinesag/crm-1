const mongoose = require("mongoose");

const unitSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },

    shortName:String,

    status:{
        type:String,
        default:"Active"
    }
});

module.exports = mongoose.model("Unit",unitSchema);