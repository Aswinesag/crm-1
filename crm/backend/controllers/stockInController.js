const mongoose=require("mongoose");
const StockIn=require("../models/StockIn");
const Supplier=require("../models/Supplier");
const RawMaterial=require("../models/RawMaterial");
const Warehouse=require("../models/Warehouse");

const generateStockInNumber=async()=>{
const lastStockIn=await StockIn.findOne().sort({createdAt:-1}).select("stockInNumber");
if(!lastStockIn){
return "SIN001";
}
const lastNumber=parseInt(lastStockIn.stockInNumber.replace("SIN",""));
const nextNumber=lastNumber+1;
return `SIN${nextNumber.toString().padStart(3,"0")}`;
};

const createStockIn = async (req, res) => {
    try {

        const {
            date,
            supplier,
            material,
            quantity,
            unitPrice,
            warehouse,
            remarks
        } = req.body;

        if (!supplier || !material || !quantity || !unitPrice || !warehouse) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields."
            });
        }

        const supplierExists = await Supplier.findById(supplier);

        if (!supplierExists) {
            return res.status(404).json({
                success: false,
                message: "Supplier not found."
            });
        }

        const materialExists = await RawMaterial.findById(material);

        if (!materialExists) {
            return res.status(404).json({
                success: false,
                message: "Raw material not found."
            });
        }

        const warehouseExists = await Warehouse.findById(warehouse);

        if (!warehouseExists) {
            return res.status(404).json({
                success: false,
                message: "Warehouse not found."
            });
        }

        const qty = Number(quantity);
        const price = Number(unitPrice);

        if (isNaN(qty) || qty <= 0) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be greater than zero."
            });
        }

        if (isNaN(price) || price <= 0) {
            return res.status(400).json({
                success: false,
                message: "Unit price must be greater than zero."
            });
        }

        const totalCost = qty * price;

        const stockInNumber = await generateStockInNumber();

        const stockIn = await StockIn.create({
            stockInNumber,
            date: date || new Date(),
            supplier,
            material,
            quantity: qty,
            unitPrice: price,
            totalCost,
            warehouse,
            remarks: remarks || "",
            createdBy: req.user?._id
        });

        materialExists.stockQuantity =
            (materialExists.stockQuantity || 0) + qty;

        await materialExists.save();

        const createdStockIn = await StockIn.findById(stockIn._id)
            .populate("supplier", "supplierCode supplierName")
            .populate("material", "materialCode materialName")
            .populate("warehouse", "warehouseCode warehouseName")
            .populate("createdBy", "name email");

        return res.status(201).json({
            success: true,
            message: "Stock In created successfully.",
            data: createdStockIn
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Failed to create Stock In.",
            error: error.message
        });

    }
};
const getStockIns=async(req,res)=>{
try{
const page=parseInt(req.query.page)||1;
const limit=parseInt(req.query.limit)||10;
const skip=(page-1)*limit;
const search=req.query.search||"";
const filter={};
if(search){
filter.$or=[
{stockInNumber:{$regex:search,$options:"i"}},
{remarks:{$regex:search,$options:"i"}}
];
}
if(req.query.isActive==="true"){
filter.isActive=true;
}
if(req.query.isActive==="false"){
filter.isActive=false;
}
if(req.query.supplier){
filter.supplier=req.query.supplier;
}
if(req.query.material){
filter.material=req.query.material;
}
if(req.query.warehouse){
filter.warehouse=req.query.warehouse;
}
if(req.query.startDate||req.query.endDate){
filter.date={};
if(req.query.startDate){
filter.date.$gte=new Date(req.query.startDate);
}
if(req.query.endDate){
const endDate=new Date(req.query.endDate);
endDate.setHours(23,59,59,999);
filter.date.$lte=endDate;
}
}
const total=await StockIn.countDocuments(filter);
const stockIns=await StockIn.find(filter)
.populate("supplier","supplierCode name")
.populate("material","materialCode materialName")
.populate("warehouse","warehouseCode warehouseName")
.populate("createdBy","name email")
.populate("updatedBy","name email")
.sort({createdAt:-1})
.skip(skip)
.limit(limit);
return res.status(200).json({
success:true,
count:stockIns.length,
total,
page,
pages:Math.ceil(total/limit),
data:stockIns
});
}
catch(error){
return res.status(500).json({
success:false,
message:"Failed to fetch Stock In entries.",
error:error.message
});
}
};

const getStockInById=async(req,res)=>{
try{
const stockIn=await StockIn.findById(req.params.id)
.populate("supplier","supplierCode supplierName email mobile")
.populate("material","materialCode materialName unit stockQuantity")
.populate("warehouse","warehouseCode warehouseName")
.populate("createdBy","name email")
.populate("updatedBy","name email");
if(!stockIn){
return res.status(404).json({
success:false,
message:"Stock In entry not found."
});
}
return res.status(200).json({
success:true,
data:stockIn
});
}
catch(error){
return res.status(500).json({
success:false,
message:"Failed to fetch Stock In entry.",
error:error.message
});
}
};

const updateStockIn=async(req,res)=>{
const session=await mongoose.startSession();
session.startTransaction();
try{
const stockIn=await StockIn.findById(req.params.id).session(session);

if(!stockIn){
await session.abortTransaction();
session.endSession();
return res.status(404).json({
success:false,
message:"Stock In entry not found."
});
}

const{
date,
supplier,
material,
quantity,
unitPrice,
warehouse,
remarks
}=req.body;

if(!supplier||!material||!quantity||!unitPrice||!warehouse){
await session.abortTransaction();
session.endSession();
return res.status(400).json({
success:false,
message:"Please fill all required fields."
});
}

const supplierExists=await Supplier.findById(supplier).session(session);

if(!supplierExists){
await session.abortTransaction();
session.endSession();
return res.status(404).json({
success:false,
message:"Supplier not found."
});
}

const materialExists=await RawMaterial.findById(material).session(session);

if(!materialExists){
await session.abortTransaction();
session.endSession();
return res.status(404).json({
success:false,
message:"Raw material not found."
});
}

const warehouseExists=await Warehouse.findById(warehouse).session(session);

if(!warehouseExists){
await session.abortTransaction();
session.endSession();
return res.status(404).json({
success:false,
message:"Warehouse not found."
});
}

const qty=Number(quantity);
const price=Number(unitPrice);

if(isNaN(qty)||qty<=0){
await session.abortTransaction();
session.endSession();
return res.status(400).json({
success:false,
message:"Quantity must be greater than zero."
});
}

if(isNaN(price)||price<=0){
await session.abortTransaction();
session.endSession();
return res.status(400).json({
success:false,
message:"Unit price must be greater than zero."
});
}

const totalCost=qty*price;
const previousMaterial=await RawMaterial.findById(stockIn.material).session(session);

if(!previousMaterial){
await session.abortTransaction();
session.endSession();
return res.status(404).json({
success:false,
message:"Previous raw material not found."
});
}
if(String(stockIn.material)===String(material)){
const updatedStock=(previousMaterial.stockQuantity-stockIn.quantity)+qty;

if(updatedStock<0){
await session.abortTransaction();
session.endSession();
return res.status(400).json({
success:false,
message:"Insufficient stock available."
});
}

previousMaterial.stockQuantity=updatedStock;
await previousMaterial.save({session});
}
else{
previousMaterial.stockQuantity=previousMaterial.stockQuantity-stockIn.quantity;

if(previousMaterial.stockQuantity<0){
await session.abortTransaction();
session.endSession();
return res.status(400).json({
success:false,
message:"Insufficient stock available."
});
}

await previousMaterial.save({session});

materialExists.stockQuantity=(materialExists.stockQuantity||0)+qty;
await materialExists.save({session});
}

stockIn.date=date||stockIn.date;
stockIn.supplier=supplier;
stockIn.material=material;
stockIn.quantity=qty;
stockIn.unitPrice=price;
stockIn.totalCost=totalCost;
stockIn.warehouse=warehouse;
stockIn.remarks=remarks||"";
stockIn.updatedBy=req.user?._id;

await stockIn.save({session});

await session.commitTransaction();
session.endSession();

const updatedStockIn=await StockIn.findById(stockIn._id)
.populate("supplier","supplierCode supplierName")
.populate("material","materialCode materialName")
.populate("warehouse","warehouseCode warehouseName")
.populate("createdBy","name email")
.populate("updatedBy","name email");

return res.status(200).json({
success:true,
message:"Stock In updated successfully.",
data:updatedStockIn
});
}
catch(error){
await session.abortTransaction();
session.endSession();
return res.status(500).json({
success:false,
message:"Failed to update Stock In.",
error:error.message
});
}
};
const activateStockIn=async(req,res)=>{
try{
const stockIn=await StockIn.findById(req.params.id);

if(!stockIn){
return res.status(404).json({
success:false,
message:"Stock In entry not found."
});
}

stockIn.isActive=true;
stockIn.updatedBy=req.user?._id;

await stockIn.save();

return res.status(200).json({
success:true,
message:"Stock In activated successfully.",
data:stockIn
});
}
catch(error){
return res.status(500).json({
success:false,
message:"Failed to activate Stock In.",
error:error.message
});
}
};

const deactivateStockIn=async(req,res)=>{
try{
const stockIn=await StockIn.findById(req.params.id);

if(!stockIn){
return res.status(404).json({
success:false,
message:"Stock In entry not found."
});
}

stockIn.isActive=false;
stockIn.updatedBy=req.user?._id;

await stockIn.save();

return res.status(200).json({
success:true,
message:"Stock In deactivated successfully.",
data:stockIn
});
}
catch(error){
return res.status(500).json({
success:false,
message:"Failed to deactivate Stock In.",
error:error.message
});
}
};

const deleteStockIn=async(req,res)=>{
const session=await mongoose.startSession();
session.startTransaction();

try{
const stockIn=await StockIn.findById(req.params.id).session(session);

if(!stockIn){
await session.abortTransaction();
session.endSession();
return res.status(404).json({
success:false,
message:"Stock In entry not found."
});
}

const material=await RawMaterial.findById(stockIn.material).session(session);

if(!material){
await session.abortTransaction();
session.endSession();
return res.status(404).json({
success:false,
message:"Raw material not found."
});
}

if((material.stockQuantity-stockIn.quantity)<0){
await session.abortTransaction();
session.endSession();
return res.status(400).json({
success:false,
message:"Stock quantity cannot become negative."
});
}

material.stockQuantity=material.stockQuantity-stockIn.quantity;

await material.save({session});

await StockIn.findByIdAndDelete(req.params.id,{session});

await session.commitTransaction();
session.endSession();

return res.status(200).json({
success:true,
message:"Stock In deleted successfully."
});
}
catch(error){
await session.abortTransaction();
session.endSession();

return res.status(500).json({
success:false,
message:"Failed to delete Stock In.",
error:error.message
});
}
};

module.exports={
createStockIn,
getStockIns,
getStockInById,
updateStockIn,
activateStockIn,
deactivateStockIn,
deleteStockIn
};