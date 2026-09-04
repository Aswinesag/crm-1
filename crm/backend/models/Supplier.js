const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema(

    {

        /*
        =========================================
        SUPPLIER CODE
        =========================================
        Example:
        SUP001
        SUP002
        SUP003
        =========================================
        */

        supplierCode: {

            type: String,

            required: true,

            unique: true,

            trim: true

        },



        /*
        =========================================
        SUPPLIER NAME
        =========================================
        */

        name: {

            type: String,

            required: true,

            trim: true

        },



        /*
        =========================================
        CONTACT PERSON
        =========================================
        */

        contactPerson: {

            type: String,

            default: "",

            trim: true

        },



        /*
        =========================================
        EMAIL
        =========================================
        */

        email: {

            type: String,

            default: "",

            trim: true,

            lowercase: true

        },



        /*
        =========================================
        PHONE
        =========================================
        */

        phone: {

            type: String,

            default: "",

            trim: true

        },



        /*
        =========================================
        GST NUMBER
        =========================================
        */

        gstNumber: {

            type: String,

            default: "",

            trim: true,

            uppercase: true

        },



        /*
        =========================================
        PAN NUMBER
        =========================================
        */

        panNumber: {

            type: String,

            default: "",

            trim: true,

            uppercase: true

        },



        /*
        =========================================
        ADDRESS
        =========================================
        */

        address: {

            type: String,

            default: "",

            trim: true

        },



        /*
        =========================================
        CITY
        =========================================
        */

        city: {

            type: String,

            default: "",

            trim: true

        },



        /*
        =========================================
        STATE
        =========================================
        */

        state: {

            type: String,

            default: "",

            trim: true

        },



        /*
        =========================================
        PIN CODE
        =========================================
        */

        pinCode: {

            type: String,

            default: "",

            trim: true

        },



        /*
        =========================================
        COUNTRY
        =========================================
        */

        country: {

            type: String,

            default: "India",

            trim: true

        },

        paymentTerms: {
            type: String,

            default: "Immediate",
            
            trim: true,
        },

        creditLimit: {

            type: Number,

            default: 0,
            
            min: 0,
        },
        


        /*
        =========================================
        STATUS
        =========================================
        */

        status: {

            type: String,

            enum: [

                "Active",

                "Inactive"

            ],

            default: "Active"

        }

    },

    {

        timestamps: true

    }

);



/*
=========================================
INDEXES
=========================================
*/

supplierSchema.index({

    supplierCode: 1

});

supplierSchema.index({

    name: 1

});

supplierSchema.index({

    phone: 1

});

supplierSchema.index({

    email: 1

});



module.exports = mongoose.model(
    "Supplier",
    supplierSchema
);