const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, text }) => {
  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD } = process.env;

  if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASSWORD) {
    throw new Error("Email SMTP configuration is incomplete");
  }

  const port = Number(EMAIL_PORT || 587);
  const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port,
    secure: port === 465,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: EMAIL_USER,
    to,
    subject,
    text,
  });
};

module.exports = sendEmail;
