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

    var removeRoom = function(roomId){
      return $http.delete('/api/rooms/'+roomId)
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
      return $http.put('/api/rooms/code',{room:room})
            .then(function(res) {
              return res.data;
            });
    };

    var addMember = function(room,email) {
      return $http.put('/api/rooms/member/add',{roomId:room._id,email:email})
            .then(function(res) {
              return res.data;
            });
    };

    var removeMember = function(room,memberId) {
      return $http.put('/api/rooms/member/remove',{roomId:room._id,memberId:memberId})
            .then(function(res) {
              return res.data;
            });
    };

    var addFile = function(room,newFile,fileType) {
      return $http.put('/api/rooms/file/add',{roomId:room._id,newFile:newFile,fileType:fileType})
            .then(function(res) {
              return res.data;
            });
    };

    var removeFile = function(room,fileName,fileType) {
      return $http.put('/api/rooms/file/remove',{roomId:room._id,fileName:fileName,fileType:fileType})
            .then(function(res) {
              return res.data;
            });
    };

    return{
        getRoom:getRoom,
        createRoom:createRoom,
        removeRoom:removeRoom,
        getMyRooms:getMyRooms,
        saveAndRender:saveAndRender,
        addMember:addMember,
        removeMember:removeMember,
        addFile:addFile,
        removeFile:removeFile
    };
});