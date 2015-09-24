app.config(function($stateProvider) {

    $stateProvider.state('room', {
        url: '/room/:roomId',
        templateUrl: 'js/room/room.html',
        controller: 'RoomController',
        resolve: {
            room: function(RoomFactory,$stateParams) {
                console.log('room state resolve');
                return RoomFactory.getRoom($stateParams.roomId);
            }
        },
        // The following data.authenticate is read by an event listener
        // that controls access to this state. Refer to app.js.
        data: {
            authenticate: true
        }
    });

});