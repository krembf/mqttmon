var mqtt = require('mqtt')
var client = mqtt.connect('mqtt://localhost:1883')

client.on('connect', function () {
    client.subscribe('presence', function (err) {
        if (!err) {
            client.publish('presence', 'Hello from mqtttest')
        }
    })
})

client.on('message', function (topic, message) {
    // message is Buffer
    console.log(message.toString())
    //client.end()
})

setInterval(() => {
    client.publish('presence', 'Status check from mqtttest');
    //   client.publish('MolDev/Status/278BORIS-DEV/Product', 'MetaProgress')
}, 5000);