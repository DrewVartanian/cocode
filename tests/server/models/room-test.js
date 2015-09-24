var dbURI = 'mongodb://localhost:27017/testingDB';
var clearDB = require('mocha-mongoose')(dbURI);

var sinon = require('sinon');
var expect = require('chai').expect;
var mongoose = require('mongoose');
var Promise = require('bluebird');

// Require in all models.
require('../../../server/db/models');

var Room = mongoose.model('Room');
var User = mongoose.model('User');

describe('Room model', function() {
  var mongoUser;
  var createUser = function (emailStr) {
    return User.create({ email: emailStr, password: 'potus'});
  };

  beforeEach('Establish DB connection', function (done) {
        if (mongoose.connection.db) return done();
        mongoose.connect(dbURI, function(){
          createUser('obama@gmail.com').then(function(user){
            mongoUser=user;
          }).then(done);
        });
    });

    afterEach('Clear test database', function (done) {
        clearDB(done);
    });

    it('should exist', function () {
        expect(Room).to.be.a('function');
    });

    describe('password encryption', function () {
      it('should create room', function (done) {
        return Room.create({owner:mongoUser._id}).then(function(room){
          expect(room).to.be.an('object');
        },function(err){
          expect(err).to.be.an('null');
        }).then(done,done);
      });

      it('should add users', function (done) {
        var member1;
        return createUser('first@test.com').then(function(mem1){
          member1=mem1;
          return createUser('second@test.com');
        }).then(function(mem2){
          return Room.create({owner:mongoUser._id,members:[member1._id,mem2._id]});
        }).then(function(room){
          if(!room) throw new Error();
          expect(room.members.length).to.equal(2);
        }).then(null,function(err){
          expect(err).to.be.an('null');
        }).then(done,done);
      });

      it('should not add redundent users', function (done) {
        var member1;
        return createUser('first@test.com').then(function(mem1){
          member1=mem1;
          return createUser('second@test.com');
        }).then(function(mem2){
          return Room.create({owner:mongoUser._id,members:[member1._id,mem2._id,mongoUser._id,member1._id]});
        }).then(function(room){
          if(!room) throw new Error();
          room.members.push(mongoUser._id);
          return room.save();
        }).then(function(room){
          expect(room.members.length).to.equal(2);
        }).then(null,function(err){
          expect(err).to.be.an('null');
        }).then(done,done);
      });

      it('should set html, css, and js fields', function (done) {
        return Room.create({owner:mongoUser._id,html:['html'],css:['css','css2'],js:['js','js2','js3']}).then(function(room){
          expect(room.html.length+room.css.length+room.js.length).to.equal(6);
        },function(err){
          expect(err).to.be.an('null');
        }).then(done,done);
      });

    });
});