const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({

    productCode:{
        type:String,
        unique:true
    },

    productName:{
        type:String,
        required:true
    },

    productType:{
        type:String,
        enum:[
            "Raw Material",
            "Finished Product",
            "Service"
        ],
        required: true
    },

    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category"
    },

    subCategory:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"SubCategory"
    },

    brand:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Brand"
    },

    unit:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Unit"
    },

    variants:[
    {
        variantName:String,
        variantValue:String
    }
    ],

    costPrice:Number,

    sellingPrice:Number,

    mrp:Number,

    discount:Number,

    gst:Number,

    hsnCode:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"HsnCode"
    },

    openingStock:Number,

    reorderLevel:Number,

    maximumStock:Number,

    warehouse:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Warehouse"
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

module.exports = mongoose.model("Product",productSchema);