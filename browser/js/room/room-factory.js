app.factory('RoomFactory', function($http) {
    var getRoom = function(roomId) {
        return $http.get('/api/rooms/' + roomId)
            .then(function(res) {
                return res.data;
            });
    };

    var createRoom = function(roomName,owner){
      return $http.post('/api/rooms',{roomName:roomName,owner:owner._id})
            .then(function(res){
              return res.data;
            });
    };

    var getMyRooms = function() {
        return $http.get('/api/rooms/myRooms')
            .then(function(res) {
                return res.data;
            });
    };

    var saveAndRender = function(room) {
      console.log(room.css[0]);
      console.log(room.html[0]);
      return $http.put('/api/rooms/code',{room:room})
            .then(function(res) {
              return res.data;
            });
    };

    return{
        getRoom:getRoom,
        createRoom:createRoom,
        getMyRooms:getMyRooms,
        saveAndRender:saveAndRender
    };
});