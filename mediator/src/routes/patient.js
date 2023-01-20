const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient');

router.post('/', async function(req, res) {
  const { status, patient } = await patientController.createPatient(req.body);
  res.send({status, patient});
});

module.exports = router;
