const express=require("express");
const{
createStockIn,
getStockIns,
getStockInById,
updateStockIn,
activateStockIn,
deactivateStockIn,
deleteStockIn
}=require("../controllers/stockInController");


const router=express.Router();


router.post("/",createStockIn);
router.get("/",getStockIns);
router.get("/:id",getStockInById);
router.put("/:id",updateStockIn);
router.patch("/:id/activate",activateStockIn);
router.patch("/:id/deactivate",deactivateStockIn);
router.delete("/:id",deleteStockIn);

module.exports=router;