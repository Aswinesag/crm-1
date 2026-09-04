const ActivityLog = require('../models/ActivityLog');
const Lead = require('../models/Lead');

exports.getLogs = async (req,res) => {
  let query = {};
  switch(req.user.role){
    case 'Super Admin':
    case 'Admin':
      break;
    case 'Coordinator': {
      const leads = await Lead.find({ createdBy:req.user.name }).select('_id');
      query = { leadId:{ $in:leads.map(l=>l._id) } };
      break;
    }
    case 'Engineer': {
      const leads = await Lead.find({ assignedTo:req.user.name }).select('_id');
      query = { leadId:{ $in:leads.map(l=>l._id) } };
      break;
    }
    default:
      return res.status(403).json({success: false, message:'Not allowed' });
  }
  const logs = await ActivityLog.find(query).sort({createdAt: -1}).limit(100);
  res.status(200).json({ success:true, data: logs });
  // const logNameSpace = req.app.get('logNameSpace')
  // if(logNameSpace){
  //   logNameSpace.emit('update',await ActivityLog.find().sort({createdAt: -1}).limit(100))
  // }
};



// controllers/activityLogController.js
exports.markAllLogsAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    const result = await ActivityLog.updateMany(
      {
        $or: [
          { type: "lead_created" },
          { type: "lead_deleted" },
          { type: "user_created" },
          { type: "user_deleted" },
          { type: "leads_uploaded" },
          { type: "status_change", "details.toStatus": "Converted" }
        ],
        readBy: { $ne: userId } // check only userId
      },
      {
        $push: { readBy: userId } // push only userId
      }
    );

    res.status(200).json({
      success: true,
      message: "All logs marked as read",
      modifiedCount: result.modifiedCount
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};




