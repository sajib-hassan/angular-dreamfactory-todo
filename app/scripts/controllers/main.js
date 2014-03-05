'use strict';

angular.module('todo2App')
    .controller('MainCtrl', ['$scope','DBService', function($scope, DBService) {


        // Function to call custom service
        $scope.getRecords = function() {

            // call custom service built using DreamFactory that returns a promise
            DBService.getRecords('todo').then(

                // Success function
                function(result) {

                    console.log(result);
                },

                // Error function
                function(reject) {

                    // Handle error
                });
        }
    }])