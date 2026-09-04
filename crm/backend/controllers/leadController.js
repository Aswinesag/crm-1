const Lead = require("../models/Lead");
const ActivityLog = require("../models/ActivityLog");
const User = require("../models/User");
const transport = require("../config/nodemailer");
const PDFDocument = require("pdfkit");
const path = require("path");
const XLSX = require("xlsx");
const fs = require("fs");

const companies = [
  {
    key: "SMIE",
    name: "SMIE INDUSTRIES PRIVATE LIMITED",
    primary: "#FF6600",
    secondary: "#FFCC80",
    logoPath: "../public/logo.png",
  },
  {
    key: "FLOQ",
    name: "FLOQ INDUSTRIES PRIVATE LIMITED",
    primary: "#0066CC",
    secondary: "#99CCFF",
    logoPath: "../public/FloQ-Logo.png",
  },
];

function getCompanyConfig(selectedKey) {
  // Find matching config or fall back to the first entry
  return companies.find((c) => c.key === selectedKey) || companies[0];
}

exports.getLeads = async (req, res) => {
  let query = {};
  switch (req.user.role) {
    case "Super Admin":
    case "Admin":
      break;
    case "Coordinator":
      query = { createdBy: req.user.name, status: { $ne: "deleted" } };
      break;
    case "Engineer":
      query = { assignedTo: req.user.name, status: { $ne: "deleted" } };
      break;
    default:
      return res.status(403).json({ success: false, message: "Not allowed" });
  }
  const leads = await Lead.find(query).sort("-createdAt");
  res.status(200).json({ success: true, data: leads });
  // const leadNameSpace = req.app.get('leadNameSpace')
  // leadNameSpace.emit('update',await Lead.find())
};
exports.getdeletedLeads = async (req, res) => {
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  const deletedleads = await Lead.find({
    status: "deleted",
    updatedAt: { $gte: threeMonthsAgo },
  }).sort("-createdAt");
  res.status(200).json({ success: true, data: deletedleads });
};

exports.uploadLeads = async (req, res) => {
  try {
    const { excel } = req.files;

    if (!excel || !excel.name.endsWith(".xlsx")) {
      if (excel?.tempFilePath) fs.unlinkSync(excel.tempFilePath);
      return res
        .status(400)
        .json({ success: false, message: "Only .xlsx files are allowed" });
    }

    // Read Excel file
    const workbook = XLSX.readFile(excel.tempFilePath);
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const uploadedLeads = [];
    const io = req.app.get("io"); // socket.io instance

    for (let i = 0; i < data.length; i++) {
      const {
        firstName,
        lastName,
        name,
        company,
        email,
        phone,
        country,
        state,
        city,
        address,
      } = data[i];

      // Skip duplicate leads for today
      const existingLead = await Lead.findOne({
        name,
        email,
        status: { $ne: "deleted" }, // only check non-deleted leads
        createdAt: { $gte: todayStart, $lte: todayEnd },
      });
      if (existingLead) continue;

      // Create lead
      const lead = await Lead.create({
        firstName,
        lastName,
        name,
        company,
        email,
        phone,
        country,
        state,
        city,
        address,
        createdBy: req.user.name,
      });

      uploadedLeads.push(lead);
    }

    fs.unlinkSync(excel.tempFilePath); // cleanup temp file

    if (uploadedLeads.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No new leads to upload (duplicates skipped)",
      });
    }

    // Create a single activity log for the batch
    const log = await ActivityLog.create({
      type: "leads_uploaded",
      description: `${uploadedLeads.length} leads uploaded by ${req.user.name}`,
      user: req.user.name,
      userId: req.user._id,
      leadIds: uploadedLeads.map((l) => l._id),
      details: {
        leads: uploadedLeads.map((l) => ({ name: l.name, email: l.email })),
        leadcount: uploadedLeads.length,
      },
    });

    // Emit sockets
    if (io) {
      // Emit each lead individually
      uploadedLeads.forEach((lead) => {
        io.to("role:Super Admin").emit("newLead", lead);
        io.to("role:Admin").emit("newLead", lead);
      });

      // Emit the batch log once
      io.to("role:Super Admin").emit("newLog", log);
      io.to("role:Admin").emit("newLog", log);
    }

    res.status(201).json({
      success: true,
      message: `${uploadedLeads.length} Leads added successfully`,
      data: uploadedLeads,
    });
  } catch (err) {
    console.log(`Upload leads error: ${err.message}`);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// CREATE LEAD
exports.createLead = async (req, res) => {
  try {
    const leadData = {
      ...req.body,
      createdBy: req.user.name,
      coordinator_id: req.body._id || null,
    };
    console.log(leadData);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const existingLead = await Lead.findOne({
      name: req.body.name,
      email: req.body.email,
      createdAt: { $gte: todayStart, $lte: todayEnd },
    });

    if (existingLead) {
      return res
        .status(400)
        .json({ success: false, message: "Already lead exist for today" });
    }

    const lead = await Lead.create(leadData);
    const io = req.app.get("io"); // we need to store io in app.js
    if (io) {
      io.to("role:Super Admin").emit("newLead", lead);
      io.to("role:Admin").emit("newLead", lead);
    }

    // Log activity
    const log = await ActivityLog.create({
      type: "lead_created",
      description: `Lead '${lead.name}' created ${
        lead?.assignedTo ? `and assigned to ${lead.assignedTo}` : ``
      }`,
      user: req.user.name,
      userId: req.user._id,
      leadId: lead._id,
      details: {
        leadName: lead.name,
        assignedTo: lead.assignedTo,
      },
    });

    if (io) {
      io.to("role:Super Admin").emit("newLog", log);
      io.to("role:Admin").emit("newLog", log);

      io.to("role:Super Admin").emit("newLog", log);
      io.to("role:Admin").emit("newLog", log);
    }

    // const logNameSpace = req.app.get('logNameSpace')
    // if(logNameSpace){
    //   logNameSpace.emit('update',await ActivityLog.find().sort({createdAt: -1}).limit(100))
    // }

    res.status(201).json({ success: true, data: lead });

    // const leadNameSpace = req.app.get('leadNameSpace')
    // leadNameSpace.emit('update',await Lead.find())
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// UPDATE LEAD
exports.updateLead = async (req, res) => {
  try {
    let lead = await Lead.findById(req.params.id);
    console.log("Found lead for update:", lead);
    if (!req.params.id) {
      return res.status(400).json({ success: false, message: "ID Not Found" });
    }
    if (!lead) {
      return res
        .status(404)
        .json({ success: false, message: "Lead not found" });
    }

    // Check permissions
    const canUpdate =
      req.user.role === "Super Admin" ||
      req.user.role === "Admin" ||
      (req.user.role === "Coordinator" && lead.createdBy === req.user.name) ||
      (req.user.role === "Engineer" && lead.assignedTo === req.user.name);

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this lead",
      });
    }

    const oldStatus = lead.status;
    console.log("req.body", req.body);
    lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    console.log("Updated lead:", lead);

    // Log status change if status was updated
    if (req.body.status && req.body.status !== oldStatus) {
      let log;
      let description = `${lead.name} status changed from '${oldStatus}' to '${req.body.status}'`;

      if (req.body.status === "Lost" && req.body.failedReason) {
        description += ` - Reason: ${req.body.failedReason}`;
      }
      if (req.body.status === "deleted") {
        log = await ActivityLog.create({
          type: "lead_deleted",
          description: `Lead '${lead.name}' deleted by ${req.user.name}`,
          user: req.user.name,
          userId: req.user._id,
          leadId: lead._id,
          details: { leadName: lead.name },
        });
      } else {
        log = await ActivityLog.create({
          type: "status_change",
          description,
          user: req.user.name,
          userId: req.user._id,
          leadId: lead._id,
          details: {
            leadName: lead.name,
            fromStatus: oldStatus,
            toStatus: req.body.status,
            ...(req.body.failedReason && {
              failureReason: req.body.failedReason,
              failureMessage: req.body.failedMessage,
            }),
          },
        });
      }
      const io = req.app.get("io"); // we need to store io in app.js
      if (io) {
        io.to("role:Super Admin").emit("leadUpdated", lead);
        io.to("role:Admin").emit("leadUpdated", lead);
        io.to(`user:${lead.coordinator_id}`).emit("leadUpdated", lead);
        if (lead.engineer_id) {
          io.to(`user:${lead.engineer_id}`).emit("leadUpdated", lead);
        }
        io.to("role:Super Admin").emit("newLog", log);
        io.to("role:Admin").emit("newLog", log);
        console.log("📢 Lead updated & emitted:", lead._id);
      }

      // const logNameSpace = req.app.get('logNameSpace')
      // if(logNameSpace){
      //   logNameSpace.emit('update',await ActivityLog.find().sort({createdAt: -1}).limit(100))
      // }
    }

    res.status(200).json({ success: true, data: lead });

    // const leadNameSpace = req.app.get('leadNameSpace')
    // leadNameSpace.emit('update',await Lead.find())
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// DELETE LEAD
// DELETE LEAD
exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res
        .status(404)
        .json({ success: false, message: "Lead not found" });
    }

    // Log deletion before removing
    // await ActivityLog.create({
    //   type:        'lead_deleted',
    //   description: `Lead '${lead.name}' deleted by ${req.user.name}`,
    //   user:        req.user.name,
    //   userId:      req.user._id,
    //   leadId:      lead._id,
    //   details:     { leadName: lead.name }
    // });

    // const logNameSpace = req.app.get('logNameSpace')
    // if(logNameSpace){
    //   logNameSpace.emit('update',await ActivityLog.find().sort({createdAt: -1}).limit(100))
    // }

    const deletion = await Lead.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Lead deleted successfully",
      data: deletion,
    });

    // const leadNameSpace = req.app.get('leadNameSpace')
    // leadNameSpace.emit('update',await Lead.find())
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ADD NOTE TO LEAD
exports.addNote = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res
        .status(404)
        .json({ success: false, message: "Lead not found" });
    }

    // Check permissions
    const canAddNote =
      req.user.role === "Super Admin" ||
      req.user.role === "Admin" ||
      (req.user.role === "Coordinator" && lead.createdBy === req.user.name) ||
      (req.user.role === "Engineer" && lead.assignedTo === req.user.name);

    if (!canAddNote) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to add notes to this lead",
      });
    }

    const newNote = {
      text: req.body.text,
      author: req.user.name,
      timestamp: new Date(),
    };

    lead.notes.push(newNote);
    lead.updatedAt = new Date();
    await lead.save();

    // Log activity
    await ActivityLog.create({
      type: "note_added",
      description: `Note added to ${lead.name}: '${req.body.text}'`,
      user: req.user.name,
      userId: req.user._id,
      leadId: lead._id,
      details: {
        leadName: lead.name,
        noteText: req.body.text,
      },
    });

    // const logNameSpace = req.app.get('logNameSpace')
    // if(logNameSpace){
    //   logNameSpace.emit('update',await ActivityLog.find().sort({createdAt: -1}).limit(100))
    // }

    res.status(200).json({ success: true, data: lead });

    // const leadNameSpace = req.app.get('leadNameSpace')
    // leadNameSpace.emit('update',await Lead.find())
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
// UPDATE ASSIGNED TO (Only Admin / Super Admin / Coordinator who created it)
exports.updateAssignedTo = async (req, res) => {
  try {
    const { assignedTo, engineer_id } = req.body;
    console.log("Reassigning lead to:", assignedTo, engineer_id);

    // Find the lead
    let lead = await Lead.findById(req.params.id);
    console.log("Found lead:", lead);
    if (!lead) {
      return res
        .status(404)
        .json({ success: false, message: "Lead not found" });
    }

    // Check permissions
    const canUpdate =
      req.user.role === "Super Admin" ||
      req.user.role === "Admin" ||
      (req.user.role === "Coordinator" && lead.createdBy === req.user.name);

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to reassign this lead",
      });
    }

    // Save previous engineer for task count adjustment
    const prevEngineerId = lead.engineer_id;

    // Update fields
    lead.assignedTo = assignedTo;
    lead.engineer_id = engineer_id;
    const updatedLead = await lead.save();

    // Emit to relevant users
    const io = req.app.get("io");
    if (io) {
      io.to("role:Super Admin").emit("leadUpdated", updatedLead);
      io.to("role:Admin").emit("leadUpdated", updatedLead);
      io.to(`user:${lead.coordinator_id}`).emit("leadUpdated", updatedLead);
      if (lead.engineer_id) {
        io.to(`user:${lead.engineer_id}`).emit("leadUpdated", updatedLead);
      }

      // 🔥 Also update engineer task counts
      const engineers = await User.find({
        role: "Engineer",
        userDeleted: false,
      }).select("name email");
      const engineersWithCounts = await Promise.all(
        engineers.map(async (engineer) => {
          const taskCount = await Lead.countDocuments({
            assignedTo: engineer.name,
            status: { $nin: ["Converted", "Lost"] },
          });
          return {
            _id: engineer._id,
            name: engineer.name,
            email: engineer.email,
            assignedTaskCount: taskCount,
          };
        }),
      );

      io.emit("engineerTaskCountsUpdated", engineersWithCounts);
    }

    return res.status(200).json({ success: true, data: lead });
  } catch (error) {
    console.error("Error updating assignedTo:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getEngineersWithTaskCount = async (req, res) => {
  try {
    // Find all users with role Engineer
    const engineers = await User.find({
      role: "Engineer",
      userDeleted: false,
    }).select("name email");

    // For each engineer get count of active assigned leads (tasks)
    const engineersWithCounts = await Promise.all(
      engineers.map(async (engineer) => {
        const taskCount = await Lead.countDocuments({
          assignedTo: engineer.name,
          status: { $nin: ["Converted", "Lost"] }, // active tasks only
        });

        return {
          _id: engineer._id,
          name: engineer.name,
          email: engineer.email,
          assignedTaskCount: taskCount,
        };
      }),
    );

    return res.status(200).json({
      success: true,
      data: engineersWithCounts,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const cleanOldLeads = async () => {
  try {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const result = await Lead.deleteMany({
      status: "deleted",
      updatedAt: { $lte: threeMonthsAgo },
    });
    if (result.deletedCount > 0) {
      console.log(`${result.deletedCount} leads permanently removed from DB`);
    }
  } catch (err) {
    console.error("Error deleting old leads:", err.message);
  }
};

// Schedule cleanup every 24 hours
setInterval(cleanOldLeads, 24 * 60 * 60 * 1000);
// Optionally run once on server start
cleanOldLeads();

exports.sendQuotation = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });
    const config = getCompanyConfig(lead.selectedCompany);

    // Now use config.primary, config.secondary, config.name, config.logoPath
    const primaryColor = config.primary;
    const secondaryColor = config.secondary;
    const companyNameFull = config.name;
    const logoFile = path.join(__dirname, config.logoPath);
    const watermarkText = config.key;
    // 1. Create PDF
    const doc = new PDFDocument({ margin: 50 });
    let buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", async () => {
      const pdfData = Buffer.concat(buffers);

      // 3. Send email with PDF
      await transport.sendMail({
        from: process.env.SMTP_USER,
        to: lead.email,
        subject: "Your Quotation",
        text: `Hi ${lead.firstName} ${lead.lastName}, ${lead.quoteMessage}`,
        attachments: [
          {
            filename: "quotation.pdf",
            content: pdfData,
          },
        ],
      });
      console.log("Email sent successfully" + process.env.ADMIN_EMAIL);
      lead.status = "Quotation Sent";
      lead.sentEmail = "true";
      await lead.save();
      await ActivityLog.create({
        type: "status_change",
        description: `Status updated to ${lead.status} after sending quotation`,
        user: req.user.name,
        userId: req.user._id,
        leadId: lead._id,
        details: {
          leadName: lead.name,
          toStatus: lead.status,
        },
      });

      res.status(201).json({
        success: true,
        message: "Quotation sent and status updated successfully!",
      });
    });

    const pageHeight = doc.page.height;

    function drawFooter() {
      const barHeight = 30;
      const lineHeight = 5;
      const yPos = pageHeight - barHeight;

      let grad = doc.linearGradient(0, yPos, 600, yPos);
      grad.stop(0, primaryColor).stop(1, "#FFFFFF");
      doc.fillColor(grad);
      doc.rect(0, yPos, 700, barHeight).fill();

      let grad2 = doc.linearGradient(
        0,
        yPos - lineHeight,
        600,
        yPos - lineHeight,
      );
      grad2.stop(0, "#FFFFFF").stop(1, primaryColor);
      doc.fillColor(grad2);
      doc.rect(0, yPos - lineHeight, 700, lineHeight).fill();
    }

    // WATERMARK FUNCTION - UPDATED TO USE TEXT INSTEAD OF IMAGE
    function addWatermark() {
      try {
        // Save current graphics state
        doc.save();

        // Set opacity for watermark
        doc.opacity(0.15); // Slightly more visible for text

        // Calculate center position for rotation
        const pageWidth = doc.page.width;
        const pageHeight = doc.page.height;
        const centerX = pageWidth / 2;
        const centerY = pageHeight / 2;

        // Move to center and rotate
        doc.translate(centerX, centerY);
        doc.rotate(-45); // Diagonal from left to right

        // Set font and color for watermark text
        doc
          .fontSize(180) // Large font size for watermark
          .font("Helvetica-Bold")
          .fillColor(primaryColor); // Orange color

        // Add watermark text centered
        doc.text(watermarkText, -450, -100, {
          // Adjust positioning to center the text
          align: "center",
        });

        // Restore graphics state
        doc.restore();
      } catch (error) {
        console.log("Watermark text error occurred:", error.message);
        // Continue without watermark if error occurs
      }
    }


    // PAGE 1 CONTENT
    let topGrad = doc.linearGradient(0, 0, 600, 0);
    topGrad.stop(0, primaryColor).stop(1, "#FFFFFF");
    doc.fillColor(topGrad);
    doc.rect(0, 0, 700, 30).fill();

    let topGrad2 = doc.linearGradient(0, 0, 600, 0);
    topGrad2.stop(0, "#FFFFFF").stop(1, primaryColor);
    doc.fillColor(topGrad2);
    doc.rect(0, 35, 700, 5).fill();

    doc.image(path.join(logoFile), 20, 50, {
      width: 100,
    });

    doc.fontSize(20).fillColor(primaryColor).text(companyNameFull, 180, 70);

    doc
      .fontSize(10)
      .fillColor("#C57906")
      .text("Customer :", 30, 150, { underline: true });
    doc
      .fontSize(10)
      .fillColor("#000000")
      .text(`${lead.company}`, 32, 190, { width: 300 });
    doc
      .fontSize(10)
      .fillColor("#808080")
      .text(
        `${lead.address}, ${lead.city}, ${lead.state}, ${lead.country}`,
        32,
        210,
        { width: 300 },
      );

    doc.rect(350, 130, 200, 130).fillColor(secondaryColor).fill();
    doc
      .fontSize(10)
      .fillColor("#C57906")
      .text("Customer Reference data", 355, 140);
    doc
      .fontSize(10)
      .fillColor("#000000")
      .text("Reference    : ", 355, 160, { continued: true })
      .fillColor("#000000")
      .text(`${lead.quotationId}`);
    doc
      .fontSize(10)
      .fillColor("#000000")
      .text("Date             : ", 355, 180, { continued: true })
      .fillColor("#000000")
      .text(`${lead.quoteDate.toLocaleDateString()}`);
    doc
      .fontSize(10)
      .fillColor("#000000")
      .text("Contact Person  : ", 355, 200, { continued: true })
      .fillColor("#000000")
      .text(`${lead.firstName} ${lead.lastName}`);
    doc
      .fontSize(10)
      .fillColor("#000000")
      .text("Telephone    : ", 355, 220, { continued: true })
      .fillColor("#000000")
      .text(`${lead.phone}`);
    doc
      .fontSize(10)
      .fillColor("#000000")
      .text("Email            : ", 355, 240, { continued: true })
      .fillColor("#078AF5")
      .text(`${lead.email}`, 355, 240, { underline: true });

    doc
      .fontSize(10)
      .fillColor("#000000")
      .text("Subject : ", 32, 380, { continued: true, width: 380 })
      .text(`OFFER FOR ${lead.quotePumpName}`);
    doc
      .fontSize(10)
      .fillColor("#000000")
      .text(
        `Enquiry Ref – Verbal Enquiry Date : ${lead.quoteDate.toLocaleDateString()} `,
        32,
        400,
        { width: 300 },
      );

    doc.rect(350, 300, 200, 130).fillColor(secondaryColor).fill();
    doc
      .fontSize(10)
      .fillColor("#C57906")
      .text(`${watermarkText} - Reference data`, 355, 310);
    doc
      .fontSize(10)
      .fillColor("#000000")
      .text("Quotation ID     : ", 355, 330, { continued: true })
      .fillColor("#000000")
      .text(`${lead.quotationId}`);
    doc
      .fontSize(10)
      .fillColor("#000000")
      .text("Date                  : ", 355, 350, { continued: true })
      .fillColor("#000000")
      .text(`${lead.quoteDate.toLocaleDateString()}`);
    doc
      .fontSize(10)
      .fillColor("#000000")
      .text("Contact             : ", 355, 370, { continued: true })
      .fillColor("#000000")
      .text(`${lead.quoteSenderName}`);
    doc
      .fontSize(10)
      .fillColor("#000000")
      .text("Mobile               : ", 355, 390, { continued: true })
      .fillColor("#000000")
      .text(`${lead.quoteSenderNumber}`);
    doc
      .fontSize(10)
      .fillColor("#000000")
      .text("Direct Email      : ", 355, 410, { continued: true })
      .fillColor("#078AF5")
      .text(`${lead.quoteSenderEmail}`, 355, 410, { underline: true });

    doc
      .moveTo(10, 450)
      .lineTo(600, 450)
      .lineWidth(1)
      .strokeColor("#000000")
      .stroke();
    doc.fontSize(8).fillColor("#000000").text("Dear Sir/Madam,", 32, 470);
    doc
      .fontSize(8)
      .fillColor("#000000")
      .text(
        "We thank you very much for your above-mentioned enquiry.  Based on the same we are pleased to submit our technocommercial offer.",
        32,
        490,
      );
    doc
      .fontSize(8)
      .fillColor("#000000")
      .text("Following Annexure will form part of this offer", 32, 510);
    doc
      .fontSize(8)
      .fillColor("#000000")
      .text("Annexure 1 Technical submittals", 32, 530);
    doc
      .fontSize(8)
      .fillColor("#000000")
      .text("Annexure 2 General terms and conditions", 32, 540);
    doc
      .fontSize(8)
      .fillColor("#000000")
      .text(
        "We trust that the offer is inline with your requirement. Please do let us know in case any clarification is required; we will be happy to provide the same.",
        32,
        560,
      );
    doc
      .fontSize(8)
      .fillColor("#000000")
      .text(
        "We look forward for your valued order and we assure our prompt services always.",
        32,
        580,
      );
    doc.fontSize(8).fillColor("#000000").text("Best Regards,", 32, 640);
    doc
      .fontSize(10)
      .fillColor("#000000")
      .text(`For ${companyNameFull} `, 32, 660);

    doc
      .fontSize(10)
      .fillColor("#FF0000")
      .text(`${lead.quoteBranchName} - `, 20, 715, {
        continued: true,
        width: 400,
      })
      .fillColor("#808080")
      .text(`${lead.quoteAddress}`);
    doc.image(path.join(__dirname, "../public/ksb-logo.png"), 400, 680, {
      width: 200,
    });

    drawFooter();

    // ADD WATERMARK TO PAGE 1
    addWatermark();

    // PAGE 2 - ANNEXURE 1
    doc.addPage();

    doc.image(path.join(logoFile), 20, 10, {
      width: 100,
    });

    doc.fontSize(20).fillColor(primaryColor).text(companyNameFull, 180, 30);

    doc.fontSize(10).fillColor("#000000").text("Annexure - 1", 285, 90);
    doc
      .fontSize(10)
      .fillColor("#000000")
      .text(`OFFER FOR ${lead.partnerName}`, 250, 120);

    const startX = 50;
    const startY = 150;
    const rowHeight = 15; // smaller row height for compactness
    const colWidths = [200, 200]; // two columns: label and value

    const rows = [
      ["Tag", `  ${lead.tag}`],
      ["Quantity", `  ${lead.qty}`],
      ["Application", `  ${lead.application}`],
      ["Liquid", `  ${lead.liquid}`], //this color only i want red
      ["Flow m3/hr", `  ${lead.flowm}`],
      ["Head m", `  ${lead.headm}`],
      ["Density (kg/m3)", `  ${lead.density}`],
      ["Suction Pr", `  ${lead.suctionPR}`],
      ["Duty", `  ${lead.duty}`],
      ["PUMP OFFERED", ""],
      ["Make", `  ${lead.make}`],
      ["Pump model", `  ${lead.pumpModel}`],
      ["Pump Size – Suction/Discharge", `  ${lead.pumpSize}`],
      ["Capacity", `  ${lead.capacity}`],
      ["Discharge Pressure", `  ${lead.dischargePressure}`],
      ["Relief Valve", `  ${lead.reliefValue}`],
      ["Relief Valve Set pressure", `  ${lead.reliefValueSetPressure}`],
      ["Shaft Seal", `  ${lead.shaftSeal}`],
      ["Bearing", `  ${lead.Bearing}`],
      ["Operating Temperature", `  ${lead.operatingTem}`],
      ["Design temperature", `  ${lead.designTem}`],
      ["Hydrotest pressure", `  ${lead.hydrotestTem}`],
      ["Mounting", `  ${lead.mounting}`],
      ["DRIVE DATA", ""],
      ["Drive", `  ${lead.drive}`],
      ["BKW at duty point", `  ${lead.BKWDutyPoint}`],
      ["BKW at RV Set pressure", `  ${lead.BKWRVSetPressure}`],
      ["Motor", `  ${lead.motor}`],
      ["MATERIALS OF CONSTRUCTION", ""],
      ["Pump body", `  ${lead.pumpBody}`],
      ["Rotor", `  ${lead.rotor}`],
      ["Shaft", `  ${lead.shaft}`],
      ["PRICE", ""],
      ["PRICE FOR PUMP", `  ${lead.price}`],
    ];

    rows.forEach((row, i) => {
      const y = startY + i * rowHeight;

      if (row[1] === "") {
        // Single-column spanning rows (centered)
        const totalWidth = colWidths[0] + colWidths[1];
        doc.rect(startX, y, totalWidth, rowHeight).stroke();
        doc
          .font("Helvetica-Bold")
          .fontSize(7)
          .fillColor("black")
          .text(row[0], startX, y + 3, {
            width: totalWidth,
            align: "center",
          });
      } else {
        // Normal two-column rows

        // Label cell in black
        doc.rect(startX, y, colWidths[0], rowHeight).stroke();
        doc
          .font("Helvetica-Bold")
          .fontSize(7)
          .fillColor("black")
          .text(row[0], startX, y + 3, {
            width: colWidths[0],
            align: "center",
          });

        // Value cell color conditionally red or black
        const valueColor =
          row[0] === "Liquid" || row[0] === "Relief Valve" ? "red" : "black";

        doc.rect(startX + colWidths[0], y, colWidths[1], rowHeight).stroke();
        doc
          .font("Helvetica")
          .fontSize(7)
          .fillColor(valueColor)
          .text(row[1], startX + colWidths[0], y + 3, {
            width: colWidths[1],
            align: "left",
          });
      }
    });

    doc
      .fontSize(10)
      .fillColor("#FF0000")
      .text(`${lead.quoteBranchName} - `, 20, 715, {
        continued: true,
        width: 400,
      })
      .fillColor("#808080")
      .text(`${lead.quoteAddress}`);
    doc.image(path.join(__dirname, "../public/ksb-logo.png"), 400, 680, {
      width: 200,
    });

    doc.fillColor(topGrad);
    doc.rect(0, 0, 700, 30).fill();

    doc.fillColor(topGrad2);
    doc.rect(0, 35, 700, 5).fill();

    drawFooter();

    // ADD WATERMARK TO PAGE 2
    addWatermark();

    // PAGE 3 - ANNEXURE 2
    doc.addPage();

    doc.image(path.join(logoFile), 20, 10, {
      width: 100,
    });

    doc.fontSize(20).fillColor(primaryColor).text(companyNameFull, 180, 30);

    doc.fontSize(10).fillColor("#000000").text("Annexure - 2", 285, 100);

    doc
      .fontSize(12)
      .fillColor("#000000")
      .text("Commercial Terms and Conditions", 32, 200);
    doc
      .fontSize(10)
      .fillColor("#000000")
      .text("1. Price basis / Incoterms        :  ", 32, 240, {
        continued: true,
      })
      .text(`${lead.incoterms}`);
    doc
      .fontSize(10)
      .fillColor("#000000")
      .text("2. Packaging and forwarding   :  ", 32, 260, { continued: true })
      .text(`${lead.pakFor}`);
    doc
      .fontSize(10)
      .fillColor("#000000")
      .text("3. IEC Code                             :  ", 32, 280, {
        continued: true,
      })
      .text(`${lead.IECCode}`);
    doc
      .fontSize(10)
      .fillColor("#000000")
      .text("4. GST                                     :  ", 32, 300, {
        continued: true,
      })
      .text(`18%`);
    doc
      .fontSize(10)
      .fillColor("#000000")
      .text("5. Payment Terms                    :  ", 32, 320, {
        continued: true,
      })
      .text(`100% advance with PO`);
    doc
      .fontSize(10)
      .fillColor("#000000")
      .text("6. Delivery Time                       :  ", 32, 340, {
        continued: true,
      })
      .text(
        `Tag ${lead.deliveryTime} Weeks from date of receipt of your PO along with advance.`,
      );
    doc
      .fontSize(10)
      .fillColor("#000000")
      .text("7. Freight                                  :  ", 32, 360, {
        continued: true,
      })
      .text(`Extra and actual`);
    doc
      .fontSize(10)
      .fillColor("#000000")
      .text("8. Warranty                               :  ", 32, 380, {
        continued: true,
      })
      .text(`12 Month from date of dispatch manufacturing defects`);
    doc
      .fontSize(10)
      .fillColor("#000000")
      .text("9. Validity of offer                      :  ", 32, 400, {
        continued: true,
      })
      .text(`30 Days`);

    doc
      .fontSize(10)
      .fillColor("#000000")
      .text(
        "Above prices include only components and works as strictly described in our technical offer.",
        32,
        500,
      );
    doc
      .fontSize(10)
      .fillColor("#000000")
      .text(
        "Our offer is based on our General Terms and Conditions as attached herewith.",
        32,
        520,
      );
    doc.fontSize(10).fillColor("#000000").text("Best regards,", 32, 540);
    doc.fontSize(12).fillColor("#000000").text(companyNameFull, 32, 560);
    doc
      .fontSize(10)
      .fillColor("#000000")
      .text(`${lead.quoteSenderName}`, 32, 580);
    doc
      .fontSize(10)
      .fillColor("#000000")
      .text(`${lead.quoteSenderNumber}`, 32, 600);

    doc
      .fontSize(10)
      .fillColor("#FF0000")
      .text(`${lead.quoteBranchName} - `, 20, 715, {
        continued: true,
        width: 400,
      })
      .fillColor("#808080")
      .text(`${lead.quoteAddress}`);
    doc.image(path.join(__dirname, "../public/ksb-logo.png"), 400, 680, {
      width: 200,
    });

    doc.fillColor(topGrad);
    doc.rect(0, 0, 700, 30).fill();

    doc.fillColor(topGrad2);
    doc.rect(0, 35, 700, 5).fill();

    drawFooter();

    // ADD WATERMARK TO PAGE 3
    addWatermark();

    doc.end();
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Error sending quotation" });
  }
};

exports.getCompanyDetail = async (req, res) => {
  try {
    const companyName = req.params.company;

    const result = await Lead.findOne({
      company: { $regex: `^${companyName}$`, $options: "i" },
    }).sort({ createdAt: -1 }).lean();
    res.status(200).json({ status: true, message: "Getting company details",data: result });
  } catch (error) {
    console.log(`Get company detail error : ${error.message}`);
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

exports.updateDelivery = async (req, res) => {
  try {
    const { dispatchNo, deliveryStatus, products } = req.body;

    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    // Update only delivery-related fields
    lead.dispatchNo = dispatchNo;
    lead.deliveryStatus = deliveryStatus;

    if (products) {
      lead.products = products;
    }

    await lead.save();

    res.status(200).json({
      success: true,
      message: "Delivery updated successfully",
      data: lead,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed" });
  }
};