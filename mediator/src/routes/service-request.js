const {Router} = require('express');
const {createServiceRequest} = require('../controllers/service-request');
const {requestHandler} = require('../utils/request');
const {validateBodyAgainst} = require('../middlewares');
const {createServiceSchema} = require('../middlewares/schemas/service-request');

const router = Router();

router.post(
  '/',
  validateBodyAgainst(createServiceSchema),
  requestHandler(req => createServiceRequest(req.body))
);

module.exports = router;
