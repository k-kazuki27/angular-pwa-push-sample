const keys = require('./push-server-keys.json');
const subscribers = [
  // Here would be any subscribers endpoints,
  // therefore this is gonna be a list of, so called, 'target list'.
  // You should sotre this list to your database to make it persistent.
];

// Scaffolding Express app
var express = require('express');
var app = express();
var server = require('http').createServer(app);

var bodyParser = require('body-parser');
app.use(bodyParser.json());

// Enabling CORS
var cors = require('cors');
app.use(cors());
app.options('*', cors());

// Static assets
app.use(express.static(__dirname));

// Setting up detailed logging
var winston = require('winston');
var logger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      handleExceptions: true,
      json: true,
      level: 'info' // Set 'debug' for super-detailed output
    })
  ],
  exitOnError: false
});
logger.stream = {
  write: function (message, encoding) {
    logger.info(message);
  }
};
app.use(require('morgan')('combined', {
  'stream': logger.stream
}));

// Reading command line arguments
var argv = require('yargs')
  .usage('Usage: $0 --stringToMonitor [string]')
  .argv;

var stringToMonitor = argv.stringToMonitor || 'javascript';

// Setting Web Push credentials
var webPush = require('web-push');
webPush.setVapidDetails(
  'mailto:sender@example.com',
  keys.publicKey,
  keys.privateKey
);
var pushSubscriptions = [];

// Subscribe to Web Push
app.post('/webpush', function (req, res, next) {
  logger.info('Web push subscription object received: ', req.body.subscription);

  if (req.body.action === 'subscribe') {
    if (arrayObjectIndexOf(pushSubscriptions, req.body.subscription.endpoint, 'endpoint') == -1) {
      pushSubscriptions.push(req.body.subscription);
      logger.info('Subscription registered: ' + req.body.subscription.endpoint);
    } else {
      logger.info('Subscription was already registered: ' + req.body.subscription.endpoint);
    }

    res.send({
      text: 'Web push subscribed',
      status: '200'
    });
  } else if (req.body.action === 'unsubscribe') {
    var subscriptionIndex = arrayObjectIndexOf(pushSubscriptions, req.body.subscription.endpoint, 'endpoint');

    if (subscriptionIndex >= 0) {
      pushSubscriptions.splice(subscriptionIndex, 1);

      logger.info('Subscription unregistered: ' + req.body.subscription.endpoint);
    } else {
      logger.info('Subscription was not found: ' + req.body.subscription.endpoint);
    }

    res.send({
      text: 'Web push unsubscribed',
      status: '200'
    });
  } else {
    throw new Error('Unsupported action');
  }

  logger.info('Number of active subscriptions: ' + pushSubscriptions.length);
});

function sendNotification(pushSubscription, payload) {
  console.log('Push start!!');
  if (pushSubscription) {
    webPush.sendNotification(pushSubscription, payload)
      .then(function (response) {
        logger.info('Push sent');
        logger.debug(payload);
        logger.debug(response);
      })
      .catch(function (error) {
        logger.error('Push error: ', error);
      });
  }
}

// Default endpoint
app.get('/', function (req, res, next) {

});

app.get('/push', function (req, res, next) {
  var notificationData = {};
  notificationData.notification = {
    actions: [{
      action: 'opentweet',
      title: 'Open root URL'
    }],
    title: 'Notification title',
    body: 'This is Cron-basednotification for PWA-workshop',
    dir: 'auto',
    icon: 'http://localhost:3000/logo.png',
    lang: 'ja',
    renotify: true,
    requireInteraction: true,
    tag: 'Some ID',
    vibrate: [300, 100, 400],
    data: '/'
  };

  pushSubscriptions.forEach(function (item) {
    sendNotification(item, JSON.stringify(notificationData));
  });
});

// Starting Express

server.listen(process.env.PORT || 3000, function () {
  logger.info('Listening on port ' + (process.env.PORT || 3000));
});

// Backup option - Web Push by timer

var CronJob = require('cron').CronJob;

new CronJob('*/20 * * * * *', function () {
  var notificationData = {};
  notificationData = {
    'notification': {
      'title': 'Ranjeet Kumar',
      'actions': [{
        'action': 'opentweet',
        'title': 'Open tweet'
      }],
      'body': 'The latest The Top Javascript Blogs Daily! https://t.co/o3PSNkk9Di Thanks to @LifeWithKathy #makeyourownlane',
      'dir': 'auto',
      'icon': 'https://pbs.twimg.com/profile_images/854195961085734917/0X7AFONJ_normal.jpg',
      'badge': 'https://pbs.twimg.com/profile_images/854195961085734917/0X7AFONJ_normal.jpg',
      'lang': 'en',
      'renotify': true,
      'requireInteraction': true,
      'tag': 926796012340920300,
      'vibrate': [
        300,
        100,
        400
      ],
      'data': {
        'url': 'https://twitter.com/statuses/926796012340920321',
        'created_at': 'Sat Nov 04 12:59:23 +0000 2017',
        'favorite_count': 0,
        'retweet_count': 0
      }
    }
  };

  pushSubscriptions.forEach(function (item) {
    sendNotification(item, JSON.stringify(notificationData));
  });
  logger.info(notificationData);
}, null, true); // Set the last parameter to true to start CronJob

// Utility function to search the item in the array of objects
function arrayObjectIndexOf(myArray, searchTerm, property) {
  for (var i = 0, len = myArray.length; i < len; i++) {
    if (myArray[i][property] === searchTerm) return i;
  }
  return -1;
}
