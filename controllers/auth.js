require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { ctrlWrapper, HttpError } = require('../helpers');
const { SECRET_KEY } = process.env;
const { User } = require('../models');

const signup = async (req, res) => {
  const { surname, password, name } = req.body;

  const user = await User.findOne({ surname });

  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }

  if (user) {
    throw HttpError(409, 'Surname already in use');
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    ...req.body,
    password: hashPassword,
  });

  const payload = {
    id: newUser._id,
  };

  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '24h' });

  await User.findByIdAndUpdate(newUser._id, { token });

  const response = {
    user: {
      name: newUser.name,
      surname: newUser.surname,
    },
    token,
  };
  res.status(201).json(response);
};

const signin = async (req, res) => {
  const { surname, password } = req.body;

  const user = await User.findOne({ surname });

  if (!user) {
    throw HttpError(401, 'Surname or password invalid');
  }

  const passwordCompare = await bcrypt.compare(password, user.password);

  if (!passwordCompare) {
    throw HttpError(401, 'Surname or password invalid');
  }

  const payload = {
    id: user._id,
  };

  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '24h' });

  await User.findByIdAndUpdate(user._id, { token });

  res.json({
    token,
    user: { name: user.name, surname: user.surname },
  });
};

const current = async (req, res) => {
  const { name, surname } = req.user;

  res.json({
    user: {
      name,
      surname,
    },
  });
};

const addSubscription = async (req, res) => {
  const { id } = req.user;
  const user = await User.findById(id);

  const newEndpoint = req.body.endpoint;
  const userEndpoint = user.subscription;

  if (!userEndpoint) {
    user.subscription.push(req.body);
    await user.save();
    return res.status(201).json({ message: 'Subscription added successfully' });
  }

  const endpointExists = user.subscription.some(
    endpoint => endpoint === newEndpoint,
  );

  if (endpointExists) {
    return res.status(409).json({ message: 'Endpoint already in use' });
  }
  res.status(201).json({ message: 'Subscription added successfully' });
};

const signout = async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: '' });

  res.status(204).end();
};

module.exports = {
  signup: ctrlWrapper(signup),
  signin: ctrlWrapper(signin),
  current: ctrlWrapper(current),
  signout: ctrlWrapper(signout),
  addSubscription: ctrlWrapper(addSubscription),
};
