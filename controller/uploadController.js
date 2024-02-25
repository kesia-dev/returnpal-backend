const fs = require('fs');
const path = require('path');
// const File = require('../models/returnProcessSchema');

exports.uploadFile = (req, res) => {
  const tempPath = req.file.path;
  const targetPath = path.join(__dirname, "../uploads/shippinglabel.png");

  if (path.extname(req.file.originalname).toLowerCase() === ".png" || 
      path.extname(req.file.originalname).toLowerCase() === ".jpg" || 
      path.extname(req.file.originalname).toLowerCase() === ".jpeg") {
        if (req.body.labelType === 'Physical') {
          physicalLabel(targetPath);
        } else if (
          req.body.labelType === 'Digital') {
            digitalLabel(targetPath);
        } else if (
          req.body.labelType === 'Amazon') {
            amazonLabel(targetPath);
        }
    fs.rename(tempPath, targetPath, err => {
      if (err) return console.error(err.message);
      res
        .status(200)
        .end("File uploaded successfully!");
    });
  } else {
    fs.unlink(tempPath, err => {
      if (err) return console.error(err.message);
      res
        .status(403)
        .contentType("text/plain")
        .end("Only .png files are allowed!");
    });
  }
};