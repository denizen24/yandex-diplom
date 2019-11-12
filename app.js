const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const mongoose = require('mongoose');
const helmet = require('helmet');
const { celebrate, Joi, errors } = require('celebrate');
const homeRoutes = require('./routes/home');
const usersRoutes = require('./routes/users');
const articleRoutes = require('./routes/article');
const auth = require('./middlewares/auth');
const { createUser } = require('./controllers/users');
const { login } = require('./controllers/login');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const undfRoute = { message: 'Запрашиваемый ресурс не найден' };

const app = express();
require('dotenv').config();

mongoose.connect('mongodb://localhost:27017/news_site', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

app.use(requestLogger);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cookieParser());
app.use(helmet());

app.use('/', homeRoutes);

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().min(6).max(38),
    password: Joi.string().required().min(8),
  }),
}), login);

app.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    email: Joi.string().required().min(6).max(38),
    password: Joi.string().required().min(8),
  }),
}), createUser);

app.use('/users/me', auth, usersRoutes);
app.use('/article', auth, articleRoutes);

app.use(errorLogger);
app.use(errors());

app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;
  res
    .status(statusCode)
    .send({
      message: statusCode === 500 ? 'На сервере произошла ошибка' : message,
    });
});

app.use('*', (req, res) => {
  res.status(404).send(undfRoute);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT);
