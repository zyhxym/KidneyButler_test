// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('kidney', ['ionic', 'kidney.services', 'kidney.controllers', 'kidney.directives', 'kidney.filters', 'ngCordova', 'ngFileUpload', 'angular-jwt'])

  .run(function ($ionicPlatform, $state, Storage, $location, $ionicHistory, $ionicPopup, $rootScope, JM, $location, wechat, User, Patient, $q, $window, CONFIG) {
    $ionicPlatform.ready(function () {
      socket = io.connect(CONFIG.socketUrl);

      /*
      获取url中的code，state等参数 TDY
       */
      var temp = $location.absUrl().split('=')
      if (temp[1]) {
        if (temp[2]) {
          var code = temp[1].split('&')[0]
          var state = temp[2].split('#')[0]
          var params = state.split('_');
          Storage.set('code', code)
        }
        else {
          var code = temp[1].split('#')[0]
          Storage.set('code', code)
        }
      }
      // 获取结束
      var wechatData = ""
      if (code) {
        /**
         * 获取微信个人信息
         * @Author   TongDanyang
         * @DateTime 2017-07-04
         * @param    {[String]}    code  [通过微信服务器获取的code，只能使用一次]
         * @return   {[results]}            [微信的个人信息]
         */
        wechat.getUserInfo({ code: code }).then(function (data) {
          // alert(1)
          wechatData = data.results
          // console.log(wechatData)
          if (wechatData.unionid) {
            Storage.set('openid', wechatData.unionid)
          }
          if (wechatData.headimgurl) {
            Storage.set('wechathead', wechatData.headimgurl)
          }
          if (wechatData.openid) {
            Storage.set('messageopenid', wechatData.openid)
          }
          if (wechatData.unionid && wechatData.openid) {
            /**
             * 使用获取到的unionid进行登录
             * @Author   TongDanyang
             * @DateTime 2017-07-04
             * @param    {[String]}   username [description]
             * @param    {[String]}   password [description]
             * @param    {[String]}   role [description]
             * @return   {[type]}                  [description]
             */
            User.logIn({ username: Storage.get('openid'), password: Storage.get('openid'), role: "patient" }).then(function (data) {
              // console.log(data)
              if (data.results.mesg == "login success!") {

                // $scope.logStatus = "登录成功！";
                $ionicHistory.clearCache();
                $ionicHistory.clearHistory();

                Storage.set('TOKEN', data.results.token);//token作用目前还不明确
                Storage.set('refreshToken', data.results.refreshToken);
                Storage.set('isSignIn', "Yes");
                Storage.set('UID', data.results.userId);

                /**
                 * [获取手机号码]
                 * @Author   TongDanyang
                 * @DateTime 2017-07-07
                 * @param    {[string]}    username [微信返回的unionid]
                 * @return   {[object]}    data.phoneNo [用户的手机号码]
                 */
                User.getUserId({ username: Storage.get('openid') }).then(function (data) {
                  if (angular.isDefined(data.phoneNo) == true) {
                    Storage.set('USERNAME', data.phoneNo);
                  }
                }, function (err) {
                  console.log(err)
                })

                var results = [];
                var errs = [];

                // 根据state的进行不同的操作，包含insurance时跳转到保险页面，有params时进入具体的交流页面，其他进行登录的后续操作
                if (state == 'testpatientinsurance') {
                  $state.go('insurance')
                }
                else if (params.length > 1 && params[0] == 'patient') {
                  if (params[1] == '11') {
                    $state.go('tab.consult-chat', { chatId: params[3] });
                  }
                  else {
                    $state.go('signin')
                  }
                } else {
                  $q.all([
                    /**
                     * [根据用户ID获取协议状态]
                     * @Author   TongDanyang
                     * @DateTime 2017-07-05
                     * @param    {[string]}   userId [用户ID]
                     * @return   {[Object]}   res.results.agreement [agreement是0表示已签署跳转到首页;否则是未签署跳转到签署协议页]
                     */
                    User.getAgree({ userId: data.results.userId }).then(function (res) {
                      results.push(res)
                    }, function (err) {
                      errs.push(err)
                    }),
                    /**
                     * [写入用户对应肾病守护者联盟的openid]
                     * @Author   TongDanyang
                     * @DateTime 2017-07-05
                     * @param    {[interger]}   type [2时是微信病人端]
                     * @param    {[string]}     userId [description]
                     * @param    {[string]}     openId [微信返回的openid]
                     * @return   {[object]}             [description]
                     */
                    User.setMessageOpenId({ type: 2, userId: Storage.get("UID"), openId: Storage.get('messageopenid') }).then(function (res) {
                      // results.push(res)
                    }, function (err) {
                      errs.push(err)
                    }),
                    /**
                     * [获取病人个人信息，如果没有头像则将微信头像作为其默认头像]
                     * @Author   TongDanyang
                     * @DateTime 2017-07-05
                     * @param    {[string]}    userId [description]
                     * @return   {[type]}             [description]
                     */
                    Patient.getPatientDetail({ userId: Storage.get('UID') }).then(function (res) {
                      results.push(res)
                    }, function (err) {
                      errs.push(err)
                    })
                  ]).then(function () {
                    console.log(results)
                    var a, b;
                    for (var i in results) {
                      if (results[i].results.agreement != undefined) {
                        a = i;
                      } else {
                        b = i;
                      }
                    }
                    if (results[a].results.agreement == "0") {
                      if (results[b].results != null) {
                        if (results[b].results.photoUrl == undefined || results[b].results.photoUrl == "") {
                          /**
                           * [将微信头像的地址存到病人个人信息中]
                           * @Author   TongDanyang
                           * @DateTime 2017-07-05
                           * @param    {[string]}    userId [description]
                           * @param    {[string]}    photoUrl [description]
                           * @return   {[type]}             [description]
                           */
                          Patient.editPatientDetail({ userId: Storage.get("UID"), photoUrl: wechatData.headimgurl }).then(function (r) {
                            $state.go('tab.tasklist');
                          }, function (err) {
                            $state.go('tab.tasklist');
                          })
                        } else {
                          $state.go('tab.tasklist');
                        }
                      }
                      else {
                        $state.go('tab.tasklist');
                      }
                      // else {
                      //     $state.go('userdetail', { last: 'implement' });
                      // }
                    } else {
                      $state.go('agreement', { last: 'signin' });
                    }
                  });
                }
              }
              else {
                $state.go('signin');
              }

            }, function (err) {
              if (err.results == null && err.status == 0) {
                $scope.logStatus = "网络错误！";
                $state.go('signin');
                return;
              }
              if (err.status == 404) {
                $scope.logStatus = "连接服务器失败！";
                $state.go('signin')
                return;
              }
              $state.go('signin')
            });
            // }
            // },function(err)
            // {
            //     console.log(err)
            // })

          }
          else {
            $state.go('signin');
          }
          // alert(wechatData.openid)
          // alert(wechatData.nickname)

        }, function (err) {
          console.log(err)
          $state.go('signin')
          // alert(2);
        });
      }
      else {
        $state.go('signin')
      }

      // var isSignIN=Storage.get("isSignIN");
      // if(isSignIN=='YES'){
      //   $state.go('tab.tasklist');
      // }

      $rootScope.conversation = {
        type: null,
        id: ''
      }
      if (window.cordova && window.cordova.plugins.Keyboard) {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

        // Don't remove this line unless you know what you are doing. It stops the viewport
        // from snapping when text inputs are focused. Ionic handles this internally for
        // a much nicer keyboard experience.
        cordova.plugins.Keyboard.disableScroll(true);
      }
      if (window.StatusBar) {
        StatusBar.styleDefault();
      }
      if (window.JPush) {
        window.JPush.init();
      }
      if (window.JMessage) {
        // window.Jmessage.init();
        JM.init();
        document.addEventListener('jmessage.onUserLogout', function (data) {
          console.error(Storage.get(UID) + ' log out');
          alert('jmessage user log out: ' + Storage.get(UID));

        })
        document.addEventListener('jmessage.onOpenMessage', function (msg) {
          console.info('[jmessage.onOpenMessage]:');
          console.log(msg);
          $state.go('tab.consult-chat', { chatId: msg.targetID });
        }, false);
        document.addEventListener('jmessage.onReceiveMessage', function (msg) {
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
      window.addEventListener('native.keyboardshow', function (e) {
        $rootScope.$broadcast('keyboardshow', e.keyboardHeight);
      });
      window.addEventListener('native.keyboardhide', function (e) {
        $rootScope.$broadcast('keyboardhide');
      });
      $rootScope.online = navigator.onLine;
      $window.addEventListener("offline", function () {
        $rootScope.$apply(function () {
          $rootScope.online = false;
        });
      }, false);
      $window.addEventListener("online", function () {
        $rootScope.$apply(function () {
          $rootScope.online = true;
        });
      }, false);
    });

    // 微信分享
    var config = ''
    var path = $location.absUrl().split('#')[0];
    var option = {
      title: '肾事管家',
      desc: '让每一位慢性肾病患者得到有效管理提高预期寿命',
      link: "http://testpatient.haihonghospitalmanagement.com/share/share.html",
      imgUrl: 'http://testpatient.haihonghospitalmanagement.com/share/logo.png'
    };
    wechat.settingConfig({ url: path }).then(function (data) {
      // alert(data.results.timestamp)
      config = data.results
      config.jsApiList = [
        'onMenuShareTimeline',
        'onMenuShareAppMessage',
        'onMenuShareQQ',
        'onMenuShareWeibo',
        'onMenuShareQZone',
        'setBounceBackground'
      ]
      wx.config({
        debug: false,
        appId: config.appId,
        timestamp: config.timestamp,
        nonceStr: config.nonceStr,
        signature: config.signature,
        jsApiList: config.jsApiList
      });
      wx.ready(function () {
        wx.onMenuShareTimeline(option);
        wx.onMenuShareQQ(option);
        wx.onMenuShareAppMessage({
          title: '肾事管家',
          desc: '让每一位慢性肾病患者得到有效管理提高预期寿命',
          link: 'http://testpatient.haihonghospitalmanagement.com/share/share.html', // 这里替换成下载地址，如果是要分享下载链接的话
          imgUrl: 'http://testpatient.haihonghospitalmanagement.com/share/logo.png'
        });
      });
      wx.error(function (res) {
        alert(JSON.stringify(res));
      });
    }, function (err) {
      alert(JSON.stringify(res));
    })



  })

  // --------路由, url模式设置----------------
  .config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    //禁止側滑
    $ionicConfigProvider.views.swipeBackEnabled(false);
    //注册与登录
    $stateProvider
      .state('welcome', {
        cache: false,
        url: '/welcome',
        templateUrl: 'partials/login/welcome.html',
        controller: 'welcomeCtrl'
      })
      .state('signin', {
        cache: false,
        url: '/signin',
        templateUrl: 'partials/login/signin.html',
        controller: 'SignInCtrl'
      })
      .state('agreement', {
        cache: false,
        url: '/agreeOrNot',
        params: { last: null },

        templateUrl: 'partials/login/agreement.html',
        controller: 'AgreeCtrl'
      })
      .state('phonevalid', {
        cache: false,
        url: '/phonevalid',
        params: { phonevalidType: null },
        templateUrl: 'partials/login/phonevalid.html',
        controller: 'phonevalidCtrl'
      })
      .state('setpassword', {
        cache: false,
        url: '/setpassword',
        params: { phonevalidType: null },
        templateUrl: 'partials/login/setpassword.html',
        controller: 'setPasswordCtrl'
      })
      .state('userdetail', {
        cache: false,
        url: 'mine/userdetail',
        params: { last: null },
        templateUrl: 'partials/login/userDetail.html',
        controller: 'userdetailCtrl'
      })
      .state('messages', {
        cache: false,
        url: '/messages',
        templateUrl: 'partials/messages/AllMessage.html',
        controller: 'messageCtrl'
      })
      .state('messagesDetail', {
        cache: false,
        url: '/messagesDetail',
        params: { messageType: null },
        templateUrl: 'partials/messages/VaryMessage.html',
        controller: 'VaryMessageCtrl'
      })
      .state('payment', {
        cache: false,
        url: '/payment',
        params: { messageType: null },
        templateUrl: 'partials/payment/payment.html',
        controller: 'paymentCtrl'
      });

    //主页面    
    $stateProvider
      .state('tab', {
        cache: false,
        abstract: true,
        url: '/tab',
        templateUrl: 'partials/tabs/tabs.html',
        controller: 'GoToMessageCtrl'
      })
      .state('tab.tasklist', {
        url: '/tasklist',
        views: {
          'tab-tasks': {
            cache: false,
            templateUrl: 'partials/tabs/task/tasklist.html',
            controller: 'tasklistCtrl'
          }
        }
      })
      .state('tab.forum', {
        url: '/forum',
        views: {
          'tab-forum': {
            cache: false,
            templateUrl: 'partials/tabs/forum.html',
            controller: 'forumCtrl'
          }
        }
      })
      .state('tab.myDoctors', {
        url: '/myDoctors',
        views: {
          'tab-consult': {
            cache: false,
            templateUrl: 'partials/tabs/consult/myDoctors.html',
            controller: 'DoctorCtrl'
          }
        }
      })
      .state('tab.consult-chat', {
        url: '/consult/chat/:chatId',
        views: {
          'tab-consult': {
            cache: false,
            templateUrl: 'partials/tabs/consult/consult-chat.html',
            controller: 'ChatCtrl'
          }
        }
      })
      .state('tab.consult-comment', {
        url: '/consult/comment',
        params: { counselId: null, doctorId: null, patientId: null },
        cache: false,
        views: {
          'tab-consult': {
            cache: false,
            templateUrl: 'partials/tabs/consult/commentDoctor.html',
            controller: 'SetCommentCtrl'
          }
        }
      })
      .state('tab.AllDoctors', {
        url: '/AllDoctors',
        views: {
          'tab-consult': {
            cache: false,
            templateUrl: 'partials/tabs/consult/allDoctors.html',
            controller: 'DoctorCtrl'
          }
        }
      })
      .state('tab.DoctorDetail', {
        url: '/DoctorDetail/:DoctorId',
        views: {
          'tab-consult': {
            cache: false,
            templateUrl: 'partials/tabs/consult/DoctorDetail.html',
            controller: 'DoctorDetailCtrl'
          }
        }
      })
      .state('tab.consultQuestionnaire', {
        url: '/Questionnaire',
        params: { DoctorId: null, counselType: null },
        views: {
          'tab-consult': {
            cache: true,
            templateUrl: 'partials/tabs/consult/questionnaire.html',
            controller: 'consultquestionCtrl'
          }
        },
      })
      // .state('tab.consultquestion1', {
      //   url: '/consultquestion1',
      //   params:{DoctorId:null,counselType:null},
      //   views: {
      //     'tab-consult': {
      //       cache:false,
      //       templateUrl: 'partials/tabs/consult/consultquestion1.html',
      //       controller: 'consultquestionCtrl'
      //     }
      //   },
      //   // params:{DoctorId:null}
      // })
      // .state('tab.consultquestion2', {
      //   url: '/consultquestion2',
      //   params:{DoctorId:null,counselType:null},
      //   views: {
      //     'tab-consult': {
      //       cache:false,
      //       templateUrl: 'partials/tabs/consult/consultquestion2.html',
      //       controller: 'consultquestionCtrl'
      //     }
      //   },
      //   // params:{DoctorId:null}
      // })
      // .state('tab.consultquestion3', {
      //   url: '/consultquestion3',
      //   params:{DoctorId:null,counselType:null},
      //   views: {
      //     'tab-consult': {
      //       cache:false,
      //       templateUrl: 'partials/tabs/consult/consultquestion3.html',
      //       controller: 'consultquestionCtrl'
      //     }
      //   },
      //   // params:{DoctorId:null}
      // })

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
        cache: false,
        url: '/mine/HealthInfoDetail/',
        params: { id: null, caneidt: null },
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
      .state('tab.about', {
        cache: false,
        url: '/mine/about',
        views: {
          'tab-mine': {
            templateUrl: 'partials/about.html',
            controller: 'aboutCtrl'
          }
        }

      })
      .state('tab.advice', {
        cache: false,
        url: '/mine/advice/',
        views: {
          'tab-mine': {
            templateUrl: 'partials/tabs/mine/advice.html',
            controller: 'adviceCtrl'
          }

        }

      })
      .state('tab.changePassword', {
        cache: false,
        url: '/mine/changePassword',
        views: {
          'tab-mine': {
            templateUrl: 'partials/changePassword.html',
            controller: 'changePasswordCtrl'
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

    $urlRouterProvider.otherwise('/welcome');








  })

  // $httpProvider.interceptors提供http request及response的预处理
  .config(['$httpProvider', 'jwtOptionsProvider', function ($httpProvider, jwtOptionsProvider) {
    // 下面的getter可以注入各种服务, service, factory, value, constant, provider等, constant, provider可以直接在.config中注入, 但是前3者不行
    jwtOptionsProvider.config({
      whiteListedDomains: ['121.196.221.44', '121.43.107.106', 'testpatient.haihonghospitalmanagement.com', 'testdoctor.haihonghospitalmanagement.com', 'patient.haihonghospitalmanagement.com', 'doctor.haihonghospitalmanagement.com', 'localhost'],
      tokenGetter: ['options', 'jwtHelper', '$http', 'CONFIG', 'Storage', '$state', '$ionicPopup', function (options, jwtHelper, $http, CONFIG, Storage, $state, $ionicPopup) {
        // console.log(config);
        // console.log(CONFIG.baseUrl);

        // var token = sessionStorage.getItem('token');
        var token = Storage.get('TOKEN');
        // var refreshToken = sessionStorage.getItem('refreshToken');
        var refreshToken = Storage.get('refreshToken');
        if (!token && !refreshToken) {
          return null;
        }

        var isExpired = true;
        try {
          /*
           * 由于jwt自带的过期判断方法与服务器端使用的加密方法不匹配，使用jwthelper解码的方法对token进行解码后自行判断token是否过期
           */
          // isExpired = jwtHelper.isTokenExpired(token);
          var temp = jwtHelper.decodeToken(token);
          if (temp.exp === "undefined") {
            isExpired = false;
          }
          else {
            // var d = new Date(0); // The 0 here is the key, which sets the date to the epoch
            // d.setUTCSeconds(temp.expireAfter);
            isExpired = !(temp.exp > new Date().valueOf());//(new Date().valueOf() - 8*3600*1000));
            // console.log(temp)
          }

          // console.log(isExpired);
        }
        catch (e) {
          console.log(e);
          isExpired = true;
        }
        // 这里如果同时http.get两个模板, 会产生两个$http请求, 插入两次jwtInterceptor, 执行两次getrefreshtoken的刷新token操作, 会导致同时查询redis的操作, ×××估计由于数据库锁的关系×××(由于token_manager.js中的exports.refreshToken中直接删除了redis数据库里前一个refreshToken, 导致同时发起的附带有这个refreshToken的getrefreshtoken请求查询返回reply为null, 导致返回"凭证不存在!"错误), 其中一次会查询失败, 导致返回"凭证不存在!"错误, 使程序流程出现异常(但是为什么会出现模板不能加载的情况? 是什么地方阻止了模板的下载?)
        if (options.url.substr(options.url.length - 5) === '.html' || options.url.substr(options.url.length - 3) === '.js' || options.url.substr(options.url.length - 4) === '.css' || options.url.substr(options.url.length - 4) === '.jpg' || options.url.substr(options.url.length - 4) === '.png' || options.url.substr(options.url.length - 4) === '.ico' || options.url.substr(options.url.length - 5) === '.woff') {  // 应该把这个放到最前面, 否则.html模板载入前会要求refreshToken, 如果封装成APP后, 这个就没用了, 因为都在本地, 不需要从服务器上获取, 也就不存在http get请求, 也就不会interceptors
          // console.log(config.url);
          return null;
        }
        else if (isExpired) {    // 需要加上refreshToken条件, 否则会出现网页循环跳转
          // This is a promise of a JWT token
          // console.log(token);
          if (refreshToken && refreshToken.length >= 16) {  // refreshToken字符串长度应该大于16, 小于即为非法
            /**
             * [刷新token]
             * @Author   TongDanyang
             * @DateTime 2017-07-05
             * @param    {[string]}  refreshToken [description]
             * @return   {[object]}  data.results  [新的token信息]
             */
            return $http({
              url: CONFIG.baseUrl + 'token/refresh?refresh_token=' + refreshToken,
              // This makes it so that this request doesn't send the JWT
              skipAuthorization: true,
              method: 'GET',
              timeout: 5000
            }).then(function (res) { // $http返回的值不同于$resource, 包含config等对象, 其中数据在res.data中
              // console.log(res);
              // sessionStorage.setItem('token', res.data.token);
              // sessionStorage.setItem('refreshToken', res.data.refreshToken);
              Storage.set('TOKEN', res.data.results.token);
              Storage.set('refreshToken', res.data.results.refreshToken);
              return res.data.results.token;
            }, function (err) {
              console.log(err);
              if (refreshToken == Storage.get('refreshToken')) {
                // console.log("凭证不存在!")
                console.log(options)
                $ionicPopup.show({
                  title: '您离开太久了，请重新登录',
                  buttons: [
                    {
                      text: '取消',
                      type: 'button'
                    },
                    {
                      text: '確定',
                      type: 'button-positive',
                      onTap: function (e) {
                        $state.go('signin')
                      }
                    },
                  ]
                })
              }
              // sessionStorage.removeItem('token');
              // sessionStorage.removeItem('refreshToken');
              // Storage.rm('token');
              // Storage.rm('refreshToken');
              return null;
            });
          }
          else {
            Storage.rm('refreshToken');  // 如果是非法refreshToken, 删除之
            return null;
          }
        }
        else {
          // console.log(token);
          return token;
        }
      }]
    })

    $httpProvider.interceptors.push('jwtInterceptor');
  }])

