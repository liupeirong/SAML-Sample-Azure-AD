var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
    console.log("cookie:", req.cookies);
    if (req.isAuthenticated()) {
        const task = (req.user.id[0] < 'm') ? "shopping" : "pick up pizza & eat"
        return res.status(200).json({ task: task });
    } else {
        return res.status(401).json({
            message: 'User is not authenticated.'
        });
    }
});

module.exports = router;
