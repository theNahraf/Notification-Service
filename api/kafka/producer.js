const { Kafka } = require("kafkajs");
const config = require("../config");

const kafka = new Kafka({ 
  clientId: config.kafkaClientId, 
  brokers: config.kafkaBrokers,
  ssl: config.kafkaSsl,
  sasl: config.kafkaSasl
});
const producer = kafka.producer();
let connected = false;

async function getProducer() {
  if (!connected) {
    await producer.connect();
    connected = true;
  }
  return producer;
}

module.exports = { getProducer };
