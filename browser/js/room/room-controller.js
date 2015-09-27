app.controller('RoomController', function($scope, room, RoomFactory, $modal) {
    $scope.room = room;
    $scope.tabNames = ['HTML', 'CSS', 'JS'];
    $scope.selectedFileType = $scope.tabNames[0].toLowerCase();
    $scope.selectedFile = room[$scope.selectedFileType][0];
    $scope.unsavedView=false;
    $scope.unsavedCode=false;
    var protoPage = $('#proto-page');

    $scope.socket = io(location.origin);
    $scope.socket.emit('newVisitor', {
        //user this time will involve the cookie object OR anonymous
        // "user": "Anon",
        "room": $scope.room._id
    });

    $scope.updateProtoPage = function() {
        var doc;
        if (protoPage.get()[0].contentDocument) doc = protoPage.get()[0].contentDocument;
        else if (protoPage.get()[0].contentWindow) doc = protoPage.get()[0].contentWindow.document;
        else doc = protoPage.get()[0].document;

        var content = '<style>\n';

        $scope.room.css.forEach(function(file) {
            content += file.content+'\n';
        });

        content += '</style>\n' + $scope.room.html[0].content + '\n<script type="text/javascript">';

        $scope.room.js.forEach(function(file) {
            content += file.content+'\n';
        });

        content += '</script>';

        doc.open();
        doc.writeln(content);
        doc.close();
        if($scope.unsavedView){
            protoPage.addClass('unsaved');
        }else{
            console.log('test');
            protoPage.removeClass('unsaved');
        }
    };

    $scope.changeTab = function(tab) {
        $scope.selectedFileType = tab.toLowerCase();
        $scope.selectedFile = $scope.room[$scope.selectedFileType][0];
        $scope.aceOption.mode = $scope.selectedFileType==='js'?'javascript':$scope.selectedFileType;
    };

    $scope.changeFile = function(file) {
        $scope.selectedFile = file;
    };

    $scope.preview = function() {
        $scope.unsavedView=true;
        $scope.updateProtoPage();
        $scope.socket.emit('updateView',{saved: false,room:$scope.room});
    };

    $scope.revert = function() {
        RoomFactory.getRoom($scope.room._id).then(function(roomRes){
            $scope.room=roomRes;
            $scope.socket.emit('updateView',{saved: true,room:roomRes});
            $scope.unsavedView=false;
            $scope.unsavedCode = false;
            $scope.updateProtoPage();
            roomRes[$scope.selectedFileType].some(function(file){
                if(file.name===$scope.selectedFile.name){
                    $scope.selectedFile = file;
                }
            });
        });
    };

    $scope.saveAndRender = function() {
        RoomFactory.saveAndRender($scope.room).then(function(roomRes) {
            $scope.room = roomRes;
            roomRes[$scope.selectedFileType].some(function(file){
                if(file.name===$scope.selectedFile.name){
                    $scope.selectedFile = file;
                }
            });
            $scope.unsavedView = false; 
            $scope.unsavedCode = false;
            $scope.updateProtoPage();
            $scope.socket.emit('updateView',{saved: true,room:roomRes});
        }).then(null, function(err) {
            console.log(err);
        });
    };

    $scope.openMemberModal = function() {

        $modal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'memberModalContent.html',
            controller: 'MemberModalInstanceCtrl',
            resolve: {
                room: function() {
                    return $scope.room;
                }
            }
        });
    };

    $scope.openFileModal = function() {

        $modal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'fileModalContent.html',
            controller: 'FileModalInstanceCtrl',
            resolve: {
                room: function() {
                    return $scope.room;
                },
                selectedFileType: function() {
                    return $scope.selectedFileType;
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
        if(!$scope.unsavedCode){
            $scope.unsavedCode=true;
        }
        setTimeout(function(){
            $scope.socket.emit('codeEdit',{
                "selectedFileType":$scope.selectedFileType,
                "file":$scope.selectedFile
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

    $scope.$on('roomChange', function (event, data) {
        $scope.room=data;
    });

    $scope.socket.on('codeEdited', function(code) {
        if(!$scope.unsavedCode){
            $scope.unsavedCode=true;
        }
        $scope.room[code.selectedFileType].some(function(file){
            if(file.name===code.file.name){
                file.content=code.file.content;
                return true;
            }
            return false;
        });
        $scope.$digest();
    });

    $scope.socket.on('viewUpdated', function(viewInfo) {
        $scope.unsavedView=!viewInfo.saved;
        $scope.unsavedCode=!viewInfo.saved;
        $scope.room=viewInfo.room;
        $scope.room[$scope.selectedFileType].some(function(file){
            if(file.name===$scope.selectedFile.name){
                $scope.selectedFile = file;
            }
        });
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

app.controller('MemberModalInstanceCtrl', function($scope, $rootScope, $modalInstance, room, RoomFactory) {
    $scope.room = room;

    $scope.addMember = function() {
        RoomFactory.addMember($scope.room, $scope.newMember).then(function(retRoom) {
            $scope.room = retRoom;
            $scope.newMember = '';
            $rootScope.$broadcast('roomChange', retRoom);
        });
    };

    $scope.removeMember = function(memberId) {
        RoomFactory.removeMember($scope.room, memberId).then(function(retRoom) {
            $scope.room = retRoom;
            $rootScope.$broadcast('roomChange', retRoom);
        });
    };

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
});

app.controller('FileModalInstanceCtrl', function($scope, $rootScope, $modalInstance, room, selectedFileType, RoomFactory) {

    $scope.room = room;
    $scope.selectedFileType = selectedFileType;
    $scope.main = room[selectedFileType][0];
    $scope.files = room[selectedFileType].slice(1);

    $scope.addFile = function() {
        RoomFactory.addFile($scope.room, $scope.newFile, $scope.selectedFileType).then(function(retRoom) {
            $scope.room = retRoom;
            $scope.newFile = '';
            $scope.files = retRoom[selectedFileType].slice(1);
            $rootScope.$broadcast('roomChange', retRoom);
        });
    };

    $scope.removeFile = function(fileName) {
        RoomFactory.removeFile($scope.room, fileName, $scope.selectedFileType).then(function(retRoom) {
            $scope.room = retRoom;
            $scope.files = retRoom[selectedFileType].slice(1);
            $rootScope.$broadcast('roomChange', retRoom);
        });
    };

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
});
