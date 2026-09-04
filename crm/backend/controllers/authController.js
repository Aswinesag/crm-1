const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const nodemailer = require('../config/nodemailer')
const bcrypt = require('bcryptjs')

const sendToken = (user,res) => {
  const token = jwt.sign({ id:user._id }, process.env.JWT_SECRET, { expiresIn:process.env.JWT_EXPIRE });
  res.cookie('token', token, {
    httpOnly: true,
    secure: true,           // MUST be true on deployed site
    sameSite: 'lax',       // REQUIRED for cross-domain cookies
    path: '/',              // RECOMMENDED
  });
  res.status(200).json({ success: true,message: `${user.name} logged in Successfully`,token: token, data:{ id:user._id,name:user.name,email:user.email,role:user.role,avatar:user.avatar } });
};


exports.login = async (req,res) => {
  const { email,password } = req.body;
  if(!email || !password){
    return res.status(401).json({ success: false, message:'All fields are required' });
  }
  const user = await User.findOne({ email }).select('+password');
  console.log("users: ",user)
  if(!user){
    return res.status(401).json({ success: false, message:'Invalid Email' });
  }
  if (!await user.verifyPassword(password)) {
    return res.status(401).json({ success: false, message:'Invalid Password' });
  }
  if(user.userDeleted){
    return res.status(400).json({success: false,message: "This account has been deleted and can't logged in"})
  }
  user.lastLogin = Date.now();
  user.active = "Online";
  await user.save();

  //socket used for when user click login it will show online 
  // const userNameSpace = req.app.get('userNameSpace')
  // if(userNameSpace){
  //   userNameSpace.emit('update',await User.find())
  // }

  await ActivityLog.create({ type:'user_login',description:`${user.name} logged in`,user:user.name,userId:user._id });

  // const logNameSpace = req.app.get('logNameSpace')
  // if(logNameSpace){
  //   logNameSpace.emit('update',await ActivityLog.find().sort({createdAt: -1}).limit(100))
  // }
  
  sendToken(user,res);
};

exports.logout = async (req,res) => {

  //socket used for when user click logout it will show offline
  if(req.user){
    await User.findByIdAndUpdate(req.user._id,{active: "Offline"})
    // const userNameSpace = req.app.get('userNameSpace')
    // if(userNameSpace){
    //   userNameSpace.emit('update',await User.find())
    // }
  }

  res.cookie('token','none',{ expires:new Date(Date.now()+10*1000),httpOnly:true });
  res.status(200).json({ success: true, message:'Logged out Successfully' });
};

exports.getMe = async (req,res) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({ success: true, data: user });
  // const userNameSpace = req.app.get('userNameSpace')
  // if(userNameSpace){
  //   userNameSpace.emit('update',await User.find())
  // }
};

exports.forgotPassword = async(req,res) => {
    try{
        const {email} = req.body;
        if(!email){ 
            return res.status(400).json({success: false,message: "Email is required"})
        }
        const isEmail = await User.findOne({email})
        if(!isEmail){
            return res.status(400).json({success: false,message: "Email doesn't exists"})
        }
        const token = jwt.sign({id: isEmail.id},process.env.JWT_SECRET)
        const resetURL = `${process.env.API_URL}/reset-password/${isEmail._id}/${token}`;

        res.status(200).json({success: true,message: `Go to check your email : ${isEmail.name}`,data: {email: isEmail}})

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Password Reset Request - SMIE INDUSTRIES PVT LTD',
            html: `
                <h3 style="color: black;">Hi ${isEmail.name}, </h3>
                <p style="color: black;">Click the link below to reset your password:</p>
                <p>👉  <a href="${resetURL}">Reset Password</a></p>
            `
        };

        const sendMailPromise = (options) => { 
          return new Promise((resolve, reject) => {
            nodemailer.sendMail(options, (err, info) => {
              if (err) reject(err);
              else resolve(info);
            })
          })
        }
        console.time("Send Email");
        sendMailPromise(mailOptions)
          .then((info) => console.timeEnd("Send Email"))
          .catch(err => {
              console.error("Email send error:", err)
          })

    }catch(err){
        console.log(`Forget Password Error : ${err.message}`)
        res.status(500).json({success: false,message: "Internal Server Error"})
    }
}

exports.resetPassword = async(req,res) => {
    try{
        const {id,token} = req.params;
        if(!id || !token){
            return res.status(400).json({success: false,message: "Invalid ID and Token"})
        }
        const {password} = req.body;
        if(!password){
            return res.status(400).json({success: false,message: "Password is required"})
        }
        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        if(decoded.id !== id){
            return res.status(400).json({success: false,message: "Unauthorized or token mismatch"})
        }
        const hashedpass = await bcrypt.hash(password,10)
        const updateUser = await User.findByIdAndUpdate(id,{password: hashedpass},{new: true})
        if(!updateUser){
            return res.status(400).json({success: false,message: "User not found"})
        }
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: updateUser.email,
            subject: 'Password Reset Successfully - SMIE INDUSTRIES PVT LTD',
            html : `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Document</title>
            </head>
            <body>
                <div style="color: black;">                    
                    <h2 style="color: black;">Hi ${updateUser.name.toUpperCase()},</h2>
                    <p>Your password reset successfully in our SMIE INDUSTRIES PVT LTD application</p>
                    <p>Your Email ID : <span style="color: black;">${updateUser.email}</span></p>
                    <p>Your Role : <span style="color: black;">${updateUser.role}</span></p>
                    <p>Your New Password : <span style="color: black;">${password}</span></p>
                </div>
            </body>
            </html>`
        }
        // await nodemailer.sendMail(mailOptions)
        const sendMailPromise1 = (options) => {
          return new Promise((resolve, reject) => {
            nodemailer.sendMail(options, (err, info) => {
              if (err) reject(err);
              else resolve(info);
            })
          })
        }
        console.time("Send Email");
        sendMailPromise1(mailOptions)
          .then((info) => console.timeEnd("Send Email"))
          .catch(err => {
              console.error("Email send error:", err)
          })
        const mailAdminOptions = {
            from: process.env.SENDER_EMAIL,
            to: process.env.ADMIN_EMAIL,
            subject: 'User Changed Password - SMIE INDUSTRIES PVT LTD',
            html : `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Document</title>
            </head>
            <body>
                <div style="color: black;">                    
                  <h2 style="color: black;">This ${updateUser.name.toUpperCase()} user is changed her/his password from SMIE INDUSTRIES PVT LTD</h2>
                  <p>Her/His password reset successfully in our SMIE INDUSTRIES PVT LTD web application</p>
                  <p>Her/His Email ID : <span style="color: black;">${updateUser.email}</span></p>
                  <p>Her/His Role : <span style="color: black;">${updateUser.role}</span></p>
                  <p>Her/His New Password : <span style="color: black;">${password}</span></p>
                </div>
            </body>
            </html>`
        }
        // await nodemailer.sendMail(mailAdminOptions)
        const sendMailPromise2 = (options) => {
          return new Promise((resolve, reject) => {
            nodemailer.sendMail(options, (err, info) => {
              if (err) reject(err);
              else resolve(info);
            })
          })
        }
        // console.time("Send Email");
        sendMailPromise2(mailAdminOptions)
          .then((info) => console.timeEnd("Send Email"))
          .catch(err => {
              console.error("Email send error:", err)
          })
        res.status(200).json({success: true,message: 'Password reset successfully',data: updateUser})
    }catch(err){
        console.log(`Reset Password Error : ${err.message}`)
        res.status(500).json({success: false,message: "Internal Server Error"})
    }
}