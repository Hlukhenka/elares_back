const { Schema, model } = require('mongoose');
const Joi = require('joi');
const { handleMongooseError } = require('../helpers');

const driverSchema = new Schema(
  {
    name: { type: String },
    surname: {
      type: String,
    },
    date: {
      type: String,
    },
    time: {
      type: String,
    },
    city: {
      type: String,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
  },
  { versionKey: false, timestamps: true },
);

driverSchema.post('save', handleMongooseError);
const Driver = model('driver', driverSchema);

module.exports = { Driver };
