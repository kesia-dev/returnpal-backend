const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { Image } = require('../models/returnProcessSchema');

exports.uploadFile = async (req, res) => {
  const tempPath = req.file.path;
  const targetPath = path.join(__dirname, `../../uploads/${req.file.originalname}`);

  if (['.png', '.jpg', '.jpeg'].includes(path.extname(req.file.originalname).toLowerCase())) {
    if (req.body.labelType === 'Physical') {
      physicalLabel(targetPath);
    } else if (req.body.labelType === 'Digital') {
      digitalLabel(targetPath);
    } else if (req.body.labelType === 'Amazon') {
      amazonLabel(targetPath);
    }
    fs.readFile(tempPath, async (err, data) => {
  if(err) {
    console.error(err.message);
    return res.status(500).end("There was an error.");
  }
  zlib.gzip(data, async (err, compressedData) => {
    if  (err) {
      console.error(err.message);
      return res.status(500).end('There was an error:', err);
    }
    const newImage = new Image({
      name: req.file.originalname,
      image: {
        data: compressedData, // This stores the new compressed data.
        contentType: req.file.mimetype
      }
    });
    try {
      await newImage.save();
      fs.unlink(tempPath, err => {
        if (err) console.error(err.message);
      });
      res.status(200).end('File uploaded and saved to database successfully!');
    } catch (error) {
      console.error(error.message);
      res.status(500).end('Server error');
      }
    })
  })
}};