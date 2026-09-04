const Ticket = require("../models/Ticket");
const sendEmail = require("../utils/sendEmail");

// ✅ CREATE TICKET
exports.createTicket = async (req, res) => {
  try {
    const { title, description, category, image } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ message: "All fields required" });
    }

    const ticket = await Ticket.create({
      user: req.user._id,
      title,
      description,
      category,
      image, // ✅ just URL
    });

    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `New Ticket Raised: ${title}`,
      text: `
        New Ticket Created
        
        User ID: ${req.user._id}
        Title: ${title}
        Description: ${description}
        Category: ${category}
      `,
    });

    res.status(201).json({
      success: true,
      message: "Ticket created successfully",
      ticket,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating ticket" });
  }
};

// ✅ GET TICKET COUNT ONLY
exports.getTicketCount = async (req, res) => {
  try {
    const count = await Ticket.countDocuments({ user: req.user._id });

    res.json({
      success: true,
      count,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching count" });
  }
};

// GET All Ticket

exports.getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate("user", "name email") // optional: get user details
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      tickets,
    });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ✅ UPDATE TICKET STATUS
exports.updateTicketStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const updatedTicket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedTicket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.json(updatedTicket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};