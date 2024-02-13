// File not used right now. auth is undefined when I try to import and use this
// in the mailController file. 
exports.smtpTransportOptions = {
  host: process.env.SMTP_SERVICE,
  port: process.env.SMTP_PORT,
  secure: true, 
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD
  }
};
