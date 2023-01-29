var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  console.log("cookie:", req.cookies);
  if (req.isAuthenticated()) {
      return res.status(200).json({ user: req.user });
  } else {
      return res.status(401).json({
          message: 'User is not authenticated.'
      });
  }
});

module.exports = router;
