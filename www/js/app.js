// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('kidney',['ionic','kidney.services','kidney.controllers','kidney.directives','kidney.filters','ngCordova','ngFileUpload'])

.run(function($ionicPlatform, $state, Storage, $location, $ionicHistory, $ionicPopup,$rootScope,JM,$location,wechat,User,Patient) {
  $ionicPlatform.ready(function() {
    socket = io.connect('ws://121.196.221.44:4050/chat');
    

    var temp = $location.absUrl().split('=')
    // alert(temp)
    if (angular.isDefined(temp[1]) == true)
    {
        var code = temp[1].split('#')[0]
        Storage.set('code',code)
    }
    var wechatData = ""
    if (angular.isDefined(code) == true)
    {
        wechat.getUserInfo({code:code}).then(function(data){ 
          // alert(1)
          wechatData = data.results
          console.log(wechatData)
          Storage.set('openid',wechatData.unionid)
          Storage.set('messageopenid',wechatData.openid)
          if (wechatData.unionid&&wechatData.openid)
          {
            User.getUserIDbyOpenId({openId:wechatData.openid}).then(function(data)
            {
                var tempuserId = data.UserId
                if (angular.isDefined(data.phoneNo) == true)
                {
                    User.setOpenId({phoneNo:data.phoneNo,openId:Storage.get('openid')}).then(function(res){
                        console.log("替换openid");
                    },function(){
                        console.log("连接超时！");
                    })
                    User.getMessageOpenId({type:2,userId:data.UserId}).then(function(res){
                        if (res.results == undefined || res.results == null)
                        {
                          User.setMessageOpenId({type:2,userId:data.UserId,openId:wechatData.openid}).then(function(res){
                              console.log("setopenid");
                          },function(){
                              console.log("连接超时！");
                          })
                        }
                    },function(){
                        console.log("连接超时！");
                    })
                }
            },function(err)
            {
                console.log(err)
            })

          }
          Storage.set('wechathead',wechatData.headimgurl)
          // alert(wechatData.openid)
          // alert(wechatData.nickname)
          User.logIn({username:Storage.get('openid'),password:Storage.get('openid'),role:"patient"}).then(function(data){
                if(data.results==1){
                  if(data.mesg == "No authority!")
                  {
                    alert("您没有权限登陆肾事管家，如您是医生，请登录肾病守护者")
                    $state.go('signin')
                  }
                  else
                  {
                    $ionicPopup.show({   
                         title: '由于系统更新，如您已拥有手机账号，请重新进行验证并绑定微信账号。如果您是首次使用，请点击取消后进行注册！',
                         buttons: [
                           { 
                                text: '取消',
                                type: 'button',
                                onTap: function(e) {
                                    $state.go('signin')
                                }
                              },
                           {
                                text: '確定',
                                type: 'button-positive',
                                onTap: function(e) {
                                    Storage.set('validMode',0)
                                    $state.go('phonevalid',{phonevalidType:"wechat"})
                                }
                           },
                           ]
                    })
                  }
                }
                else if(data.results.mesg=="login success!"){

                    // $scope.logStatus = "登录成功！";
                    $ionicHistory.clearCache();
                    $ionicHistory.clearHistory();
                    User.getUserIDbyOpenId({openId:Storage.get('openid')}).then(function(data)
                    {
                        if (angular.isDefined(data.phoneNo) == true)
                        {
                            Storage.set('USERNAME',data.phoneNo);
                        }
                    },function(err)
                    {
                        console.log(err)
                    })  
                    Storage.set('TOKEN',data.results.token);//token作用目前还不明确
                    Storage.set('isSignIn',"Yes");
                    Storage.set('UID',data.results.userId);
                    // Patient.getPatientDetail({userId:Storage.get("UID")}).then(function(res){
                    //   console.log(Storage.get("UID"))
                    //   // console.log(res.results)
                    //   console.log(res.results.photoUrl)
                    //   // console.log(angular.fromJson(res.results))
                    //   if(res.results.photoUrl==undefined||res.results.photoUrl==""){
                    //     Patient.editPatientDetail({userId:Storage.get("UID"),photoUrl:wechatData.headimgurl}).then(function(r){
                    //       console.log(r);
                    //     })
                    //   }
                    // })
                    User.getMessageOpenId({type:2,userId:Storage.get("UID")}).then(function(res){
                        if (res.results == undefined || res.results == null)
                        {
                          User.setMessageOpenId({type:2,userId:Storage.get("UID"),openId:Storage.get('messageopenid')}).then(function(res){
                              console.log("setopenid");
                          },function(){
                              console.log("连接超时！");
                          })
                        }
                    },function(){
                        console.log("连接超时！");
                    })
                    User.getAgree({userId:data.results.userId}).then(function(res){
                        if(res.results.agreement=="0"){
                            Patient.getPatientDetail({userId:Storage.get('UID')}).then(function(data){
                              if (data.results != null)
                              {
                                $state.go('tab.tasklist');
                              }
                              else
                              {
                                $state.go('userdetail',{last:'register'});
                              }
                            },function(err){
                                console.log(err);
                            })
                        }else{
                            $state.go('agreement',{last:'signin'});
                        }
                    },function(err){
                        console.log(err);
                    })
                    

                }

            },function(err){
                if(err.results==null && err.status==0){
                    $scope.logStatus = "网络错误！";
                    return;
                }
                if(err.status==404){
                    $scope.logStatus = "连接服务器失败！";
                    return;
                }

            });
        });
    }

    // var isSignIN=Storage.get("isSignIN");
    // if(isSignIN=='YES'){
    //   $state.go('tab.tasklist');
    // }
    
    $rootScope.conversation = {
            type: null,
            id: ''
        }
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
    if (window.JPush) {
        window.JPush.init();
    }
    if (window.JMessage) {
        // window.Jmessage.init();
        JM.init();
        document.addEventListener('jmessage.onUserLogout',function(data){
          console.error(Storage.get(UID) +' log out');
          alert('jmessage user log out: '+Storage.get(UID));

        })
        document.addEventListener('jmessage.onOpenMessage', function(msg) {
            console.info('[jmessage.onOpenMessage]:');
            console.log(msg);
            $state.go('tab.consult-chat', { chatId: msg.targetID});
        }, false);
        document.addEventListener('jmessage.onReceiveMessage', function(msg) {
            console.info('[jmessage.onReceiveMessage]:');
            console.log(msg);
            $rootScope.$broadcast('receiveMessage', msg);
            if (device.platform == "Android") {
                // message = window.JMessage.message;
                // console.log(JSON.stringify(message));
            }
        }, false);
        // document.addEventListener('jmessage.onReceiveCustomMessage', function(msg) {
        //     console.log('[jmessage.onReceiveCustomMessage]: ' + msg);
        //     // $rootScope.$broadcast('receiveMessage',msg);
        //     if (msg.targetType == 'single' && msg.fromID != $rootScope.conversation.id) {
        //         if (device.platform == "Android") {
        //             window.plugins.jPushPlugin.addLocalNotification(1, '本地推送内容test', msg.content.contentStringMap.type, 111, 0, null)
        //                 // message = window.JMessage.message;
        //                 // console.log(JSON.stringify(message));
        //         } else {
        //             window.plugins.jPushPlugin.addLocalNotificationForIOS(0, msg.content.contentStringMap.type + '本地推送内容test', 1, 111, null)
        //         }
        //     }

        // }, false);

    }
    window.addEventListener('native.keyboardshow', function(e) {
        $rootScope.$broadcast('keyboardshow', e.keyboardHeight);
    });
    window.addEventListener('native.keyboardhide', function(e) {
        $rootScope.$broadcast('keyboardhide');
    });

  });
})

// --------路由, url模式设置----------------
.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  //注册与登录
  $stateProvider
    .state('signin', {
      cache: false,
      url: '/signin',
      templateUrl: 'partials/login/signin.html',
      controller: 'SignInCtrl'
    })
    .state('agreement', {
      cache: false,
      url: '/agreeOrNot',
      params:{last:null},

      templateUrl: 'partials/login/agreement.html',
      controller: 'AgreeCtrl'
    })
    .state('phonevalid', { 
      cache: false,
      url: '/phonevalid',
      params:{phonevalidType:null},
      templateUrl: 'partials/login/phonevalid.html',
      controller: 'phonevalidCtrl'
    })
    .state('setpassword', {
      cache:false,
      url: '/setpassword',
      params:{phonevalidType:null},
      templateUrl: 'partials/login/setpassword.html',
      controller: 'setPasswordCtrl'
    })
    .state('userdetail',{
      cache:false,
      url:'mine/userdetail',
      params:{last:null},
      templateUrl:'partials/login/userDetail.html',
      controller:'userdetailCtrl'
    })
    .state('messages',{
      cache:false,
      url:'/messages',
      templateUrl:'partials/messages/AllMessage.html',
      controller:'messageCtrl'
    })
    .state('messagesDetail',{
      cache:false,
      url:'/messagesDetail',
      params:{messageType:null},
      templateUrl:'partials/messages/VaryMessage.html',
      controller:'VaryMessageCtrl'
    })
    .state('payment',{
      cache:false,
      url:'/payment',
      params:{messageType:null},
      templateUrl:'partials/payment/payment.html',
      controller:'paymentCtrl'
    });   
    
    //主页面    
  $stateProvider
    .state('tab', {
      cache:false,
      abstract: true,
      url: '/tab',
      templateUrl: 'partials/tabs/tabs.html',
      controller:'GoToMessageCtrl'
    })
    .state('tab.tasklist', {
      url: '/tasklist',
      views: {
        'tab-tasks': {
          cache:false,
          templateUrl: 'partials/tabs/task/tasklist.html',
          controller: 'tasklistCtrl'
        }
      }
    })
    .state('tab.forum', {
      url: '/forum',
      views: {
        'tab-forum': {
          cache:false,
          templateUrl: 'partials/tabs/forum.html',
          controller: 'forumCtrl'
        }
      }
    })
    .state('tab.myDoctors', {
      url: '/myDoctors',
      views: {
        'tab-consult': {
          cache:false,
          templateUrl: 'partials/tabs/consult/myDoctors.html',
          controller: 'DoctorCtrl'
        }
      }
    })
    .state('tab.consult-chat', {
      url: '/consult/chat/:chatId',
      views: {
        'tab-consult': {
          cache:false,
          templateUrl: 'partials/tabs/consult/consult-chat.html',
          controller: 'ChatCtrl'
        }
      }
    })
    .state('tab.consult-comment', {
      url: '/consult/comment',
      params:{counselId:null,doctorId:null,patientId:null},
      cache:false,
      views: {
        'tab-consult': {
          cache:false,
          templateUrl: 'partials/tabs/consult/commentDoctor.html',
          controller: 'SetCommentCtrl'
        }
      }
    })
    .state('tab.AllDoctors', {
      url: '/AllDoctors',
      views: {
        'tab-consult': {
          cache:false,
          templateUrl: 'partials/tabs/consult/allDoctors.html',
          controller: 'DoctorCtrl'
        }
      }
    })
    .state('tab.DoctorDetail', {
      url: '/DoctorDetail/:DoctorId',
      views: {
        'tab-consult': {
          cache:false,
          templateUrl: 'partials/tabs/consult/DoctorDetail.html',
          controller: 'DoctorDetailCtrl'
        }
      }
    })
    .state('tab.consultquestion1', {
      url: '/consultquestion1',
      params:{DoctorId:null,counselType:null},
      views: {
        'tab-consult': {
          cache:false,
          templateUrl: 'partials/tabs/consult/consultquestion1.html',
          controller: 'consultquestionCtrl'
        }
      },
      // params:{DoctorId:null}
    })
    .state('tab.consultquestion2', {
      url: '/consultquestion2',
      params:{DoctorId:null,counselType:null},
      views: {
        'tab-consult': {
          cache:false,
          templateUrl: 'partials/tabs/consult/consultquestion2.html',
          controller: 'consultquestionCtrl'
        }
      },
      // params:{DoctorId:null}
    })
    .state('tab.consultquestion3', {
      url: '/consultquestion3',
      params:{DoctorId:null,counselType:null},
      views: {
        'tab-consult': {
          cache:false,
          templateUrl: 'partials/tabs/consult/consultquestion3.html',
          controller: 'consultquestionCtrl'
        }
      },
      // params:{DoctorId:null}
    })

    .state('tab.mine', {
        url: '/mine',
        views: {
          'tab-mine': {
            cache: false,
            templateUrl: 'partials/tabs/mine/mine.html',
            controller: 'MineCtrl'
          }

        }
         
    })
    .state('tab.DiagnosisInfo', {
        url: '/mine/DiagnosisInfo',
        views: {
          'tab-mine': {
            cache: false,
            templateUrl: 'partials/tabs/mine/diagnosisInfo.html',
            controller: 'DiagnosisCtrl'
          }

        }
         
    })
    .state('tab.myConsultRecord', {
        url: '/mine/ConsultRecord',
        views: {
          'tab-mine': {
            cache: false,
            templateUrl: 'partials/tabs/mine/consultRecord.html',
            controller: 'ConsultRecordCtrl'
          }

        }
         
    })
    .state('tab.myHealthInfo', {
        url: '/mine/HealthInfo',
        views: {
          'tab-mine': {
            cache: false,
            templateUrl: 'partials/tabs/mine/HealthInfo.html',
            controller: 'HealthInfoCtrl'
          }

        }
         
    })
    .state('tab.myHealthInfoDetail', {
      cache:false,
      url: '/mine/HealthInfoDetail/',
      params: {id:null,caneidt:null},
      views: {
        'tab-mine': {
          templateUrl: 'partials/tabs/mine/editHealthInfo.html',
          controller: 'HealthDetailCtrl'
        }

      }
         
    })
     .state('tab.myMoney', {
        url: '/mine/Account/',
        views: {
          'tab-mine': {
            cache: false,
            templateUrl: 'partials/tabs/mine/money.html',
            controller: 'MoneyCtrl'
          }

        }     
         
    })
     .state('tab.about',{
      cache:false,
      url:'/mine/about',
      views:{
        'tab-mine':{
            templateUrl:'partials/about.html',
            controller:'aboutCtrl'
        }
      }
      
    })
    .state('tab.changePassword',{
        cache:false,
        url:'/mine/changePassword',
        views:{
            'tab-mine':{
                templateUrl:'partials/changePassword.html',
                controller:'changePasswordCtrl'
            }
        }
      
    })

    .state('tab.taskSet', {
        url: '/mine/taskSet/',
        views: {
          'tab-mine': {
            cache: false,
            templateUrl: 'partials/tabs/task/taskSet.html',
            controller: 'TaskSetCtrl'
          }
        }           
    })  

     //肾病保险
  $stateProvider
    .state('insurance', {
      cache: false,
      url: '/insurance',
      templateUrl: 'partials/insurance/insurance.html',
      controller: 'insuranceCtrl'
    })
    .state('intension', {
      cache: false,
      url: '/intension',
      templateUrl: 'partials/insurance/intension.html',
      controller: 'insuranceCtrl'
    })
    .state('insuranceexpense', {
      cache: false,
      url: '/insuranceexpense',
      templateUrl: 'partials/insurance/insuranceexpense.html',
      controller: 'insurancefunctionCtrl'
    })
    .state('kidneyfunction', {
      cache: false,
      url: '/kidneyfunction',
      templateUrl: 'partials/insurance/kidneyfunction.html',
      controller: 'insurancefunctionCtrl'
    })
    .state('insurancestafflogin', {
      cache: false,
      url: '/insurancestafflogin',
      templateUrl: 'partials/insurance/insurancestafflogin.html',
      controller: 'insurancestaffCtrl'
    })
    .state('insurancestaff', {
      cache: false,
      url: '/insurancestaff',
      templateUrl: 'partials/insurance/insurancestaff.html',
      controller: 'insurancestaffCtrl'
    });

  $urlRouterProvider.otherwise('/signin');



   
 



});   


 
