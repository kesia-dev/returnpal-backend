const path = require('path');
const multer = require('multer');

// Create API endpoints in Node

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, Date.now() + ext);
    }
});

const upload = multer({ 
    storage: storage, 
    fileFilter: function(req, file, cb) {
        if (
            file.mimetype === 'image/jpeg' ||
            file.mimetype === 'image/png' ||
            file.mimetype === 'image/jpg'   
        ) {
            cb(null, true);
        } else {
            console.log('Only .png, .jpg and .jpeg files are supported!');
            cb(null, false);
        }
    },
});

module.exports = upload;