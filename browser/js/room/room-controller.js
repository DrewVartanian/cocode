app.controller('RoomController', function($scope, room, RoomFactory, $modal) {
    $scope.room = room;
    $scope.tabNames = ['HTML', 'CSS', 'JS'];
    $scope.selectedFileType = $scope.tabNames[0].toLowerCase();
    $scope.selectedFile = room[$scope.selectedFileType][0];
    $scope.items = ['item1', 'item2', 'item3'];
    var protoPage = $('#proto-page').get()[0];

    $scope.socket = io(location.origin);
    $scope.socket.emit('newVisitor', {
        //user this time will involve the cookie object OR anonymous
        // "user": "Anon",
        "room": $scope.room._id
    });

    $scope.updateProtoPage = function() {
        var doc;
        if (protoPage.contentDocument) doc = protoPage.contentDocument;
        else if (protoPage.contentWindow) doc = protoPage.contentWindow.document;
        else doc = protoPage.document;

        var content = '<style>\n';

        $scope.room.css.forEach(function(file) {
            content += file.content;
        });

        content += '\n</style>\n' + $scope.room.html[0].content + '\n<script type="text/javascript">';

        $scope.room.js.forEach(function(file) {
            content += file.content;
        });

        content += '\n</script>';

        doc.open();
        doc.writeln(content);
        doc.close();
    };

    $scope.changeTab = function(tab) {
        $scope.selectedFileType = tab.toLowerCase();
        $scope.selectedFile = $scope.room[$scope.selectedFileType][0];
        $scope.aceOption.mode = $scope.selectedFileType==='js'?'javascript':$scope.selectedFileType;
    };

    $scope.changeFile = function(file) {
        $scope.selectedFile = file;
    };

    $scope.saveAndRender = function(roomParam) {
        RoomFactory.saveAndRender(roomParam).then(function(roomRes) {
            $scope.room = roomRes;
            $scope.selectedFile = roomRes[$scope.selectedFileType][0];
            $scope.updateProtoPage();
            $scope.socket.emit('updateView');
        }).then(null, function(err) {
            console.log(err);
        });
    };

    $scope.open = function(size) {

        $modal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'myModalContent.html',
            controller: 'ModalInstanceCtrl',
            size: size,
            resolve: {
                items: function() {
                    return $scope.items;
                },
                room: function() {
                    return $scope.room;
                }
            }
        });
    };

    $scope.reorient = function(orient) {
        var orentObj = {
            horiz: {
                remove: 'col-xs-12',
                add: 'col-md-6'
            },
            vert: {
                remove: 'col-md-6',
                add: 'col-xs-12'
            }
        };

        $('.display-pannel').removeClass(orentObj[orient].remove).addClass(orentObj[orient].add);

        if(orient==='vert'){
          $('#btn-vert').addClass('active');
          $('#btn-horiz').removeClass('active');
        }else{
          $('#btn-horiz').addClass('active');
          $('#btn-vert').removeClass('active');
        }
    };

    $scope.emitCode = function() {
        setTimeout(function(){
            $scope.socket.emit('codeEdit',{
                "selectedFileType":$scope.selectedFileType,
                "content":$scope.selectedFile.content
            });
        },50);
    };

    $scope.downloadCode = function() {
        console.log('download');
        var zip = new JSZip();
        $scope.room.html.forEach(function(file){
            zip.file(file.name, file.content);
        });
        $scope.room.css.forEach(function(file){
            zip.file(file.name, file.content);
        });
        $scope.room.js.forEach(function(file){
            zip.file(file.name, file.content);
        });
        var content = zip.generate();
        location.href="data:application/zip;base64," + content;
    };

    $scope.socket.on('codeEdited', function(code) {
        $scope.room[code.selectedFileType][0].content=code.content;
        $scope.$digest();
    });

    $scope.socket.on('viewUpdated', function() {
        $scope.updateProtoPage();
        $scope.$digest();
    });

    $scope.aceOption = {
        mode: 'html',
        onLoad: function (_ace) {
          // HACK to have the ace instance in the scope...
          $scope.modeChanged = function () {
            _ace.getSession().setMode("ace/mode/javascript");
          };

        }
    };

    $scope.updateProtoPage();
});

app.controller('ModalInstanceCtrl', function($scope, $modalInstance, items, room, RoomFactory) {

    $scope.items = items;
    $scope.room = room;

    $scope.add = function() {
        RoomFactory.addMember($scope.room, $scope.newMember).then(function(retRoom) {
            $scope.room = retRoom;
            $scope.newMember = '';
        });
    };

    $scope.remove = function(memberId) {
        RoomFactory.removeMember($scope.room, memberId).then(function(retRoom) {
            $scope.room = retRoom;
        });
    };

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
});
