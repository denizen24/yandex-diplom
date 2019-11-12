const { Router } = require('express');
const { celebrate, Joi, errors } = require('celebrate');
const { requestLogger, errorLogger } = require('../middlewares/logger');
const { updateProfile } = require('../controllers/updateProfile');
const { updateAvatar } = require('../controllers/updateAvatar');
const NotFoundError = require('../errors/not-found-err');


const User = require('../models/user');

const router = Router();

router.use(requestLogger);

router.get('/', (req, res) => {
  User.find({})
    .then((user) => res.send({ data: user }))
    .catch(() => res.status(500).send({ message: 'Произошла ошибка' }));
});

router.get('/:id', celebrate({
  params: Joi.object().keys({
    id: Joi.string().alphanum().length(24),
  }),
}), (req, res, next) => {
  User.findById(req.params.id)
    .then((user) => {
      if (user) {
        res.send({ data: user });
      }
      throw new NotFoundError('Нет пользователя с таким id');
    })
    .catch(next);
});

router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
  }),
}), updateProfile);

router.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required().min(5),
  }),
}), updateAvatar);

router.use(errorLogger);
router.use(errors());

module.exports = router;
