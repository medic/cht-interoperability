const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient');

router.post('/', async function(req, res) {
  const patient = await patientController.createPatient(req);
  res.send({status: 'success', patient});
});

module.exports = router;
