const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },

    description: {
    type: String,
    default: ""
  },

    status:{
        type:String,
        default:"Active"
    }
},{
    timestamps:true
});

module.exports = mongoose.model("Brand",brandSchema);