var mongoose = require('mongoose'),
    moment = require('moment'),
    Schema = mongoose.Schema;

var schema = new Schema({
  title: {type: String, required: true, trim: true},
  email: {type: String, required: true, trim: true},
  type: {type: String, required: true, trim: true},
  content: {type: String, required: true, trim: true},
  numComment: {type: Number, default: 0},
  numAnswer: {type: Number, default: 0},
  createdAt: {type: Date, default: Date.now},
  category1 : {type: String, trim: true, default: 0},
  category2 : {type: String, trim: true, default: 0},
  category3 : {type: String, trim: true, default: 0},
  category4 : {type: String, trim: true, default: 0}
}, {
  toJSON: {virtuals: true },
  toObject: {virtuals: true}
});

var Survey = mongoose.model('Survey', schema);

module.exports = Survey;
