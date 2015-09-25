app.controller('RoomController', function($scope, room, RoomFactory,$modal) {
    $scope.room = room;
    $scope.tabNames = ['HTML','CSS','JS'];
    $scope.selectedFileType=$scope.tabNames[0].toLowerCase();
    $scope.selectedFile = room[$scope.selectedFileType][0];
    $scope.items = ['item1', 'item2', 'item3'];
    var protoPage=$('#proto-page').get()[0];

    $scope.updateProtoPage = function(){
      var doc;
      if(protoPage.contentDocument) doc = protoPage.contentDocument;
      else if(protoPage.contentWindow) doc = protoPage.contentWindow.document;
      else doc = protoPage.document;

      var content='<style>\n';

      $scope.room.css.forEach(function(file){
        content+=file.content;
      });

      content+='\n</style>\n<script type="text/javascript">';

      $scope.room.js.forEach(function(file){
        content+=file.content;
      });

      content+='\n</script>\n'+$scope.room.html[0].content;

      doc.open();
      doc.writeln(content);
      doc.close();
    };

    $scope.changeTab = function(tab){
      $scope.selectedFileType=tab.toLowerCase();
      $scope.selectedFile = $scope.room[$scope.selectedFileType][0];
      console.log($scope.selectedFile.name);
    };

    $scope.changeFile = function(file){
      $scope.selectedFile = file;
    };

    $scope.saveAndRender = function(room){
      console.log("content",$scope.selectedFile.content);
      console.log("content",$scope.room.css[0].content);
      RoomFactory.saveAndRender(room).then(function(room){
        $scope.room=room;
        $scope.selectedFile = room[$scope.selectedFileType][0];
        $scope.updateProtoPage();
      }).then(null,function(err){
        console.log(err);
      });
    };

    $scope.updateProtoPage();

    $scope.open = function (size) {

      var modalInstance = $modal.open({
        animation: $scope.animationsEnabled,
        templateUrl: 'myModalContent.html',
        controller: 'ModalInstanceCtrl',
        size: size,
        resolve: {
          items: function () {
            return $scope.items;
          },
          room: function () {
            return $scope.room;
          }
        }
      });
    };
});

app.controller('ModalInstanceCtrl', function ($scope, $modalInstance, items, room, RoomFactory) {

  $scope.items = items;
  $scope.room = room;

  $scope.add = function () {
    RoomFactory.addMember($scope.room,$scope.newMember).then(function(retRoom){
      $scope.room =retRoom;
      $scope.newMember='';
    });
  };

  $scope.remove = function (memberId) {
    RoomFactory.removeMember($scope.room,memberId).then(function(retRoom){
      $scope.room =retRoom;
    });
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
});