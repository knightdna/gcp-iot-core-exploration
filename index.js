const jwt = require('jsonwebtoken');
const mqtt = require('async-mqtt');

const projectId = '';
const deviceId = 'A123456789_12+123456789_12345678';
const registryId = '';
const region = 'europe-west1';
const algorithm = '';
const privateKeyFile = `./keys/${deviceId}/rsa_private.pem`;
const mqttBridgeHostname = 'mqtt.googleapis.com';
const mqttBridgePort = 8883;

const mqttClientId = `projects/${projectId}/locations/${region}/registries/${registryId}/devices/${deviceId}`;

const createJwt = (projectId, privateKeyFile, algorithm) => {
  const token = {
    iat: parseInt(Date.now() / 1000),
    exp: parseInt(Date.now() / 1000) + 20 * 60, // 20 minutes
    aud: projectId,
  };
  const privateKey = fs.readFileSync(privateKeyFile);
  return jwt.sign(token, privateKey, {algorithm: algorithm});
};

const connectionArgs = {
  host: mqttBridgeHostname,
  port: mqttBridgePort,
  clientId: mqttClientId,
  username: 'unused',
  password: createJwt(projectId, privateKeyFile, algorithm),
  protocol: 'mqtts',
  rejectUnauthorized: true,
  secureProtocol: 'TLSv1_2_method',
};

async function testConnect() {
  try {
    const client = await mqtt.connectAsync(connectionArgs);
    console.log('Connected');

    await client.publish(`/devices/${deviceId}/commands`, JSON.stringify({ message: 'Just a telemetry event' }));
    console.log('Published');

    await client.end();
    console.log('Disconnected');
  } catch (error) {
    console.error(error);
  }
}

exports.main = () => {
  testConnect()
    .then(() => console.log('Done'))
    .catch(error => console.log('An unknown error has happened'));
};
