const mongoose = require("mongoose");

const componentSchema = new mongoose.Schema(
{
    componentCode:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },

    componentName:{
        type:String,
        required:true,
        trim:true
    },

    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category",
        required:true
    },

    unit:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Unit",
        required:true
    },

    supplier:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Supplier",
        required:true
    },

    warehouse:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Warehouse",
        required:true
    },

    costPrice:{
        type:Number,
        default:0
    },

    stockQuantity:{
        type:Number,
        default:0
    },

    status:{
        type:String,
        enum:["Active","Inactive"],
        default:"Active"
    }

},
{
    timestamps:true
});

module.exports=mongoose.model(
    "Component",
    componentSchema
);