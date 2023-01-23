const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient');
const { validateBodyAgainst } = require('../middlewares');
const { createPatientSchema } = require('../middlewares/schemas/patient');

router.post('/',
  validateBodyAgainst(createPatientSchema),
  async function(req, res) {
    const { status, patient } = await patientController.createPatient(req.body);
    res.send({status, patient});
});

module.exports = router;
