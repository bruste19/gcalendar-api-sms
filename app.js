require('dotenv').config()
var express = require('express');

var app = express();
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

const port = 8080;
const apiKey = process.env.API_KEY;

/**
 * Server status
 */
app.get('/', function (req, res) {
   res.json({ message: "Server Running!" });
})

/**
 * IFTT hook
 */
app.post('/webhook', function (req, res) {
    const { message, phoneNumber } = parseMessage(req.body);
    sendSms(message, phoneNumber);

    res.status(200).send();
 })

/**
 * 
 * @param {string} message - SMS body
 * @param {string} destinationNumber - French phone number
 */
function sendSms(message, destinationNumber) {
    console.log(message, destinationNumber);

    fetch('https://api.httpsms.com/v1/messages/send', {
        method: 'POST',
        headers: {
            'x-api-key': apiKey,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ "from": "+330649890064", "to": `+33${destinationNumber}`, "content": message })
    })
    .then(res => res.json())
    .then((data) => console.log(data));
    
};

function parseMessage(event) {
    let messageTemplate = (name, startTime) => `Bonjour Mr/Mme. ${name}\nCeci est un message automatique pour vous rappeler votre rendez-vous de kinésithérapie aujourd'hui à ${startTime}`
    
    let patientName = event?.title?.match(/\(([^)]+)\)/)[1];
    let phoneNumber = event?.description?.split("\n").pop();
    let startTime = event?.startTime?.split("at")?.pop()?.trim();

    return { message: messageTemplate(patientName, startTime), phoneNumber: phoneNumber }
};


app.listen(port, function () {
   console.log(`Example app listening at ${port}`);
})


