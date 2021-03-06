var express = require('express');
var router = express.Router();
const multer = require('multer')
const {addItem, showItem, removeItem} = require('../controllers/itemsController')
const {sendUploadGCS} = require('../middlewares/uploadGCS')
const {authUser} = require('../middlewares/auth')

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
  }
})

router.get('/', showItem)
// router.post('/', addItem)
router.post('/upload', upload.single('image'), sendUploadGCS, addItem)
router.delete('/:id', authUser, removeItem)

module.exports = router;
