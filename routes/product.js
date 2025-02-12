const express = require('express');

const {
  createproduct,
  readallproduct,
  readsingleproduct,
  removeproduct,
  updateproduct,
  getAdminProducts,
  addProductImage,
  deleteProductImage,
  addCategory,
  getAllCategories,
  deleteCategory,
  addResturant,
  getAllResturant,
  deleteResturant,
} = require('../controller/product');
const singleUpload = require('../middleware/multer');
const { authenticateUser, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.get('/all', readallproduct);
router.get('/admin', authenticateUser, getAdminProducts);
router.post(
  '/create',
  authenticateUser,
  authorizeRoles,
  singleUpload,
  createproduct
);
// by Id
router.get('/productbyid/:_id', readsingleproduct);
router.put('/admin/:_id', authenticateUser, authorizeRoles, updateproduct);
router.delete('/admin/:_id', authenticateUser, authorizeRoles, removeproduct);

router
  .route('/images/:id')
  .post(authenticateUser, authorizeRoles, singleUpload, addProductImage)
  .delete(authenticateUser, authorizeRoles, deleteProductImage);

// router.get('/admin', authenticateUser, authorizeRoles, getAdminProducts);

router.post('/category', authenticateUser, authorizeRoles, addCategory);

router.get('/categories', getAllCategories);
router.delete(
  '/categories/:_id',
  authenticateUser,
  authorizeRoles,
  deleteCategory
);

router.post('/resturant',addResturant);

router.get('/resturants', getAllResturant);
router.delete(
  '/resturants/:_id',
  deleteResturant
);


module.exports = router;
