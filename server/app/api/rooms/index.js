'use strict';
var router = require('express').Router();
module.exports = router;
var _ = require('lodash');
var mongoose = require('mongoose');
var Room = mongoose.model('Room');

router.get('/myRooms', function(req, res, next){
    if(!req.user) res.json([]);
    Room.find({$or: [{owner:req.user._id},{members:req.user._id}]}).then(function(rooms){
        res.json(rooms);
    }).then(null,function(err){
        next(err);
    });
});

router.post('/', function(req,res,next){
    if(!req.user)next(new Error("Must be logged in"));
    Room.create({name:req.body.roomName,owner:req.body.owner,
        html:[{name:'index.html',content:''}],
        css:[{name:'main.css',content:''}],
        js:[{name:'main.js',content:''}]}).then(function(room){
            res.json(room);
        }).then(null,next);
});

router.put('/code', function(req,res,next){
    if(!req.user)next(new Error("Must be logged in"));
    Room.findById(req.body.room._id).then(function(room){
        if(req.user._id.toString()!==req.body.room.owner&&req.body.room.members.indexOf(req.user._id.toString())===-1){
            next(new Error("User is not a member of the room"));
        }
        room.html=req.body.room.html;
        room.css=req.body.room.css;
        room.js=req.body.room.js;
        return room.save();
    }).then(function(room){
        res.json(room);
    }).then(null,next);
});

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

