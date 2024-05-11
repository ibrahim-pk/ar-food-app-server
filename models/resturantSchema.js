const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  category: {
    type: String,
    required: [true, 'Please Enter Category'],
  },
});

const Resturant = mongoose.model('Resturant', schema);

module.exports = Resturant;
