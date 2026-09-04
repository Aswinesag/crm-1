const User = require("../models/User");
const Lead = require("../models/Lead");
const ActivityLog = require("../models/ActivityLog");
const nodemailer = require("../config/nodemailer");
const cloudinary = require("../utils/cloudinary");



// CREATE USER

exports.createUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phoneNum,
      status,
      tasks,
      location,
      avatar,
    } = req.body;

    if (!name || !email || !password || !role || !phoneNum) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Role-based restriction (KEEP THIS FROM YOUR OLD CODE)
    const allowedRoles = {
      "Super Admin": ["Super Admin", "Admin", "Coordinator", "Engineer"],
      Admin: ["Coordinator", "Engineer"],
    };

    if (
      !allowedRoles[req.user.role] ||
      !allowedRoles[req.user.role].includes(role)
    ) {
      return res.status(403).json({
        success: false,
        message: "Role creation denied",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email Already Exists",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      phoneNum,
      status,
      tasks,
      location,
      avatar,
    });

    res.status(201).json({
      success: true,
      message: "User Created Successfully",
      data: user,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

{/*exports.createUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phoneNum,
      status,
      tasks,
      location
    } = req.body;
    
    let avatar = "";

    if (req.file && req.file.buffer) {
    try {
    const base64 = req.file.buffer.toString("base64");
    const dataUri = `data:${req.file.mimetype};base64,${base64}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "crm_users",
      resource_type: "image",
      timeout: 60000,
    });

    avatar = result.secure_url;
  } catch (err) {
    console.error("Cloudinary Upload Failed:", err);
    return res.status(500).json({
      success: false,
      message: "Image upload failed. Please try again.",
    });
  }
}
    console.log(req.file.mimetype);
    console.log(req.file.size);
    console.log("Cloudinary URL:", avatar);
    console.log("FILE RECEIVED:", req.file);

    if (!name || !email || !password || !role || !phoneNum) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Role-based creation restrictions
    const allowedRoles = {
      "Super Admin": ["Super Admin", "Admin", "Coordinator", "Engineer"],
      Admin: ["Coordinator", "Engineer"],
    };

    if (
      !allowedRoles[req.user.role] ||
      !allowedRoles[req.user.role].includes(role)
    ) {
      return res.status(403).json({
        success: false,
        message: `Role creation denied`,
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email Already Exists",
      });
    }

    const user = await User.create({
        name,
        email,
        password,
        role,
        phoneNum,
        status,
        tasks,
        location,
        avatar
      });

    const log = await ActivityLog.create({
      type: "user_created",
      description: `${req.user.name} created user ${name} with role ${role}`,
      user: req.user.name,
      userId: req.user._id,
      details: { userName: name, userRole: role, createdUserId: user._id },
    });

    const io = req.app.get("io");

    if (io) {
      // send new user to all admins
      io.to("role:Super Admin").emit("newUser", user);
      io.to("role:Admin").emit("newUser", user);

      // send log to all admins
      io.to("role:Super Admin").emit("newLog", log);
      io.to("role:Admin").emit("newLog", log);

      // 🔥 Update engineer task counts if a new engineer is created
      if (role === "Engineer") {
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
          })
        );

        io.emit("engineerTaskCountsUpdated", engineersWithCounts);
      }
    }

    res.status(201).json({
      success: true,
      message: `User Created Successfully`,
      data: { ...user._doc, password: undefined },
    });

    // --- Send Welcome Email ---
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Account Created - SMIE INDUSTRIES PVT LTD",
      html: `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Document</title>
        </head>
        <body>
          <div style="color: black;">                    
            <h2 style="color: black;">Hi ${name.toUpperCase()}, Welcome to SMIE INDUSTRIES PVT LTD</h2>
            <p>Your account has been created in our SMIE INDUSTRIES PVT LTD web application</p>
            <p>Your Email ID : <span style="color: black;">${email}</span></p>
            <p>Your Role : <span style="color: black;">${role}</span></p>
            <p>Your Password : <span style="color: black;">${password}</span></p>
          </div>
        </body>
      </html>`,
    };

    const sendMailPromise = (options) => {
      return new Promise((resolve, reject) => {
        nodemailer.sendMail(options, (err, info) => {
          if (err) reject(err);
          else resolve(info);
        });
      });
    };

    console.time("Send Email");
    sendMailPromise(mailOptions)
      .then((info) => console.timeEnd("Send Email"))
      .catch((err) => {
        console.error("Email send error:", err);
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}; */}


// GET ALL USERS with dynamic tasksAssigned and leadsCreated count
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ userDeleted: false }).select("-password");

    // For each user add:
    // - tasksAssigned: count of active leads assigned (status NOT Converted or Failed)
    // - leadsCreated: count of all leads created by user (any status)
    const usersWithCounts = await Promise.all(
      users.map(async (user) => {
        const tasksAssigned = await Lead.countDocuments({
          assignedTo: user.name,
          status: { $nin: ["Converted", "Lost"] },
        });
        const leadsCreated = await Lead.countDocuments({
          createdBy: user.name,
        });
        return {
          ...user.toObject(),
          tasksAssigned,
          leadsCreated,
        };
      })
    );

    res.status(200).json({ success: true, data: usersWithCounts });

    // const userNameSpace = req.app.get("userNameSpace");
    // if (userNameSpace) {
    //   userNameSpace.emit("update", await User.find());
    // }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// GET SELF OR SUBORDINATES with dynamic tasksAssigned and leadsCreated count
exports.getSelfOrSubordinates = async (req, res) => {
  try {
    let query = {};
    switch (req.user.role) {
      case "Super Admin":
      case "Admin":
        break;
      case "Coordinator":
        query = { role: { $in: ["Coordinator", "Engineer"] } };
        break;
      case "Engineer":
        query = { role: "Engineer" };
        break;
      default:
        return res.status(403).json({ success: false, message: "Not allowed" });
    }

    const users = await User.find(query).select("-password");

    // Add dynamic counts per user
    const usersWithCounts = await Promise.all(
      users.map(async (user) => {
        const tasksAssigned = await Lead.countDocuments({
          assignedTo: user.name,
          status: { $nin: ["Converted", "Lost"] },
        });
        const leadsCreated = await Lead.countDocuments({
          createdBy: user.name,
        });
        return {
          ...user.toObject(),
          tasksAssigned,
          leadsCreated,
        };
      })
    );

    res.status(200).json({ success: true, data: usersWithCounts });

    // const userNameSpace = req.app.get("userNameSpace");
    // if (userNameSpace) {
    //   userNameSpace.emit("update", await User.find());
    // }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// UPDATE USER (Super Admin & Admin only)
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, avatar, isWork } = req.body;

    // Fetch the target user first (BEFORE update)
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Save the current name before update
    const oldUserName = targetUser.name;

    // Restrict Admins: can only update Engineer or Coordinator
    if (
      req.user.role === "Admin" &&
      !["Engineer", "Coordinator"].includes(targetUser.role)
    ) {
      return res.status(403).json({
        success: false,
        message: "Update not allowed",
      });
    }

    if (
      req.user.role === "Super Admin" &&
      !["Admin", "Engineer", "Coordinator"].includes(targetUser.role)
    ) {
      return res.status(403).json({
        success: false,
        message: "Update not allowed " + targetUser.role,
      });
    }

    // Role-based update restrictions
    const allowedRoles = {
      "Super Admin": ["Super Admin", "Admin", "Coordinator", "Engineer"],
      "Admin": ["Coordinator", "Engineer"],
    };

    if (
      role &&
      (!allowedRoles[req.user.role] ||
        !allowedRoles[req.user.role].includes(role))
    ) {
      return res.status(403).json({
        success: false,
        message: `You can't update role : ${role}`,
      });
    }

    // Now update the user
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, avatar, isWork },
      { new: true, runValidators: true }
    );

    // If the user's name changed, update tasksAssigned counts accordingly
    if (name && name !== oldUserName) {
      // Decrement tasksAssigned count for old user name
      await User.updateOne(
        { name: oldUserName },
        {
          $inc: {
            tasksAssigned: -1,
          },
        }
      );

      // Increment tasksAssigned count for new user name
      const newTaskCount = await Lead.countDocuments({
        assignedTo: name,
        status: { $nin: ["Converted", "Lost"] },
      });

      await User.updateOne(
        { name: name },
        {
          $set: {
            tasksAssigned: newTaskCount,
          },
        }
      );
    }

    const log = await ActivityLog.create({
      type: "user_updated",
      description: `${req.user.name} updated user ${user.name}`,
      user: req.user.name,
      userId: req.user._id,
      details: { userName: user.name, updatedUserId: user._id },
    });

    const io = req.app.get("io");

    if (io) {
      // updated user to all admins
      io.to("role:Super Admin").emit("userUpdated", user);
      io.to("role:Admin").emit("userUpdated", user);

      // log to all admins
      io.to("role:Super Admin").emit("newLog", log);
      io.to("role:Admin").emit("newLog", log);
    }

    // const logNameSpace = req.app.get("logNameSpace");
    // if (logNameSpace) {
    //   logNameSpace.emit(
    //     "update",
    //     await ActivityLog.find().sort({ createdAt: -1 }).limit(100)
    //   );
    // }

    res.status(201).json({
      success: true,
      message: `${user.name} Updated Successfully`,
      data: user,
    });

    // const userNameSpace = req.app.get("userNameSpace");
    // if (userNameSpace) {
    //   userNameSpace.emit("update", await User.find());
    // }

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Account Updated - SMIE INDUSTRIES PVT LTD",
      html: `<!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document</title>
          </head>
          <body>
            <div style="color: black;">                    
              <h2 style="color: black;">Hi ${user.name.toUpperCase()}, Welcome to SMIE INDUSTRIES PVT LTD</h2>
              <p>Your updated account in our SMIE INDUSTRIES PVT LTD web application</p>
              <p>Your Email ID : <span style="color: black;">${user.email}</span></p>
              <p>Your Role : <span style="color: black;">${user.role}</span></p>
            </div>
          </body>
        </html>`,
    };

    const sendMailPromise = (options) => {
      return new Promise((resolve, reject) => {
        nodemailer.sendMail(options, (err, info) => {
          if (err) reject(err);
          else resolve(info);
        });
      });
    };
    console.time("Send Email");
    sendMailPromise(mailOptions)
      .then((info) => console.timeEnd("Send Email"))
      .catch((err) => {
        console.error("Email send error:", err);
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// DELETE USER (Super Admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent self-deletion
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    

    

    // const deletion = await User.findByIdAndDelete(req.params.id);
    const dummyDelete = await User.findById(req.params.id);
    dummyDelete.userDeleted = true;
    dummyDelete.isWork = false;
    const updatedUser = await dummyDelete.save();

    const log =await ActivityLog.create({
      type: "user_deleted",
      description: `${req.user.name} deleted user ${user.name}`,
      user: req.user.name,
      userId: req.user._id,
      details: { userName: user.name, deletedUserId: user._id },
    });

    
    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: dummyDelete,
    });

    const io = req.app.get("io");
    if (io) {
    // Emit to admins & super admins
    io.to("role:Super Admin").emit("userUpdated", updatedUser);
    io.to("role:Admin").emit("userUpdated", updatedUser);

    // Emit the log as well
    io.to("role:Super Admin").emit("newLog", log);
    io.to("role:Admin").emit("newLog", log);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.updateSelfProfile = async (req, res) => {
  try {
    console.log("FILE:", req.file);
    const updateData = {};
    
if (req.file) {

  // Delete old avatar
  if (req.user.avatarPublicId) {
    await cloudinary.uploader.destroy(req.user.avatarPublicId);
  }

  const base64 = req.file.buffer.toString("base64");

  const dataUri = `data:${req.file.mimetype};base64,${base64}`;

  const uploadResult = await cloudinary.uploader.upload(dataUri, {
    folder: `users/${req.user._id}`,
    resource_type: "image",
    timeout: 120000,
    transformation: [
      {
        width: 300,
        height: 300,
        crop: "fill",
      },
    ],
  });

  updateData.avatar = uploadResult.secure_url;
  updateData.avatarPublicId = uploadResult.public_id;
}

    if (req.body.name.trim() === "") {
      return res
        .status(400)
        .json({ success: false, message: "Name is required" });
    }
    updateData.name = req.body.name;

   if (req.body.phoneNum.trim() === "") {
  return res
    .status(400)
    .json({ success: false, message: "Phone number is required" });
}
    updateData.phoneNum = req.body.phoneNum;

    if (req.body.location !== undefined) {
  updateData.location = req.body.location;
}

    // 3. If nothing is being updated, stop here
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid changes provided",
      });
    }

    // 4. Update the user in MongoDB
    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Profile updated", data: user });

    // Create activity log
    // const log = await ActivityLog.create({
    //   type: "profile_updated",
    //   description: `${req.user.name} updated their profile`,
    //   user: req.user.name,
    //   userId: req.user._id,
    //   details: {
    //     userName: user.name,
    //     updatedUserId: user._id,
    //   },
    // });
    const io = req.app.get("io");
    if (io) {
    // Emit to admins & super admins
    io.to("role:Super Admin").emit("userUpdated", user);
    io.to("role:Admin").emit("userUpdated", user);

    // Emit the log as well
    // io.to("role:Super Admin").emit("newLog", log);
    // io.to("role:Admin").emit("newLog", log);
    }
    
    // const userNameSpace = req.app.get("userNameSpace");
    // if (userNameSpace) {
    //   userNameSpace.emit("update", await User.find());
    // }
  } catch (err) {
    console.error("CLOUDINARY ERROR:", err);
    return res.status(500).json({ success: false, message: "Image upload failed" });
  }
};

// Delete Avatar Controller
exports.deleteAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    if (user.avatar) {
      // Extract public_id from Cloudinary URL
      const publicId = user.avatar.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`users/${req.user._id}/${publicId}`);
    }

    user.avatar = null; // Or set to a default avatar URL
    const updatedUser = await user.save();

    // const log = {
    //   action: "Avatar Deleted",
    //   performedBy: req.user._id,
    //   targetUser: user._id,
    //   timestamp: new Date(),
    //   details: `${req.user.name || "A user"} deleted their avatar.`,
    // };

    // await ActivityLog.create(log);
    res.status(200).json({ success: true, message: "Avatar deleted", data: user });

    const io = req.app.get("io");
    if (io) {
    // Emit to admins & super admins
    io.to("role:Super Admin").emit("userUpdated", updatedUser);
    io.to("role:Admin").emit("userUpdated", updatedUser);

    // Emit the log as well
    // io.to("role:Super Admin").emit("newLog", log);
    // io.to("role:Admin").emit("newLog", log);
    }  
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const cleanOldUsers = async () => {
  try {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const result = await User.deleteMany({
      userDeleted: true,
      updatedAt: { $lte: threeMonthsAgo },
    });
    if (result.deletedCount > 0) {
      console.log(`${result.deletedCount} users permanently removed from DB`);
    }
  } catch (err) {
    console.error("Error deleting old users:", err.message);
  }
};

setInterval(cleanOldUsers, 24 * 60 * 60 * 1000);
cleanOldUsers(); // optional: run immediately on server start

exports.getDeletedUsers = async (req, res) => {
  try {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const deletedUsers = await User.find({
      userDeleted: true,
      updatedAt: { $gte: threeMonthsAgo }, // only last 3 months
    }).select("-password");

    res.status(200).json({ success: true, data: deletedUsers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
