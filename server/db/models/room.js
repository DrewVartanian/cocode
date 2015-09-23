'use strict';
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    members: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User',
        default: []
    },
    html: {
        type: [String],
        default: []
    },
    css: {
        type: [String],
        default: []
    },
    js: {
        type: [String],
        default: []
    }
});

schema.pre('save', function(next) {

    if (this.isModified('members')) {
        var owner = this.owner.toString();
        var membI;
        for (var i = 0; i < this.members.length; i++) {
            membI = this.members[i];
            if (owner === membI) {
                this.members.splice(i, 1);
                i--;
            } else {
                for (var j = i + 1; j < this.members.length; j++) {
                    if (membI === this.members[j]) {
                        this.members.splice(j, 1);
                        j--;
                    }
                }
            }
        }
    }

    next();

});

mongoose.model('Room', schema);
