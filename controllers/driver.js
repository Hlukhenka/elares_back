require('dotenv').config();
const { ctrlWrapper, HttpError } = require('../helpers');
const { Driver, User } = require('../models');
const { PublicKey, PrivateKey } = process.env;
const webpush = require('web-push');

const getAllDrivers = async (req, res) => {
  const drivers = await Driver.find();

  res.status(201).json({ drivers });
};

const addDriver = async (req, res) => {
  const { surname } = req.body;
  const {
    _id: owner,
    name: createdBy,
    surnameOwner: createdBySurname,
  } = req.user;

  const user = await User.findById(owner);
  const driver = await Driver.findOne({ surname });

  if (driver) {
    throw HttpError(409, 'Surname already in use');
  }

  await Driver.create({
    ...req.body,
    owner,
    created: {
      name: createdBy,
      surname: createdBySurname,
    },
  });

  const response = {
    ...req.body,
    created: user.surname,
  };

  console.log(response);
  res.status(201).json(response);
};

const updateDriver = async (req, res) => {
  const { date, time, city, id, notes, name, surname } = req.body;

  const subscriptions = req.user.subscription;
  console.log(subscriptions);

  const driver = await Driver.findByIdAndUpdate(
    id,
    {
      name,
      surname,
      city,
      time,
      date,
      notes,
    },
    { new: true },
  );

  console.log(webpush);

  webpush.setVapidDetails(
    'mailto:anastasiagluhenka@gmail.com',
    PublicKey,
    PrivateKey,
  );

  const sendNotification = async (subscription, dataToSend) => {
    try {
      await webpush.sendNotification(subscription, JSON.stringify(dataToSend));
      console.log('Notification sent successfully!');
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  subscriptions.forEach(async subscription => {
    await sendNotification(subscription, { message: 'Driver updated' });
    console.log(subscription);
  });

  res.status(201).json(driver);
};

const deleteDriver = async (req, res) => {
  const { id } = req.params;
  const deletedDriver = await Driver.findByIdAndDelete(id);

  if (deletedDriver === null) {
    throw HttpError(404, 'Not found');
  }

  res.status(200).json(deletedDriver);
};

module.exports = {
  getAllDrivers: ctrlWrapper(getAllDrivers),
  addDriver: ctrlWrapper(addDriver),
  updateDriver: ctrlWrapper(updateDriver),
  deleteDriver: ctrlWrapper(deleteDriver),
};
