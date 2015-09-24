app.config(function ($stateProvider) {
    $stateProvider.state('home', {
        url: '/',
        templateUrl: 'js/home/home.html',
        controller: 'HomeController',
        resolve: {
          user: function(AuthService){
            return AuthService.getLoggedInUser().then(null,function(){
              return;
            });
          },
          roomList: function(RoomFactory,user){
            if(!user) return[];
            return RoomFactory.getMyRooms();
          }
        }
    });
});