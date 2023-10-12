var mongoose = require('mongoose');
var personal_schema = new mongoose.Schema({
  userid:{
    type: String,
    required: true,
    unique: true
  },
  name: { type: String, required:true },
  email: { type: String, required:true },
  phone: {type: String, required:true},
  password: {
    type: String,
    required: true
  },

  clientId: {type: String},
  clientSecret: {type: String},
  accessToken: {type: String},

  typeOfUser: {type: String},
  caregiver: [{type: String}],
  provider: [{type: String}],

  temperature: [ { value: {type: Number}, time: {type: Date, default: Date.now()} } ],
  activity: [ { typeofActivity: {type: String},  value: {type: Number}, time: {type: Date, default: Date.now()} } ],

  movement_baseline_low:{type: Number},
  movement_baseline_high:{type: Number},
  water_intake_oz_baseline:{type: Number},
  food_intake_baseline:{type: Number},
  heart_rate_baseline_low:{type: Number},
  heart_rate_baseline_high:{type: Number},
  temperature_baseline:{type: Number},

  messages: [ {from: String, msg: String} ],
  events: [ {time: {type: Date, default: Date.now()}, event: {type: String}}],

  virtual_buttons:  {checkup_button: {type: Number}, fall_button: {type: Number}, heart_rate_button: {type: Number}, water_button: {type: Number}, activity_button: {type: Number}},

  fall_notification: { status: {type: String}, time: {type: Date, default: Date.now()} },
  food_notification: { status: {type: String}, time: {type: Date, default: Date.now()} },
  water_notification: { status: {type: String}, time: {type: Date, default: Date.now()} },
  movement_notification: { status: {type: String}, time: {type: Date, default: Date.now()} },
  heart_notification: { status: {type: String}, time: {type: Date, default: Date.now()} },
});

module.exports = mongoose.model('Personal',personal_schema);
