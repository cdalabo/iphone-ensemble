require('dotenv').config();
const fs = require('fs');;
const { WebClient } = require('@slack/web-api');
const token = process.env.SLACK_TOKEN;

if (!token) {
  console.error();
  console.error(`I can't find a SLACK_TOKEN. Make sure you have a file called ".env" that contains the SLACK_TOKEN.`);
  console.error(`See .env_sample for an example.`);
  console.error(`You can get a token from https://api.slack.com/custom-integrations/legacy-tokens`);
  console.error();
  process.exit(1);
}


const web = new WebClient(token);
const express = require('express')
const path = require('path');
const bodyParser = require('body-parser');

const app = express()
const port = 3000;
let gChannelId = null;

// app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/static', express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
     res.writeHead(200, {
        "Content-Type": "text/html"
    });
    res.end(fs.readFileSync('index.html', 'utf-8'));
});

app.post('/postChat', (req, res) => {
  if (!gChannelId) {
    console.error('Channel is not loaded yet!');
    return;
  }

  const message = req.body.message;
  // FIXME: Do something with the player? Send everybody their own notification?

  const result = web.chat.postMessage({
    text: message,
    channel: gChannelId,
  });
  res.end('OK');
});

async function loadChannelId()  {
    const channels = await web.conversations.list();
    const channel = channels.channels.find(c => c.name === 'iphone_ensemble_performancechannel');
    gChannelId = channel.id;
    console.log('iPhone Ensemble Performance Channel ID:', gChannelId);
}

loadChannelId();
app.listen(port, () => {
  console.log(`Open the webpage at http://localhost:${port}.`);
  console.log(`(You can hold the Command key to click this link in the Terminal.)`);
})
