const { ctrlWrapper, HttpError } = require('../helpers');
const { Driver, User } = require('../models');

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
    ...req,
    created: user.surname,
  };

  res.status(201).json(response);
};

const updateDriver = async (req, res) => {
  const { date, time, city, id } = req.body;
  const driver = await Driver.findByIdAndUpdate(id, { city, time, date });

  res.status(201).json(driver);
};

module.exports = {
  getAllDrivers: ctrlWrapper(getAllDrivers),
  addDriver: ctrlWrapper(addDriver),
  updateDriver: ctrlWrapper(updateDriver),
};
