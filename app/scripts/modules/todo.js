'use strict';

angular.module('todoModule', ['ngRoute', 'ngDreamFactory'])
    .constant('DSP_URL', 'https://dsp-go.cloud.dreamfactory.com')
    .constant('DSP_API_KEY', 'todoangular')
    .constant('ASSETS_PATH', 'scripts/modules/')
    .config(['ASSETS_PATH', '$routeProvider', function (ASSETS_PATH, $routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: ASSETS_PATH + 'views/main.html'
            })
            .otherwise({
                redirectTo: '/'
            });
    }])
    .directive('todoMain', ['ASSETS_PATH', function (ASSETS_PATH) {

        return {
            restrict: 'E',
            templateUrl: ASSETS_PATH + 'views/todo-main.html',
            controller: function ($scope) {
            window.Scope = $scope;
            }
        };

    }])
    .directive('todoListContainer', ['ASSETS_PATH', '$compile', 'DreamFactory', '$q',
        function (ASSETS_PATH, $compile, DreamFactory, $q) {

        return {
            restrict: 'E',
            require: '^todoMain',
            templateUrl: ASSETS_PATH + 'views/todo-list.html',
            link: function (scope, elem, attrs) {


                scope.todoItems = [];


                scope.init = function(){
                    if(DreamFactory.isReady()){
                        scope.$broadcast('api:ready');
                    }
                };
                scope.addTodoItem = function () {
                    scope.$broadcast('add:todo');
                };

                scope._addTodoItem = function(todoDataObject){
                    scope.todoItems.push(todoDataObject);

                };
//                scope._buildDirective = function(todoItemData){
//                    var html = "<todo todo='todoItems[" + todoItemData.id + "]'></todo>";
//                    angular.element('#todo-list').append($compile(html)(scope));
//
//                };
                scope._getTodos = function(){
                    var deferred = $q.defer();
                    var request = {
                        table_name : 'neverdo'
                    }
                    DreamFactory.api.db.getRecords(request, function(data){
                        deferred.resolve(data);
                    },
                    function(error){
                        deferred.reject(error);
                    });
                    return deferred.promise;
                }
                scope._updateTodo = function(data){
                    var deferred = $q.defer();
                    var request = {
                        table_name: 'neverdo',
                        body : data,
                        id: data.id,
                        fields: "*"
                    }
                    DreamFactory.api.db.updateRecord(request, function(data){
                            deferred.resolve(data);
                        },
                        function(error){
                            deferred.reject(error);
                        });
                    return deferred.promise;
                }
                scope._removeTodo = function(data, $index){
                    var deferred = $q.defer();
                    var request = {
                        table_name: 'neverdo',
                        id : data.id
                    }
                    DreamFactory.api.db.deleteRecord(request, function(data){
                       deferred.resolve(data);
                       scope.todoItems.splice($index, 1);
                        },
                    function(error){
                       deferred.reject(error);
                    });
                    return deferred.promise;
                }
                scope.$on('add:todo', function (E) {

                });

                scope.$on('remove:todo:success', function(E, data, $index){
                    scope._removeTodo(data, $index).then(function(result){
                    //scope.todoItems[data.id].$destroy();;


                    },
                    function(reject){
                        //console.log(reject);
                    });

                });
                scope.$on('update:todo:success', function(E, data){
                    if(data.complete === false){
                        data.complete = true;
                    }else{
                        data.complete = false;
                    }

                    scope._updateTodo(data).then(function(result){
                            //console.log(result);
                        },
                        function(reject){
                            //console.log(reject);
                        });

                });
                scope.$on('create:todo:success', function (E, data) {
                    scope._addTodoItem(data);
                    //scope._buildDirective(data);
                    //scope.todo = {name: '', complete: false};
                })
                scope.$on('api:ready', function(E){
                    scope._getTodos().then(function(result){
                    scope.todoItems = result.record;
                        },
                    function(reject){
                        //console.log(reject);
                    });
                })
                scope.init();

            }

        }
    }])
    .directive('todoInput', ['ASSETS_PATH', 'DreamFactory', '$q', function (ASSETS_PATH, DreamFactory, $q) {
        return {
            restrict: 'E',
            templateUrl: ASSETS_PATH + 'views/todo-input.html',
            link: function (scope, elem, attrs) {
                window.directiveScope = scope;
                scope.todo = {name: '', complete: false};
                scope.createTodo = function () {
                    scope.$broadcast('create:todo');
                }

                scope._saveTodo = function (todoDataObject) {
                    var deferred = $q.defer();
                    var request = {
                        table_name: 'neverdo',
                        body: todoDataObject,
                        fields: '*'
                    }
                    DreamFactory.api.db.createRecords(request,
                        function (data) {
                            deferred.resolve(data);
                            scope.todo = {name: '', complete: false};
                        },
                        function (error) {
                            deferred.reject(error);
                        }
                    )
                    return deferred.promise;
                };
                scope.$on('create:todo', function (E) {
                    scope._saveTodo(scope.todo)
                        .then(function(result){
                            scope.$emit('create:todo:success', result);
                        }, function(reject){
                            scope.$emit('create:todo:error', reject);
                        });

                });
            }
        }
    }])
    .directive('todo', ['ASSETS_PATH', function (ASSETS_PATH) {
        return {
            restrict: 'C',
            replace: true,
            templateUrl: ASSETS_PATH + 'views/todo.html',
            link: function (scope, elem, attrs) {
                scope.removeTodo = function($index){
                    scope.$emit('remove:todo:success', scope.todo, $index);
                }
                scope.updateTodo = function(){
                    scope.$emit('update:todo:success', scope.todo);
                }
            }
        }
    }])