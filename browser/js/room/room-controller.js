app.controller('RoomController', function($scope, room, RoomFactory) {
    $scope.room = room;
    $scope.tabNames = ['HTML','CSS','JS'];
    $scope.selectedFileType=$scope.tabNames[0].toLowerCase();
    $scope.selectedFile = room[$scope.selectedFileType][0];
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

});