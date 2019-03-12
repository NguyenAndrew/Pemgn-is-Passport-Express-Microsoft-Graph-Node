var express = require('express');
var tokens = require('../tokens.js');
var graph = require('../graph.js');
var router = express.Router();

/* GET /calendar */
router.get('/',
  async function (req, res) {
    if (!req.isAuthenticated()) {
      res.redirect('/');
    }

    // Try to get the access token
    let accessToken;
    try {
      accessToken = await tokens.getAccessToken(req);
    } catch (err) {
      console.log('Could not get access token. Try signing out and signing in again.');
      console.log(err);
    }

    // Used to store Calendar Events
    const params = {
      active: { calendar: true }
    };

    // If there is an access token
    if (accessToken && accessToken.length > 0) {
      try {
        const events = await graph.getEvents(accessToken);
        params.events = events.value;
      } catch (err) {
        console.log('Could not fetch events');
        console.log(err);
      }
    }

    res.render('calendar', params);

  }
);

module.exports = router;