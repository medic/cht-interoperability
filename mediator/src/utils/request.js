function requestHandler(handler) {
  return  (req, res) => {
    handler(req)
    .then(({status, data}) => {
      res.status(status).send(data);
    });
  };
}

module.exports = {
  requestHandler,
};
