app.controller('HomeController', function ($scope, roomList, user, RoomFactory) {
    $scope.roomList = roomList;
    $scope.user = user;
    $scope.ownedRooms=[];
    $scope.memberRooms=[];
    roomList.forEach(function(room){
      if(user._id===room.owner){
        $scope.ownedRooms.push(room);
      }else{
        $scope.memberRooms.push(room);
      }
    });

    $scope.createRoom = function(roomName,owner){
      RoomFactory.createRoom(roomName,owner).then(function(room){
        console.log('room created');
        $scope.ownedRooms.push(room);
      });
    };

    $scope.removeRoom = function(roomId){
      RoomFactory.removeRoom(roomId).then(function(){
        console.log('room deleted');
        $scope.ownedRooms.some(function(ownedRoom,index){
          if(ownedRoom._id.toString()===roomId){
            $scope.ownedRooms.splice(index,1);
            return true;
          }
          return false;
        });
      });
    };
});