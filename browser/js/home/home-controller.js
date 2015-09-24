app.controller('HomeController', function ($scope, roomList, user, RoomFactory) {
    $scope.roomList = roomList;
    $scope.user = user;
    $scope.createRoom = RoomFactory.createRoom;
    $scope.ownedRooms=[];
    $scope.memberRooms=[];
    roomList.forEach(function(room){
      if(user._id===room.owner){
        $scope.ownedRooms.push(room);
      }else{
        $scope.memberRooms.push(room);
      }
    });

});