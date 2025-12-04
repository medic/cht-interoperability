jest.mock('dotenv', () => ({
  config: jest.fn(() => {
    // Set the environment variables you need for your tests
    process.env.DOCKER_ENV = 'false';
    process.env.PORT = '8080';
    process.env.OPENHIM_USERNAME = 'mock_openhim_user';
    process.env.OPENHIM_PASSWORD = 'mock_openhim_password';
    process.env.OPENHIM_API_URL = 'http://mock-openhim.com';
    process.env.FHIR_URL = 'http://mock-fhir.com';
    process.env.FHIR_USERNAME = 'mock_fhir_user';
    process.env.FHIR_PASSWORD = 'mock_fhir_password';
    process.env.CHT_URL = 'http://mock-cht.com';
    process.env.CHT_USERNAME = 'mock_cht_user';
    process.env.CHT_PASSWORD = 'mock_cht_password';
    return { error: null };
  }),
}));

jest.mock('path', () => ({
  resolve: jest.fn(() => '/mock/path/.env'),
}));
