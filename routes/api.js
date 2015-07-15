var express = require('express');
var passport = require('passport');
var router = express.Router();

/* GET users listing. */
router.get('/', passport.authenticate('bearer', { session: false }), function (req, res) {
    console.log('geet users');
    res.json({
    	msg: 'API is running'
    });
});

module.exports = router;