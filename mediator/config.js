require('dotenv/config');

module.exports = {
  PORT: process.env.PORT || 5001,
  OPENHIM: {
    username: process.env.OPENHIM_USERNAME,
    password: process.env.OPENHIM_PASSWORD,
    apiURL: process.env.OPENHIM_API_URL,
    trustSelfSigned: true
  }
};
