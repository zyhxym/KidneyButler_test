angular.module('kidney.directives', ['kidney.services'])
//消息模版，用于所有消息类型
//XJZ
.directive('myMessage',['Storage','CONFIG',function(Storage,CONFIG){
    var picArr=[
                {"src":"img/1.jpg","hiRes":"img/2.jpg"},
                {"src":"img/3.jpg","hiRes":"img/4.jpg"},
                {"src":"img/5.jpg","hiRes":"img/doctor3.png"}
            ];
    return {
        template: '<div ng-include="getTemplateUrl()"></div>',
        scope: {
            msg:'=',
            photourls:'=',
            msgindex:'@'
        },
        restrict:'AE',
        controller:function($scope){
            var type='';
            $scope.getTemplateUrl = function(){
                type=$scope.msg.contentType;
                if(type=='image'){
                    // if($scope.msg.content['src_thumb']!='')
                        // $scope.msg.content.thumb = $scope.base+$scope.msg.content['src_thumb'];
                }else if(type=='custom'){
                    type=$scope.msg.content.type;
                    if(type=='card'){
                        try{
                            $scope.counsel=$scope.msg.content.counsel;
                            $scope.picurl=picArr;
                        }catch(e){
                            
                        }
                    }
                    // return 'templates/msg/'+ type+'.html';
                }
                return 'partials/tabs/consult/msg/'+ type+'.html';
            }

            
            $scope.emitEvent = function(code){
              $scope.$emit(code,arguments);
            }

        }
    }
}])
//聊天输入框的动态样式，如高度自适应，focus|blur状态
//XJZ
.directive('dynamicHeight', [function() {
    return {
        restrict: 'A',
        link: function(scope, elem) {
            elem.bind('keyup', function() {
                this.style.height = "1px";
                var h = 4 + this.scrollHeight;
                this.style.height = (h < 70 ? h : 70) + 'px';

            });
            elem.bind('focus', function() {
                console.log(this.style)
                this.style.borderBottomColor = '#64DD17';
            });
            elem.bind('blur', function() {
                this.style.borderBottomColor = '#AAA';
                // this.setAttribute("style", "border-color: #AAA");
            });
        }
    }
}])
//加载数据的loading spin
    //xjz
    .directive('mySpin',[function(){
          var opts = {
        lines: 9 // The number of lines to draw
      , length: 0 // The length of each line
      , width: 8 // The line thickness
      , radius: 10 // The radius of the inner circle
      , scale: 1 // Scales overall size of the spinner
      , corners: 1 // Corner roundness (0..1)
      , color: '#FFF' // #rgb or #rrggbb or array of colors
      , opacity: 0.35 // Opacity of the lines
      , rotate: 0 // The rotation offset
      , direction: 1 // 1: clockwise, -1: counterclockwise
      , speed: 1 // Rounds per second
      , trail: 44 // Afterglow percentage
      , fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
      , zIndex: 2e9 // The z-index (defaults to 2000000000)
      , className: 'spinner' // The CSS class to assign to the spinner
      , top: '50%' // Top position relative to parent
      , left: '50%' // Left position relative to parent
      , shadow: true // Whether to render a shadow
      , hwaccel: false // Whether to use hardware acceleration
      , position: 'absolute' // Element positioning
      };
        return{
            restrict:'A',
            link:function(scope,elem,attr){
                scope.$watch(attr.mySpin, function(value) {
                    if(value=='send_going'){
                        scope.spin=new Spinner(opts).spin(elem[0]);
                    }else if(scope.spin){
                        scope.spin.stop();
                        scope.spin=null;
                    }
                  });
            }
        }
    }])
    .directive('mySmallSpin',[function(){
          var opts = {
        lines: 9 // The number of lines to draw
      , length: 0 // The length of each line
      , width: 6 // The line thickness
      , radius: 7 // The radius of the inner circle
      , scale: 1 // Scales overall size of the spinner
      , corners: 1 // Corner roundness (0..1)
      , color: '#000' // #rgb or #rrggbb or array of colors
      , opacity: 0.35 // Opacity of the lines
      , rotate: 0 // The rotation offset
      , direction: 1 // 1: clockwise, -1: counterclockwise
      , speed: 1 // Rounds per second
      , trail: 44 // Afterglow percentage
      , fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
      , zIndex: 2e9 // The z-index (defaults to 2000000000)
      , className: 'spinner' // The CSS class to assign to the spinner
      , top: '50%' // Top position relative to parent
      , left: '50%' // Left position relative to parent
      , shadow: false // Whether to render a shadow
      , hwaccel: false // Whether to use hardware acceleration
      , position: 'absolute' // Element positioning
      };

        return{
            restrict:'A',
            link:function(scope,elem,attr){
                scope.$watch(attr.mySmallSpin, function(value) {
                    if(value=='send_going'){
                        scope.spin=new Spinner(opts).spin(elem[0]);
                    }else if(scope.spin){
                        scope.spin.stop();
                        scope.spin=null;
                    }
                  });
            }
        }
    }])
//隐藏tab栏，建议在所有二级页面上都使用
//XJZ
.directive('hideTabs',function($rootScope){ 
    return {
        restrict:'AE',
        link:function($scope){
            $scope.$on('$ionicView.beforeEnter',function(){
                $rootScope.hideTabs = 'tabs-item-hide';
            });
            $scope.$on('$destroy',function(){
                $rootScope.hideTabs = '';
            });
        }
    }
})
.directive('showTabs',function($rootScope){ 
    return {
        restrict:'AE',
        link:function($scope){
            $scope.$on('$ionicView.beforeEnter',function(){
                $rootScope.hideTabs = '';
            });
        }
    }
})


//未读消息的小红点
.directive('headRedPoint', function($compile, $timeout){
   // Runs during compile
   return {
      restrict: 'A', 
      replace: false,
      link: function(scope, element, attrs, controller) {
          var key = attrs.headRedPoint || false;
          var template ="<span ng-class={true:'head-red-point',false:''}["+key+"]></span>";
          var html = $compile(template)(scope);  
          $timeout(function() {
            var test = angular.element(element).parent().append(html)
          },100)
                     
       }
   };
})

.directive('imageRedPoint', function($compile, $timeout){
   // Runs during compile
   return {
      restrict: 'A', 
      replace: false,
      link: function(scope, element, attrs, controller) {
          var key = attrs.imageRedPoint || false;
          var template ="<span ng-class={true:'image-red-point',false:''}["+key+"]></span>";
          var html = $compile(template)(scope);  
          $timeout(function() {
            var test = angular.element(element).parent().append(html)
          },100)
                     
       }
   };
})

.directive('contenteditable', ['$sce', function($sce) {
  return {
    restrict: 'A', // only activate on element attribute
    require: '?ngModel', // get a hold of NgModelController
    link: function(scope, element, attrs, ngModel) {
      if (!ngModel) return; // do nothing if no ng-model

      // Specify how UI should be updated
      ngModel.$render = function() {
        element.html($sce.getTrustedHtml(ngModel.$viewValue || ''));
      };

      // Listen for change events to enable binding
      element.on('blur keyup change', function() {
        scope.$evalAsync(read);
      });
      read(); // initialize

      // Write data to the model
      function read() {
        var html = element.html();
        // When we clear the content editable the browser leaves a <br> behind
        // If strip-br attribute is provided then we strip this out
        if ( attrs.stripBr && html == '<br>' ) {
          html = '';
        }
        ngModel.$setViewValue(html);
      }
    }
  };
}])

.directive('dateformat', ['$filter',function($filter) {  
    var dateFilter = $filter('date');  
    return {  
        require: 'ngModel',  
        link: function(scope, elm, attrs, ctrl) {  
  
            function formatter(value) {  
                return dateFilter(value, 'yyyy-MM-dd'); //format  
            }  
  
            function parser() {  
                return ctrl.$modelValue;  
            }  
  
            ctrl.$formatters.push(formatter);  
            ctrl.$parsers.unshift(parser);  
  
        }  
    };  
}])

// 写评论的五角星
.directive('ionicRatings',ionicRatings)
;
  
  function ionicRatings () {
    return {
      restrict: 'AE',
      replace: true,
      template: '<div class="text-center ionic_ratings">' +
        '<span class="icon {{iconOff}} ionic_rating_icon_off" ng-style="iconOffColor" ng-click="ratingsClicked(1)" ng-show="rating < 1" ng-class="{\'read_only\':(readOnly)}"></span>' +
        '<span class="icon {{iconOn}} ionic_rating_icon_on" ng-style="iconOnColor" ng-click="ratingsUnClicked(1)" ng-show="rating > 0" ng-class="{\'read_only\':(readOnly)}"></span>' +
        '<span class="icon {{iconOff}} ionic_rating_icon_off" ng-style="iconOffColor" ng-click="ratingsClicked(2)" ng-show="rating < 2" ng-class="{\'read_only\':(readOnly)}"></span>' +
        '<span class="icon {{iconOn}} ionic_rating_icon_on" ng-style="iconOnColor" ng-click="ratingsUnClicked(2)" ng-show="rating > 1" ng-class="{\'read_only\':(readOnly)}"></span>' +
        '<span class="icon {{iconOff}} ionic_rating_icon_off" ng-style="iconOffColor" ng-click="ratingsClicked(3)" ng-show="rating < 3" ng-class="{\'read_only\':(readOnly)}"></span>' +
        '<span class="icon {{iconOn}} ionic_rating_icon_on" ng-style="iconOnColor" ng-click="ratingsUnClicked(3)" ng-show="rating > 2" ng-class="{\'read_only\':(readOnly)}"></span>' +
        '<span class="icon {{iconOff}} ionic_rating_icon_off" ng-style="iconOffColor" ng-click="ratingsClicked(4)" ng-show="rating < 4" ng-class="{\'read_only\':(readOnly)}"></span>' +
        '<span class="icon {{iconOn}} ionic_rating_icon_on" ng-style="iconOnColor" ng-click="ratingsUnClicked(4)" ng-show="rating > 3" ng-class="{\'read_only\':(readOnly)}"></span>' +
        '<span class="icon {{iconOff}} ionic_rating_icon_off" ng-style="iconOffColor" ng-click="ratingsClicked(5)" ng-show="rating < 5" ng-class="{\'read_only\':(readOnly)}"></span>' +
        '<span class="icon {{iconOn}} ionic_rating_icon_on" ng-style="iconOnColor" ng-click="ratingsUnClicked(5)" ng-show="rating > 4" ng-class="{\'read_only\':(readOnly)}"></span>' +
        '</div>',
      scope: {
        ratingsObj: '=ratingsobj'
      },
      link: function(scope, element, attrs) {

        //Setting the default values, if they are not passed
        scope.iconOn = scope.ratingsObj.iconOn || 'ion-ios-star';
        scope.iconOff = scope.ratingsObj.iconOff || 'ion-ios-star-outline';
        scope.iconOnColor = scope.ratingsObj.iconOnColor || 'rgb(200, 200, 100)';
        scope.iconOffColor = scope.ratingsObj.iconOffColor || 'rgb(200, 100, 100)';
        scope.rating = scope.ratingsObj.rating || 1;
        scope.minRating = scope.ratingsObj.minRating || 1;
        scope.readOnly = scope.ratingsObj.readOnly || false;

        scope.$on('changeratingstar',function(event,r,tof){
          scope.rating=r;
          scope.readOnly=tof;
        })
        //Setting the color for the icon, when it is active
        scope.iconOnColor = {
          color: scope.iconOnColor
        };

        //Setting the color for the icon, when it is not active
        scope.iconOffColor = {
          color: scope.iconOffColor
        };

        //Setting the rating
        scope.rating = (scope.rating > scope.minRating) ? scope.rating : scope.minRating;

        //Setting the previously selected rating
        scope.prevRating = 0;

        //Called when he user clicks on the rating
        scope.ratingsClicked = function(val) {
          if (scope.minRating !== 0 && val < scope.minRating) {
            scope.rating = scope.minRating;
          } else {
            scope.rating = val;
          }
          scope.prevRating = val;
          scope.ratingsObj.callback(scope.rating);
        };

        //Called when he user un clicks on the rating
        scope.ratingsUnClicked = function(val) {
          if (scope.minRating !== 0 && val < scope.minRating) {
            scope.rating = scope.minRating;
          } else {
            scope.rating = val;
          }
          if (scope.prevRating == val) {
            if (scope.minRating !== 0) {
              scope.rating = scope.minRating;
            } else {
              scope.rating = 0;
            }
          }
          scope.prevRating = val;
          scope.ratingsObj.callback(scope.rating);
        };
      }
    }
  }
  