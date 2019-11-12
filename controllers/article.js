const Article = require('../models/article');
const ServerError = require('../errors/server-err');

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = (req.user);
  Article.create({ name, owner, link })
    .then((card) => {
      if (!card) {
        throw new ServerError('Внутренняя ошибка сервера');
      }
      res.send({ data: card });
    })
    .catch(next);
};
