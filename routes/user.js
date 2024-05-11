const express = require('express');
const singleUpload = require('../middleware/multer');
const {
  createuser,
  loginin,
  forgotPassword,
  logout,
  resetPassword,
  updatePassword,
  updateByUser,
  updatePicByUser,
  getUserProfile,
} = require('../controller/user');
const { authenticateUser } = require('../middleware/auth');
const router = express.Router();
router.post('/register', singleUpload, createuser);

router.post('/login', loginin);

router.post('/forgotpassword', forgotPassword);
router.get('/profile', authenticateUser, getUserProfile);
router.put('/resetpassword', resetPassword);
router.put('/updateprofile', authenticateUser, updateByUser);
router.put('/updatepic', authenticateUser, singleUpload, updatePicByUser);
router.put('/updatepassword', authenticateUser, updatePassword);
router.post('/logout', authenticateUser, logout);

router.post("/success", async (req, res) => {
  console.log("success");
  await orderModel.updateOne(
    { tran_id: req.body.tran_id },
    {
      $set: {
        payment: true,
      
      },
    }
  );
 
  res.redirect(`http://localhost:3000/`);
});


router.post("/fail", async (req, res) => {
  await orderModel.deleteOne({ tran_id: req.body.tran_id });
  res.redirect(`http://localhost:3000/`);
});

router.post("/cancel", async (req, res) => {
  await orderModel.deleteOne({ tran_id: req.body.tran_id });
  res.redirect(`http://localhost:3000/`);
});






module.exports = router;
