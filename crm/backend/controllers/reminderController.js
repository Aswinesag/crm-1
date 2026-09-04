// controllers/reminderController.js
const Reminder = require('../models/Reminder');
const transporter = require('../config/nodemailer')
const User = require('../models/User')

exports.getReminders = async (req, res) => {
  try {
    const user = req.user; // assuming populated by auth middleware: { id, role }

    let reminders;

    if (user.role === 'Super Admin' || user.role === 'Admin') {
      // return all reminders for admins
      reminders = await Reminder.find().sort({ date: 1 }).lean();
    } else if (user.role === 'Coordinator' || user.role === 'Engineer') {
      // return only reminders created by this user
      reminders = await Reminder.find({ userId: user.id }).sort({ date: 1 }).lean();
    } else {
      // unauthorized or no reminders
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ data:reminders , message: 'Reminders fetched successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};


exports.addReminder = async (req, res) => {
  try {
    const user = req.user; // from auth middleware, contains id and role
    const { title, description, date, leadId,engineerIds,customerEmails,gmeetLink } = req.body;
  
    if (!title || !date) {
      return res.status(400).json({ message: 'Title and date are required.' });
    }

    const newReminder = new Reminder({
      title,
      description,
      date,
      userId: user.id,
      createby: user.name,
      leadId: leadId || null, // optional
      createdAt: new Date(),
      updatedAt: new Date(),
      gmeetLink
    });

    const savedReminder = await newReminder.save();

    res.status(201).json({ message: 'Reminder added successfully', reminder: savedReminder });

    const engineers = await User.find({ _id: { $in: engineerIds } });
    const engineerEmails = engineers.map(e => e.email);

    // Fetch lead email if leadId present (assuming leads are also Users, adjust otherwise)
    let leadEmails = [];
    if (leadId) {
      const leadUser = await User.findById(leadId);
      if (leadUser?.email) leadEmails.push(leadUser.email);
    }

    let customerEmail = [];
    if (customerEmails) {
      customerEmail = Array.isArray(customerEmails) ? customerEmails : [customerEmails];
    }

    // Combine unique recipient emails
    const allRecipients = [...new Set([...engineerEmails, ...leadEmails, ...customerEmail])];

    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: allRecipients,
      subject: "Meeting Remainder - SMIE INDUSTRIES PVT LTD",
      html: `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Document</title>
        </head>
        <body>
          <div style="color: black;">                    
            <p style="color: black;">Your meeting has been scheduled in our SMIE INDUSTRIES PVT LTD</p>
            <p>Meeting Tittle : ${title}</p>
            <p>Meeting Date : ${new Date(date).toLocaleString()}</p>  
            ${gmeetLink ? `<p>Meeting Link: <a href="${gmeetLink}">${gmeetLink}</a></p>` : ""}   
          </div>
        </body>
      </html>`
    })
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to add reminder' });
  }
};

async function deleteOldReminders() {
  // Get today's midnight (start of the day)
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0); // reset time to 00:00:00

  // Delete all reminders with date strictly before today
  await Reminder.deleteMany({ date: { $lt: todayStart } });

  console.log('Yesterday and older reminders deleted');
}

deleteOldReminders();
