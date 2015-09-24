app.factory('RoomFactory', function($http) {
    var getRoom = function(roomId) {
        console.log('RoomFactory');
        return $http.get('/api/rooms/' + roomId)
            .then(function(res) {
                return res.data;
            });
    };

    return{
        getRoom:getRoom
    };
});