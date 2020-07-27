var ionApp = angular.module('BBstatsH', ['ionic', 'ngResource']);

ionApp.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('app', {
    url: "/app",
    abstract: true,
    templateUrl: "menu.html"
  })
  .state('app.main', {
    url: "/main",
    views: {
      'menuContent': {
        templateUrl: "main.html",
        controller: 'viewCtrl'
      }
    }
  })
  .state('app.roster', {
    url: "/roster",
    views: {
      'menuContent': {
        templateUrl: "roster.html",
        controller: 'gameCtrl'
      }
    }
  });
    // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/roster');
});

ionApp.factory('dbSvc', function ($resource, $http) {

  var _ngr = function () {
    var url = 'https://gwfl-256d.restdb.io/rest/songlist/:id?apikey=5821f61550e9b39131fe1b6f';
    return $resource(url);
  };

  var _initRoster = function () { 
    $http.get('https://api.airtable.com/v0/app0hohtq4b1nM0Kb/Players/recKbHjCbXLbJuSuJ?api_key=key66fQg5IghIIQmb')    // /recKbHjCbXLbJuSuJ
      .success(function (jsonData) {
        localStorage.setItem('ls_vGM00', jsonData.fields.vGMstats);
    });
  };

  var _allSongs = function () {
//    return $resource('https://api.airtable.com/v0/app0hohtq4b1nM0Kb/Players?api_key=key66fQg5IghIIQmb');
    return $resource('https://gwfl-256d.restdb.io/rest/songlist?apikey=5821f61550e9b39131fe1b6f');
  };

  var _scoreById = function () {
    var url = 'https://gwfl-256d.restdb.io/rest/scores/:recId?apikey=5821f61550e9b39131fe1b6f';    //  5a6b9e9da07bee72000109a7 
    return $resource(url,      
    { recId: '@_id' }, 
    { update: { method: 'PUT' } }
  )};
    
  return {
    initRoster: _initRoster(),
    scoreById: _scoreById(),
    allSongs: _allSongs().query()
  };
});

ionApp.run( function ($rootScope, $http, dbSvc, $ionicPlatform, $location) {

  $ionicPlatform.ready(function() {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      //  if(window.cordova && window.cordova.plugins.Keyboard) {
      //    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      //  }
    if (window.StatusBar) {
      StatusBar.styleDefault();
    }
  });

  function storageAvailable(type) {
    try {
      var storage = window[type],
        x = '__storage_test__';
      storage.setItem(x, x);
      storage.clear();
      return true;
    } catch (e) {
      return false;
    }
  }

  $rootScope.appLog = "Sorry, No Storage Here.";
  if (storageAvailable('localStorage')) {
    // Yippee! We can use localStorage awesomeness
    $rootScope.appLog = ".r0 ";
  }
  // localStorage.removeItem('ls_vGMstats');
  dbSvc.initRoster;
  // $rootScope.appLog += ".r" + localStorage.getItem('ls_vGM00');

  // $location.path('app/main');
  
});      //  end .run

ionApp.controller('gameCtrl', function($scope, $rootScope, $http, $resource, $timeout, dbSvc) {

  var rsScore = dbSvc.scoreById.get({recId:'5a6b9e9da07bee72000109a7'}, function() {
    $scope.vGm = rsScore.vGMstats;
    localStorage.setItem('ls_vGMstats', JSON.stringify(rsScore.vGMstats));
  });

  $scope.resetGM = function() {
    localStorage.removeItem('ls_vGMstats'); // clear();   
    $scope.vGm = JSON.parse(localStorage.getItem('ls_vGM00'));
    dbSvc.scoreById.update({recId:'5a6b9e9da07bee72000109a7'}, {type: "rbyb-00", idx: Date.now(), vGMstats: $scope.vGm});
    localStorage.setItem('ls_vGMstats', JSON.stringify($scope.vGm));
  };

  $scope.tglundoCB = function() {
    $scope.undoCB = !$scope.undoCB;
  };

  $scope.pTally = function(tt,xx) {
    var undo = 1;
    $rootScope.appLog = '> ' + tt; //  
    if ($scope.undoCB) {
      undo = -1;
      $rootScope.appLog = '-- ' + tt; //  
    }

    if (xx < 0) {
      $scope.ttIdx = tt;
    } else {
      // $scope.vGm.onc2[xx] = false;
      $scope.undoCB = false;
      $scope.ttIdx = '.';
      // $rootScope.appLog +=  ' :' + $scope.vGm.Nu[xx]; //  
    }

    switch (tt) {
      case 'y2p':
        if (xx < 0) {
          $scope.vGm.vGH.pp += 2 * undo;
        } else {
          $scope.vGm.pp[xx] += 2 * undo;
          $scope.vGm.y2p[xx] += 1 * undo;
          $scope.vGm.rrfg[xx] = Math.round(($scope.vGm.y2p[xx] / ($scope.vGm.x2p[xx] + $scope.vGm.y2p[xx])) * 100);
        }
        break;
      case 'x2p':
        if (xx < 0) {
          // $rootScope.vGm.vGH.pp += 0 * undo; 
        } else {
          $scope.vGm.x2p[xx] += 1 * undo;
          $scope.vGm.rrfg[xx] = Math.round(($scope.vGm.y2p[xx] / ($scope.vGm.x2p[xx] + $scope.vGm.y2p[xx])) * 100);
        }
        break;
      case 'y3p':
        if (xx < 0) {
          $scope.vGm.vGH.pp += 3 * undo;
        } else {
          $scope.vGm.pp[xx] += 3 * undo;
          $scope.vGm.y3p[xx] += 1 * undo;
          $scope.vGm.rr3p[xx] = Math.round(($scope.vGm.y3p[xx] / ($scope.vGm.x3p[xx] + $scope.vGm.y3p[xx])) * 100);
        }
        break;
      case 'x3p':
        if (xx < 0) {
          // $rootScope.vGm.vGH.pp += 0 * undo; 
        } else {
          $scope.vGm.x3p[xx] += 1 * undo;
          $scope.vGm.rr3p[xx] = Math.round(($scope.vGm.y3p[xx] / ($scope.vGm.x3p[xx] + $scope.vGm.y3p[xx])) * 100);
        }
        break;
      case 'yft':
        if (xx < 0) {
          $scope.vGm.vGH.pp += 1 * undo;
        } else {
          $scope.vGm.pp[xx] += 1 * undo;
          $scope.vGm.yft[xx] += 1 * undo;
          $scope.vGm.rrft[xx] = Math.round(($scope.vGm.yft[xx] / ($scope.vGm.xft[xx] + $scope.vGm.yft[xx])) * 100);
        }
        break;
      case 'xft':
        if (xx < 0) {
          // $rootScope.vGm.vGH.pp += 0 * undo; 
        } else {
          $scope.vGm.xft[xx] += 1 * undo;
          $scope.vGm.rrft[xx] = Math.round(($scope.vGm.yft[xx] / ($scope.vGm.xft[xx] + $scope.vGm.yft[xx])) * 100);
        }
        break;
      case 'ast':
        if (xx < 0) {
          // $rootScope.vGm.vGH.pp += 0 * undo; 
        } else {
          $scope.vGm.ast[xx] += 1 * undo;
        }
        break;
      case 'stl':
        if (xx < 0) {
          // $rootScope.vGm.vGH.pp += 0 * undo; 
        } else {
          $scope.vGm.stl[xx] += 1 * undo;
        }
        break;
      case 'blk':
        if (xx >= 0) {
          $scope.vGm.blk[xx] += 1 * undo;
        }
        break;
      case 'drb':
        if (xx < 0) {
          // $rootScope.vGm.vGH.pp += 0 * undo; 
        } else {
          $scope.vGm.drb[xx] += 1 * undo;
        }
        break;
      case 'orb':
        if (xx < 0) {
          // $rootScope.vGm.vGH.pp += 0 * undo; 
        } else {
          $scope.vGm.orb[xx] += 1 * undo;
        }
        break;
      case 'tov':
        if (xx < 0) {
          // $rootScope.vGm.vGH.pp += 0 * undo; 
        } else {
          $scope.vGm.tov[xx] += 1 * undo;
        }
        break;
      case 'pf':
        if (xx < 0) {
          $scope.vGm.vGH.ff += 1 * undo;
        } else {
          $scope.vGm.pf[xx] += 1 * undo;
        }
        break;
      case 'tf':
        if (xx < 0) {
          // $rootScope.vGm.vGH.pp += 0 * undo; 
        } else {
          $scope.vGm.tf[xx] += 1 * undo;
        }
        break;
      case 'v2p':
        $scope.vGm.vGV.pp += 2 * undo;
        $scope.undoCB = false;
        break;
      case 'v3p':
        $scope.vGm.vGV.pp += 3 * undo;
        $scope.undoCB = false;
        break;
      case 'vft':
        $scope.vGm.vGV.pp += 1 * undo;
        $scope.undoCB = false;
        break;
      case 'vpf':
        $scope.vGm.vGV.ff += 1 * undo;
        $scope.undoCB = false;
        break;
      default:
        $rootScope.appLog = ">";
        break;
    }
  
  dbSvc.scoreById.update({recId:'5a6b9e9da07bee72000109a7'}, {type: "rbyb3a", idx: Date.now(), vGMstats: $scope.vGm});
  localStorage.setItem('ls_vGMstats', JSON.stringify($scope.vGm));
};

});      //  end gameCtrl

ionApp.controller('viewCtrl', function($scope, $rootScope, $http, $resource, $timeout, dbSvc) {

$rootScope.timer = function() {
  var rsScore = dbSvc.scoreById.get({recId:'5a6b9e9da07bee72000109a7'}, function() {
    $scope.vGm = rsScore.vGMstats;
    localStorage.setItem('ls_vGMstats', JSON.stringify(rsScore.vGMstats));
  });

  $timeout($rootScope.timer, 5000);    // 1 second delay
};
        
$timeout($rootScope.timer, 250);  // $timeout.cancel(timer); 

});
