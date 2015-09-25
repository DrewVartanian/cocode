'use strict';
var router = require('express').Router();
module.exports = router;
var mongoose = require('mongoose');
var Room = mongoose.model('Room');
var User = mongoose.model('User');

function sanitizeUserInfo(room){
    room.owner= {_id:room.owner._id,email:room.owner.email};
    room.members.forEach(function(member){
        member={_id:member._id,email:member.email};
    });
    return room;
}

router.get('/myRooms', function(req, res, next){
    if(!req.user) res.json([]);
    Room.find({$or: [{owner:req.user._id},{members:req.user._id}]}).then(function(rooms){
        res.json(rooms);
    }).then(null,function(err){
        next(err);
    });
});

router.post('/', function(req,res,next){
    if(!req.user) return next(new Error("Must be logged in"));
    Room.create({name:req.body.roomName,owner:req.body.owner,
        html:[{name:'index.html',content:''}],
        css:[{name:'main.css',content:''}],
        js:[{name:'main.js',content:''}]}).then(function(room){
            res.json(room);
        }).then(null,next);
});

router.put('/code', function(req,res,next){
    if(!req.user) return next(new Error("Must be logged in"));
        console.log('owner',req.user._id.toString());
        console.log('owner',req.body.room.owner);
    Room.findById(req.body.room._id).then(function(room){
        if(req.user._id.toString()!==room.owner.toString()&&room.members.indexOf(req.user._id.toString())===-1){
            return next(new Error("User is not a member of the room"));
        }
        room.html=req.body.room.html;
        room.css=req.body.room.css;
        room.js=req.body.room.js;
        return room.save();
    }).then(function(room){
        return room.populate('members').populate('owner').execPopulate();
    }).then(function(room){
        res.json(sanitizeUserInfo(room));
    }).then(null,next);
});

router.put('/member/add', function(req,res,next){
    console.log('Adding Member');
    if(!req.user) return next(new Error("Must be logged in"));
    var mongoRoom;
    Room.findById(req.body.roomId).then(function(room){
        if(req.user._id.toString()!==room.owner.toString()&&room.members.indexOf(req.user._id.toString())===-1){
            return next(new Error("User is not a member of the room"));
        }
        mongoRoom=room;
        return User.find({email:req.body.email});
    }).then(function(users){
        if(!users||!users[0]) return next(new Error("User not found"));
        mongoRoom.members.push(users[0]._id);
        return mongoRoom.save();
    }).then(function(room){
        return room.populate('members').populate('owner').execPopulate();
    }).then(function(room){
        res.json(sanitizeUserInfo(room));
    }).then(null,next);
});

router.put('/member/remove', function(req,res,next){
    console.log('Deleting Member');
    if(!req.user) return next(new Error("Must be logged in"));
    Room.findById(req.body.roomId).then(function(room){
        if(req.user._id.toString()!==room.owner.toString()&&room.members.indexOf(req.user._id.toString())===-1){
            return next(new Error("User is not a member of the room"));
        }
        var i=-1;
        room.members.some(function(member,index){
            if(req.body.memberId.toString()===member.toString()){
                i=index;
                return true;
            }
            return false;
        });
        if(i===-1) return next(new Error("User not found"));
        room.members.splice(i,1);
        return room.save();
    }).then(function(room){
        return room.populate('members').populate('owner').execPopulate();
    }).then(function(room){
        res.json(sanitizeUserInfo(room));
    }).then(null,next);
});

router.param('roomId', function(req, res, next, roomId) {
    // if (!req.user || (userId !== req.user._id.toString() && !req.user.isAdmin)) {
    //     var err = new Error('Wrong user');
    //     err.status = 403;
    //     return next(err);
    // }
    Room.findById(roomId).populate('members').populate('owner').then(function(room) {
            req.room = room;
            next();
        }).then(null, function(err) {
            err.status = 404;
            throw err;
        })
        .then(null, next);
});

router.get('/:roomId', function(req, res){
    res.json(sanitizeUserInfo(req.room));
});

