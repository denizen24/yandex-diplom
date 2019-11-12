const bcrypt = require('bcrypt');
const User = require('../models/user');
const BadReqError = require('../errors/bad-req');

module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    .then((user) => {
      if (user) {
        return res.send({ data: user });
      }
      throw new BadReqError('Ошибка запроса');
    })
    .catch(next);
};
