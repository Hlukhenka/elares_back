const { ctrlWrapper, HttpError } = require('../helpers');
const { Driver, User } = require('../models');

const addDriver = async (req, res) => {
  const { surname } = req.body;
  const { _id: owner } = req.user;

  const user = await User.findById(owner);

  const driver = await Driver.findOne({ surname });

  if (driver) {
    throw HttpError(409, 'Surname already in use');
  }

  const newDriver = await Driver.create(req.body);

  const response = {
    driver: {
      name: newDriver.name,
      surname: newDriver.surname,
      created: user.surname,
    },
  };

  res.status(201).json(response);
};

const updateDriver = async (req, res) => {
  const { date, time, city, id } = req.body;
  const driver = await Driver.findByIdAndUpdate(id, { city, time, date });

  res.status(201).json(driver);
};

module.exports = {
  addDriver: ctrlWrapper(addDriver),
  updateDriver: ctrlWrapper(updateDriver),
};
