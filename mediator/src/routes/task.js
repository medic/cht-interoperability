const {Router} = require('express');
const {createTask} = require('../controllers/task');
const {requestHandler} = require('../utils/request');
const {validateBodyAgainst} = require('../middlewares');
const {createTaskSchema} = require('../middlewares/schemas/task');

const router = Router();

router.post(
  '/',
  validateBodyAgainst(createTaskSchema),
  requestHandler(req => createTask(req.body))
);

module.exports = router;
