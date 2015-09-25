'use strict';
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    name: {
        type: String,
        unique : true,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    html: {
        type: [{
            name: {
                type: String
            },
            content: {
                type: String
            }
        }],
        default: []
    },
    css: {
        type: [{
            name: {
                type: String
            },
            content: {
                type: String
            }
        }],
        default: []
    },
    js: {
        type: [{
            name: {
                type: String
            },
            content: {
                type: String
            }
        }],
        default: []
    }
});

schema.pre('save', function(next) {

    if (this.isModified('members')) {
        var owner = this.owner;
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
