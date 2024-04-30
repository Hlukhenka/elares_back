const { Schema, model } = require('mongoose');
const Joi = require('joi');
const { handleMongooseError } = require('../helpers');

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    surname: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: [true, 'Set password for user'],
    },

    token: {
      type: String,
      default: null,
    },

    admin: {
      type: Boolean,
      default: false,
    },

    drivers: [{ type: Schema.Types.ObjectId, ref: 'driver' }],
  },
  { versionKey: false, timestamps: true },
);

userSchema.post('save', handleMongooseError);
const User = model('user', userSchema);

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(30).required(),
  surname: Joi.string().min(2).max(30).required(),
  password: Joi.string().min(6).max(15).required(),
});

const loginSchema = Joi.object({
  name: Joi.string().min(2).max(30).required(),
  surname: Joi.string().min(2).max(30).required(),
  password: Joi.string().min(6).max(15).required(),
});

const schemas = {
  registerSchema,
  loginSchema,
};

module.exports = { schemas, User };
