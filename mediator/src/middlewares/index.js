function validateBodyAgainst(schema, options) {
  return (req, res, next) => {
    schema.validateAsync(req.body, {abortEarly: true, ...options})
      .then(() => next())
      .catch(({details}) => res.status(400).send(details[0]));
  };
}

module.exports = {
  validateBodyAgainst,
};
