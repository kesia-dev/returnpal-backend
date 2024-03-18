const mailer = require("./mailController");
exports.sendmail = async (req, res) => {
    try {
        const subject = "ReturnPal - Contact";
       const {email,firstName,lastName,message}=req.body;
        const body =
            `${firstName} ${lastName} <br> ${message} <br> user email : ${email}`
     await mailer.sendMail('Info@returnpal.ca', subject, body);;
        res.json({message:"SendMail success"});
      } catch (err) {
        throw Error("Error occurred while sending email");
    } 
   
};