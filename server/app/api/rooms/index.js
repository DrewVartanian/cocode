'use strict';
var router = require('express').Router();
module.exports = router;
var _ = require('lodash');
var mongoose = require('mongoose');
var Room = mongoose.model('Room');

router.param('roomId', function(req, res, next, roomId) {
    // if (!req.user || (userId !== req.user._id.toString() && !req.user.isAdmin)) {
    //     var err = new Error('Wrong user');
    //     err.status = 403;
    //     return next(err);
    // }
    Room.findById(roomId).then(function(room) {
            req.room = room;
            next();
        }).then(null, function(err) {
            err.status = 404;
            throw err;
        })
        .then(null, next);
});

router.get('/:roomId', function(req, res, next){
    res.json(req.room);
});