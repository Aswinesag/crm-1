const Material = require("../models/Material");
const PurchaseRequest = require("../models/PurchaseRequest");


const autoGeneratePR = async (req, res) => {

   try {

      res.status(200).json({
         message: "Working"
      });

   } catch (error) {

      res.status(500).json({
         message: error.message
      });
   }
};


const getAllPR = async (req, res) => {

   try {

      const prs = await PurchaseRequest
         .find()
         .populate("materialId")
         .sort({ createdAt: -1 });

         console.log(
            JSON.stringify(prs, null, 2)
         );

      res.status(200).json({
         success: true,
         count: prs.length,
         data: prs
      });

   } catch (error) {

      res.status(500).json({
         success: false,
         message: error.message
      });
   }
};


const approvePR = async (req, res) => {

   try {

      res.status(200).json({
         message: "Approved"
      });

   } catch (error) {

      res.status(500).json({
         message: error.message
      });
   }
};


module.exports = {

   autoGeneratePR,
   getAllPR,
   approvePR
};