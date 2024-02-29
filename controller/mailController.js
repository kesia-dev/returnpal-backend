const nodemailer = require('nodemailer');

const SMTP_SERVICE = process.env.SMTP_SERVICE;
const SMTP_PORT = process.env.SMTP_PORT;
const SMTP_EMAIL = process.env.SMTP_EMAIL;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;

const smtpTransport = nodemailer.createTransport({
  host: SMTP_SERVICE,
  port: SMTP_PORT,
  secure: true, 
  auth: {
    user: SMTP_EMAIL,
    pass: SMTP_PASSWORD
  }
});

exports.sendMail = async (to, subject, body) => {
  console.log("SendMail", { to, subject, body });
  try {
    const mailOptions = {
      from: "ReturnPal",
      to,
      subject,
      html: body
    }
    console.log({ mailOptions })
    await smtpTransport.sendMail(mailOptions);
    console.log("SendMail success");
  } catch (err) {
    console.log("SendMail error", { err })
  } 
}

exports.sendVerificationEmail = async (email, res) => {
  link="http://localhost:4100/verify";

  mailOptions={
    from: "ReturnPal",
    to : email,
    subject : 'ReturnPal - Verify your email',
    html : "Hello,<br> Please click on the link to verify your email.<br> <a href="+link+">Click here to verify</a>" 
  }

  smtpTransport.sendMail(mailOptions, function(mailErr, mailRes) {
    console.log({ mailRes, mailErr });
    if (mailErr) {
      return res.status(500).json({ error: mailErr });
    }
    return res.status(201).json({ message: 'User registered successfully', user });
  });
}