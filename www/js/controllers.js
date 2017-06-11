angular.module('kidney.controllers', ['ionic','kidney.services','ngResource','ionic-datepicker','kidney.directives'])//,'ngRoute'
//登录--PXY
.controller('SignInCtrl', ['$scope','$timeout','$state','Storage','$ionicHistory','$http','Data','User','jmapi', '$location','wechat','$sce','Patient',function($scope, $timeout,$state,Storage,$ionicHistory,$http,Data,User,jmapi,$location,wechat,$sce,Patient) {
  //$scope.barwidth="width:0%";
  $scope.navigation_login=$sce.trustAsResourceUrl("http://patientdiscuss.haihonghospitalmanagement.com/member.php?mod=logging&action=logout&formhash=xxxxxx");
  // Storage.set("personalinfobackstate","logOn");
  // alert($location.absUrl())
  var temp = $location.absUrl().split('=')
  // alert(temp)
  // var code = temp[1].split('#')[0]
  // alert(code)
  // if (code != null )
  // {
  //   // alert(0)
  //   wechat.getUserInfo({code:code}).then(function(data){ 
  //     // alert(1)
  //     wechatData = data.results
  //     console.log(wechatData)
  //     alert(wechatData.openid)
  //     alert(wechatData.nickname)
  //   },function(err){
  //     console.log(err)
  //     // alert(2);
  //   })
  // }

  //-------------test测试-------------
    // $scope.test = function(){
    //    console.log("test for restful");
    //   User.updateAgree({userId:"U201703310032","agreement":0})
    // .then(
    //   function(data)
    //   {
    //     console.log('data');
    //     console.log(data);
    //   },
    //   function(err)
    //   {
    //     console.log('err');
    //     console.log(err);
    //   }
    // )
    // }




  //-----------测试结束------------
  
  if(Storage.get('USERNAME')!=null){
    $scope.logOn={username:Storage.get('USERNAME'),password:""};

  }else{
    $scope.logOn={username:"",password:""};
  }


  $scope.signIn = function(logOn) {  
    $scope.logStatus='';
    if((logOn.username!="") && (logOn.password!="")){
      var phoneReg=/^(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
      //手机正则表达式验证
      if(!phoneReg.test(logOn.username)){
            $scope.logStatus="手机号验证失败！";
            return;
        }
      else{
            User.getUserId({phoneNo:logOn.username}).then(function(data){
                if (data.UserId && data.roles) 
                {
                  User.setMessageOpenId({type:2,userId:data.UserId,openId:Storage.get('messageopenid')}).then(function(res){
                  },function(err){
                  })
                }
            })
            Storage.set('USERNAME',logOn.username);
            var logPromise = User.logIn({username:logOn.username,password:logOn.password,role:"patient"});
            logPromise.then(function(data){
                if(data.results==1){
                    if(data.mesg== "User doesn't Exist!"){
                        $scope.logStatus="账号不存在！";
                        return;
                    }
                    else if(data.mesg== "User password isn't correct!"){
                        $scope.logStatus = "账号或密码错误！";
                        return;
                    }
                    else if(data.mesg== "No authority!"){
                        $scope.logStatus = "没有患者权限，请注册患者或进入肾健康守护者进行操作！";
                        return;
                    }
                    else{
                      $scope.logStatus = "账号密码错误！";
                      return;
                    }
                }
                else if(data.results.mesg=="login success!"){
                    //jmessage login

                    jmapi.users(data.results.userId);
                    
                    $scope.logStatus = "登录成功！";
                    $ionicHistory.clearCache();
                    $ionicHistory.clearHistory();
                    Storage.set('TOKEN',data.results.token);//token作用目前还不明确
                    Storage.set('isSignIn',"Yes");
                    Storage.set('UID',data.results.userId);
                    User.getAgree({userId:data.results.userId}).then(function(res){
                        if(res.results.agreement=="0"){
                            // Patient.getPatientDetail({userId:Storage.get('UID')}).then(function(data){
                            //   if (data.results != null)
                            //   {
                                $timeout(function(){$state.go('tab.tasklist');},500);
                            //   }
                            //   else
                            //   {
                            //     $state.go('userdetail',{last:'implement'});
                            //   }
                            // },function(err){
                            //     console.log(err);
                            // })
                        }else{
                            $timeout(function(){$state.go('agreement',{last:'signin'});},500);
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
      }
      

    }
    else{
      $scope.logStatus="请输入完整信息！";
    }
  }

  
  $scope.toRegister = function(){
    
    $state.go('phonevalid',{phonevalidType:'register'});
   
  }
  $scope.toReset = function(){
    $state.go('phonevalid',{phonevalidType:'reset'});
  } 
  
  // User.getUserIDbyOpenId({openId:Storage.get('openid')}).then(function(data)
  // {
  //     if (angular.isDefined(data.UserId) == true)
  //     {
  //         Patient.getPatientDetail({userId:Storage.get("UID")}).then(function(res){
  //           console.log(Storage.get("UID"))
  //           // console.log(res.results)
  //           console.log(res.results.photoUrl)
  //           // console.log(angular.fromJson(res.results))
  //           if(res.results.photoUrl==undefined||res.results.photoUrl==""){
  //             Patient.editPatientDetail({userId:Storage.get("UID"),photoUrl:Storage.get('wechathead')}).then(function(r){
  //               console.log(r);
  //             })
  //           }
  //         })
  //     }
  // },function(err)
  // {
  //     console.log(err)
  // })

}])

.controller('AgreeCtrl', ['$stateParams','$scope','$timeout','$state','Storage','$ionicHistory','$http','Data','User','jmapi', 'Patient',function($stateParams,$scope, $timeout,$state,Storage,$ionicHistory,$http,Data,User,jmapi,Patient) {
    $scope.YesIdo = function(){
        console.log('yesido');
        if($stateParams.last=='signin'){
            User.updateAgree({userId:Storage.get('UID'),agreement:"0"}).then(function(data){
                if(data.results!=null){
                    jmapi.users(Storage.get('UID'));
                    Patient.getPatientDetail({userId:Storage.get('UID')}).then(function(data){
                      if (data.results != null)
                      {
                        $timeout(function(){$state.go('tab.tasklist');},500);
                      }
                      // else
                      // {
                      //   $state.go('userdetail',{last:'implement'});
                      // }
                    },function(err){
                        console.log(err);
                    })
                }else{
                    console.log("用户不存在!");
                }
            },function(err){
                console.log(err);
            })
        }
        else if($stateParams.last=='register'){
            $timeout(function(){$state.go('setpassword',{phonevalidType:'register'});},500);
        }
    }

     var a=document.getElementById("agreement");
        // console.log(document.body.clientHeight);
        console.log(window.screen.height);
        a.style.height=window.screen.height*0.65+"px";

}])


//手机号码验证--PXY
.controller('phonevalidCtrl', ['$scope','$state','$interval', '$stateParams','Storage','User','$timeout', 'Patient','$ionicPopup',function($scope, $state,$interval,$stateParams,Storage,User,$timeout,Patient,$ionicPopup) {
  //$scope.barwidth="width:0%";
  // Storage.set("personalinfobackstate","register")
  
  $scope.Verify={Phone:"",Code:""};
  $scope.veritext="获取验证码";
  $scope.isable=false;
  var tempuserId = ""
  var unablebutton = function(){      
     //验证码BUTTON效果
        $scope.isable=true;
        $scope.veritext="60S再次发送"; 
        var time = 59;
        var timer;
        timer = $interval(function(){
            if(time==0){
                $interval.cancel(timer);
                timer=undefined;        
                $scope.veritext="获取验证码";       
                $scope.isable=false;
            }else{
                $scope.veritext=time+"S再次发送";
                time--;
            }
        },1000);
  }
  //发送验证码
    var sendSMS = function(phone){
        var SMS = User.sendSMS({mobile:phone,smsType:1});
            SMS.then(function(data){
                unablebutton();
                if(data.mesg.substr(0,8)=="您的邀请码已发送"){
                    $scope.logStatus = "您的验证码已发送，重新获取请稍后";
                }else if (data.results == 1){
                    $scope.logStatus = "验证码发送失败，请稍后再试";
                }
                else{
                    $scope.logStatus ="验证码发送成功！";
                }
            },function(err){
                if(err.results==null && err.status==0){
                    $scope.logStatus ="连接超时!";
                    return;
                }
                $scope.logStatus = "验证码发送失败！";

            });
    }

    // console.log($stateParams.phonevalidType);



    var isregisted = false;
    //点击获取验证码
    $scope.getcode=function(Verify){
        $scope.logStatus='';
    
        if (Verify.Phone=="") {
            $scope.logStatus="手机号码不能为空！";
            return;
        }
        var phoneReg=/^(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
        //手机正则表达式验证
        if(!phoneReg.test(Verify.Phone)){
            $scope.logStatus="手机号验证失败！";
            return;
        }

        //如果为注册，注册过的用户不能获取验证码；如果为重置密码，没注册过的用户不能获取验证码
        if($stateParams.phonevalidType=='register'){
            User.getUserId({phoneNo:Verify.Phone}).then(function(data){
                if(data.results == 0){
                    if (data.roles.indexOf('patient') == -1)
                    {
                        sendSMS(Verify.Phone);
                    }
                    else{
                        $scope.logStatus = "该手机号码已经注册！";
                    }
                    
                }else if(data.results == 1){
                    sendSMS(Verify.Phone);
                }
            },function(){
                $scope.logStatus="连接超时！";
            });
        }
        else if($stateParams.phonevalidType=='reset'){
            User.getUserId({phoneNo:Verify.Phone}).then(function(data){
                if(data.results == 1){
                    $scope.logStatus = "该账户不存在！";
                }else if(data.results == 0){
                    sendSMS(Verify.Phone);
                }
            },function(){
                $scope.logStatus="连接超时！";
            });
        }
        else if($stateParams.phonevalidType=='wechat'){
            User.getUserId({phoneNo:Verify.Phone}).then(function(data){
                if(data.results == 0){
                    tempuserId = data.UserId
                    if(data.roles.indexOf('patient') == -1){
                        $scope.logStatus = "该手机号码没有患者权限,请确认手机号码或返回登录页面进行注册！";
                        return;
                    }else {
                        $scope.logStatus = "该手机号码已经注册,请验证手机号绑定微信";
                        isregisted = true
                        sendSMS(Verify.Phone);
                    }
                }else if(data.results == 1){
                    $scope.logStatus = "该用户不存在！请返回登录页面进行注册！"
                    return;
                }
            },function(){
                $scope.logStatus="连接超时！";
            });
        }
    }

    //判断验证码和手机号是否正确
    $scope.gotoReset = function(Verify){

        $scope.logStatus = '';
        if(Verify.Phone!="" && Verify.Code!=""){
        //结果分为三种：(手机号验证失败)1验证成功；2验证码错误；3连接超时，验证失败
            var phoneReg=/^(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
            //手机正则表达式验证
            if(phoneReg.test(Verify.Phone)){ 
                //测试用
                // if(Verify.Code==5566){
                //     $scope.logStatus = "验证成功";
                //     Storage.set('USERNAME',Verify.Phone);
                    // if($stateParams.phonevalidType == 'register'){
                    //     $timeout(function(){$state.go('agreement',{last:'register'});},500);
                    // }else{
                    //    $timeout(function(){$state.go('setpassword',{phonevalidType:$stateParams.phonevalidType});},500); 
                    // }
                    
                // }else{$scope.logStatus = "验证码错误";}
                var verifyPromise =  User.verifySMS({mobile:Verify.Phone,smsType:1,smsCode:Verify.Code});
                verifyPromise.then(function(data){
                    if(data.results==0){
                        $scope.logStatus = "验证成功";
                        Storage.set('USERNAME',Verify.Phone);
                        if($stateParams.phonevalidType == 'register'){
                            $state.go('agreement',{last:'register'});
                        }
                        else if ($stateParams.phonevalidType == 'wechat'){
                            if (isregisted == true)
                            {
                              User.setOpenId({phoneNo:Verify.Phone,openId:Storage.get('openid')}).then(function(data){
                                  if(data.results == "success!")
                                  {
                                    User.setMessageOpenId({type:2,userId:tempuserId,openId:Storage.get('messageopenid')}).then(function(res){
                                        console.log("setopenid");
                                    },function(){
                                        console.log("连接超时！");
                                    })
                                    $ionicPopup.show({   
                                         title: '微信账号绑定手机账号成功，您的初试密码是123456，是否重置密码？',
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
                                                    $state.go('setpassword',{phonevalidType:"reset"})
                                                }
                                           },
                                           ]
                                    })
                                  }
                              },function(){
                                  $scope.logStatus = "连接超时！";
                              })
                            }
                            else
                            {
                              $state.go('agreement',{last:'register'});
                            }
                        }
                        else{
                            $state.go('setpassword',{phonevalidType:$stateParams.phonevalidType});
                        }
                    }else{
                        $scope.logStatus = data.mesg;
                        return;
                    }
                },function(){
                    $scope.logStatus = "连接超时！";
                })
            }
            else{$scope.logStatus="手机号验证失败！";}
      
     
    
        
        }
        else{$scope.logStatus = "请输入完整信息！";}
  }

 
  
}])




//设置密码  --PXY 
.controller('setPasswordCtrl', ['$scope','$state','$rootScope' ,'$timeout' ,'Storage','$stateParams','User','$q','$http','jmapi',function($scope,$state,$rootScope,$timeout,Storage,$stateParams,User,$q,$http,jmapi) {
    //$scope.barwidth="width:0%";
    $scope.BackMain = function(){
        $state.go('signin');
    }
    var setPassState=$stateParams.phonevalidType;
    if(setPassState=='reset'){
        $scope.headerText="重置密码";
        $scope.buttonText="确认修改";
    }else{
        $scope.headerText="设置密码";
        $scope.buttonText="下一步";
    }
    $scope.setPassword={newPass:"" , confirm:""};


    $scope.resetPassword=function(setPassword){
        $scope.logStatus='';
        if((setPassword.newPass!="") && (setPassword.confirm!="")){
            if(setPassword.newPass == setPassword.confirm){
                // var phone = $stateParams.phoneNumber;
                // console.log(phone);
                //如果是注册
                 if(setPassword.newPass.length<6){  ///^(\d+\w+[*/+]*){6,12}$/   1.输入的密码必须有数字和字母同时组成，可含特殊字符，6-12位； 
                    $scope.logStatus ="密码太短了！";

                }else{
                     if(setPassState=='register' || setPassState=='wechat'){
                      //结果分为连接超时或者注册成功
                      $rootScope.password=setPassword.newPass;
                      User.register({phoneNo:Storage.get('USERNAME'),password:setPassword.newPass,role:"patient"}).then(function(data){
                          console.log(data);
                          if(data.results==0){
                            // alert(JSON.stringify(data))
                              var patientId = data.userNo;
                              Storage.set('UID',patientId);
                              
                              jmapi.users(patientId);
                              $q.all([
                                $http({
                                    method  : 'POST',
                                    url     : 'http://patientdiscuss.haihonghospitalmanagement.com/member.php?mod=register&mobile=2&handlekey=registerform&inajax=1',
                                    params    :{
                                        'regsubmit':'yes',
                                        'formhash':'',
                                        'username':patientId,
                                        'password':patientId,
                                        'password2':patientId,
                                        'email':patientId+'@bme319.com'
                                    },  // pass in data as strings
                                    headers : {
                                        'Content-Type': 'application/x-www-form-urlencoded',
                                        'Accept':'application/xml, text/xml, */*'
                                    }  // set the headers so angular passing info as form data (not request payload)
                                }).success(function(data) {
                                    // console.log(data);
                                }),
                                User.updateAgree({userId:patientId,agreement:"0"}).then(function(data){

                                },function(err){
                                    // console.log(err);

                                }),
                                User.setOpenId({phoneNo:Storage.get('USERNAME'),openId:Storage.get('openid')}).then(function(data){

                                },function(err){
                                    // console.log(err);

                                }),
                                User.setMessageOpenId({type:2,userId:patientId,openId:Storage.get('messageopenid')}).then(function(res){
                                    console.log("setopenid");
                                },function(){
                                    console.log("连接超时！");
                                })
                              ]).then(function(){
                                  $scope.logStatus ="恭喜您注册成功！";
                                  $timeout(function(){$state.go('signin')},1500);
                              })
                          }
                      },function(){
                          $ionicLoading.show({
                              template: '注册失败',
                              duration:1000
                          });
                          $scope.logStatus = "连接超时！";
                      });
                    }else if(setPassState == 'reset'){
                  //如果是重置密码
                  //结果分为连接超时或者修改成功
                      var codePromise = User.changePassword({phoneNo:Storage.get('USERNAME'),password:setPassword.newPass});
                      codePromise.then(function(data){
                          if(data.results==0){
                              // Storage.set('USERNAME',phone);
                              $scope.logStatus ="重置密码成功！";
                              $timeout(function(){$state.go('signin');} , 500);
                          }else{
                              $scope.logStatus =  "该账户不存在！";
                          }
                          
                      },function(){
                          $scope.logStatus = "连接超时！";
                      })
                      
            
                  }
                }
               
            }else{
            $scope.logStatus="两次输入的密码不一致";
            }
        }else{
            $scope.logStatus="请输入两遍新密码";
        }
    }
}])


//个人信息--PXY
.controller('userdetailCtrl',['$http','$stateParams','$scope','$state','$ionicHistory','$timeout' ,'Storage', '$ionicPopup','$ionicLoading','$ionicPopover','Dict','Patient', 'VitalSign','$filter','Task','User','jmapi',function($http,$stateParams,$scope,$state,$ionicHistory,$timeout,Storage, $ionicPopup,$ionicLoading, $ionicPopover,Dict,Patient, VitalSign,$filter,Task,User,jmapi){
    $scope.User = 
    {
      "userId": null,
      "name": null,
      "gender": null,
      "bloodType": null,
      "hypertension": null,
      "class": null,
      "class_info": null,
      "height": null,
      "weight": null,
      "birthday": null,
      "IDNo": null,
      "allergic":null,
      "operationTime":null,
      "lastVisit":{"time":null,
      "hospital":null,
      "diagnosis":null}
      
    };
    $scope.$on('$ionicView.enter', function() {
        var back = $stateParams.last;
        // console.log(back);
        if(back=='mine'||back=='tasklist'){
            $scope.CanBack = true;
        }
        else{
            $scope.CanBack = false;}

        $scope.showProgress = false;
        $scope.showSurgicalTime = false;
        $scope.Diseases = "";
        $scope.DiseaseDetails = "";
        $scope.timename = "";
        if(back == 'register'||back=='implement'){
            $scope.canEdit = true;
            Dict.getDiseaseType({category:'patient_class'}).then(function(data){
                $scope.Diseases = data.results[0].content
                $scope.Diseases.push($scope.Diseases[0])
                $scope.Diseases.shift()
                },function(err){
                console.log(err);
              });
        }else if(back == 'mine'){
            $scope.canEdit = false;
        // patientId = Storage.get('UID');
        // var patientId = "U201702080016"
            initialPatient();
        }else if(back == 'tasklist'){
            $scope.canEdit = true;
            initialPatient();
        }

    });


  $scope.Goback = function(){
        if($stateParams.last == 'tasklist'){
            $state.go('tab.tasklist');
        }else if($scope.canEdit==true){
            $scope.canEdit = false;
        }else{
            $ionicHistory.goBack();
        }

    }

  $scope.Genders =
  [
    {Name:"男",Type:1},
    {Name:"女",Type:2}
  ]

  $scope.BloodTypes =
  [
    {Name:"A型",Type:1},
    {Name:"B型",Type:2},
    {Name:"AB型",Type:3},
    {Name:"O型",Type:4},
    {Name:"不确定",Type:5}
  ]

  $scope.Hypers =
  [
    {Name:"是",Type:1},
    {Name:"否",Type:2}
  ]

  //从字典中搜索选中的对象。
  var searchObj = function(code,array){
      for (var i = 0; i < array.length; i++) {
        if(array[i].Type == code || array[i].type == code || array[i].code == code) return array[i];
      };
      return "未填写";
  }

  $scope.getDiseaseDetail = function(Disease) {
    if (Disease.typeName == "肾移植")
    {
      $scope.showProgress = false
      $scope.showSurgicalTime = true
      $scope.timename = "手术日期"
    }
    else if (Disease.typeName == "血透")
    {
      $scope.showProgress = false
      $scope.showSurgicalTime = true
      $scope.timename = "插管日期"
    }
    else if (Disease.typeName == "腹透")
    {
      $scope.showProgress = false
      $scope.showSurgicalTime = true
      $scope.timename = "开始日期"
    }
    else if (Disease.typeName == "ckd5期未透析")
    {
      $scope.showProgress = false
      $scope.showSurgicalTime = false
    }
    else
    {
      $scope.showProgress = true
      $scope.showSurgicalTime = false
      $scope.DiseaseDetails = Disease.details
    }
  }



  $scope.edit = function(){
        $scope.canEdit = true;
  }


  var initialPatient = function(){
        Patient.getPatientDetail({userId: Storage.get('UID')}).then(function(data){

                if (data.results != null){
                    console.log('执行查询');
                    console.log(data.results);
                    $scope.User =data.results;

                    // $scope.User.userId = data.results.userId
                    // $scope.User.name = data.results.name
                    // $scope.User.gender = data.results.gender
                    // $scope.User.bloodType = data.results.bloodType
                    // $scope.User.hypertension = data.results.hypertension
                    // $scope.User.class = data.results.class
                    // $scope.User.class_info = data.results.class_info
                    // $scope.User.height = data.results.height
                    // $scope.User.birthday = data.results.birthday
                    // $scope.User.IDNo = data.results.IDNo
                    // $scope.User.allergic = data.results.allergic||"无"

                    // $scope.User.operationTime = data.results.operationTime
                    // console.log($scope.User.lastVisit.time);
                    // $scope.User.lastVisit= data.results.lastVisit
                    // $scope.User.lastVisit.hospital = data.results.lastVisit.hospital
                    // $scope.User.lastVisit.diagnosis = data.results.lastVisit.diagnosis
                }
                if ($scope.User.gender != null){
                    $scope.User.gender = searchObj($scope.User.gender,$scope.Genders)
                }
                if ($scope.User.bloodType != null){
                    $scope.User.bloodType = searchObj($scope.User.bloodType,$scope.BloodTypes)
                }
                if ($scope.User.hypertension != null){
                    $scope.User.hypertension = searchObj($scope.User.hypertension,$scope.Hypers)
                }
                // if ($scope.User.birthday != null){
                //     $scope.User.birthday = $scope.User.birthday.substr(0,10)
                // }
                // if ($scope.User.operationTime != null){
                //     $scope.User.operationTime = $scope.User.operationTime.substr(0,10)
                // }
                // if ($scope.User.lastVisit.time != null){
                //     $scope.User.lastVisit.time = $scope.User.lastVisit.time.substr(0,10);
                // }
                VitalSign.getVitalSigns({userId:Storage.get('UID'), type: "Weight"}).then(function(data){
                    if(data.results.length){
                        var n = data.results.length - 1
                        var m = data.results[n].data.length - 1
                        if(data.results[n].data[m]){
                            $scope.User.weight = data.results[n].data[m] ? data.results[n].data[m].value:"";
                            // console.log($scope.BasicInfo)
                        }
                    }
                    
                    
                },function(err){
                        console.log(err);
                });
                Dict.getDiseaseType({category:'patient_class'}).then(function(data){
                    $scope.Diseases = data.results[0].content
                    $scope.Diseases.push($scope.Diseases[0])
                    $scope.Diseases.shift()
                    if ($scope.User.class != null){
                        $scope.User.class = searchObj($scope.User.class,$scope.Diseases)
                        if ($scope.User.class.typeName == "血透"){
                            $scope.showProgress = false
                            $scope.showSurgicalTime = true
                            $scope.timename = "插管日期"
                        }
                        else if ($scope.User.class.typeName == "肾移植"){
                            $scope.showProgress = false
                            $scope.showSurgicalTime = true
                            $scope.timename = "手术日期"
                        }
                        else if ($scope.User.class.typeName == "腹透"){
                            $scope.showProgress = false
                            $scope.showSurgicalTime = true
                            $scope.timename = "开始日期"
                        }
                        else if ($scope.User.class.typeName == "ckd5期未透析"){
                            $scope.showProgress = false
                            $scope.showSurgicalTime = false
                        }
                        else{
                            $scope.showProgress = true
                            $scope.showSurgicalTime = false
                            $scope.DiseaseDetails = $scope.User.class.details
                            $scope.User.class_info = searchObj($scope.User.class_info[0],$scope.DiseaseDetails)              
                        }
                    }
                        // console.log($scope.Diseases)
                },function(err){
                    console.log(err);
                });
                console.log($scope.User)
            },function(err){
                console.log(err);
          });
    }    

  
   
 

  // --------datepicker设置----------------
  var  monthList=["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"];
  var weekDaysList=["日","一","二","三","四","五","六"];
  
  // --------诊断日期----------------
  var DiagnosisdatePickerCallback = function (val) {
    if (typeof(val) === 'undefined') {
      console.log('No date selected');
    } else {
      $scope.datepickerObject1.inputDate=val;
      var dd=val.getDate();
      var mm=val.getMonth()+1;
      var yyyy=val.getFullYear();
      var d=dd<10?('0'+String(dd)):String(dd);
      var m=mm<10?('0'+String(mm)):String(mm);
      //日期的存储格式和显示格式不一致
      $scope.User.lastVisit.time=yyyy+'-'+m+'-'+d;
    }
  };
  
  $scope.datepickerObject1 = {
    titleLabel: '诊断日期',  //Optional
    todayLabel: '今天',  //Optional
    closeLabel: '取消',  //Optional
    setLabel: '设置',  //Optional
    setButtonType : 'button-assertive',  //Optional
    todayButtonType : 'button-assertive',  //Optional
    closeButtonType : 'button-assertive',  //Optional
    inputDate: new Date(),    //Optional
    mondayFirst: false,    //Optional
    //disabledDates: disabledDates, //Optional
    weekDaysList: weekDaysList,   //Optional
    monthList: monthList, //Optional
    templateType: 'popup', //Optional
    showTodayButton: 'false', //Optional
    modalHeaderColor: 'bar-positive', //Optional
    modalFooterColor: 'bar-positive', //Optional
    from: new Date(1900, 1, 1),   //Optional
    to: new Date(),    //Optional
    callback: function (val) {    //Mandatory
      DiagnosisdatePickerCallback(val);
    }
  };  
  // --------手术日期----------------
  var OperationdatePickerCallback = function (val) {
    if (typeof(val) === 'undefined') {
      console.log('No date selected');
    } else {
      $scope.datepickerObject2.inputDate=val;
      var dd=val.getDate();
      var mm=val.getMonth()+1;
      var yyyy=val.getFullYear();
      var d=dd<10?('0'+String(dd)):String(dd);
      var m=mm<10?('0'+String(mm)):String(mm);
      //日期的存储格式和显示格式不一致
      $scope.User.operationTime=yyyy+'-'+m+'-'+d;
    }
  };
  $scope.datepickerObject2 = {
    titleLabel: '手术日期',  //Optional
    todayLabel: '今天',  //Optional
    closeLabel: '取消',  //Optional
    setLabel: '设置',  //Optional
    setButtonType : 'button-assertive',  //Optional
    todayButtonType : 'button-assertive',  //Optional
    closeButtonType : 'button-assertive',  //Optional
    mondayFirst: false,    //Optional
    //disabledDates: disabledDates, //Optional
    weekDaysList: weekDaysList,   //Optional
    monthList: monthList, //Optional
    templateType: 'popup', //Optional
    showTodayButton: 'false', //Optional
    modalHeaderColor: 'bar-positive', //Optional
    modalFooterColor: 'bar-positive', //Optional
    from: new Date(1900, 1, 1),   //Optional
    to: new Date(),    //Optional
    callback: function (val) {    //Mandatory
      OperationdatePickerCallback(val);
    }
  };  
  // --------出生日期----------------
  var BirthdatePickerCallback = function (val) {
    if (typeof(val) === 'undefined') {
      console.log('No date selected');
    } else {
      $scope.datepickerObject3.inputDate=val;
      var dd=val.getDate();
      var mm=val.getMonth()+1;
      var yyyy=val.getFullYear();
      var d=dd<10?('0'+String(dd)):String(dd);
      var m=mm<10?('0'+String(mm)):String(mm);
      //日期的存储格式和显示格式不一致
      $scope.User.birthday=yyyy+'-'+m+'-'+d;
    }
  };
  $scope.datepickerObject3 = {
    titleLabel: '出生日期',  //Optional
    todayLabel: '今天',  //Optional
    closeLabel: '取消',  //Optional
    setLabel: '设置',  //Optional
    setButtonType : 'button-assertive',  //Optional
    todayButtonType : 'button-assertive',  //Optional
    closeButtonType : 'button-assertive',  //Optional
    mondayFirst: false,    //Optional
    //disabledDates: disabledDates, //Optional
    weekDaysList: weekDaysList,   //Optional
    monthList: monthList, //Optional
    templateType: 'popup', //Optional
    showTodayButton: 'false', //Optional
    modalHeaderColor: 'bar-positive', //Optional
    modalFooterColor: 'bar-positive', //Optional
    from: new Date(1900, 1, 1),   //Optional
    to: new Date(),    //Optional
    callback: function (val) {    //Mandatory
      BirthdatePickerCallback(val);
    }
  };  
  // --------datepicker设置结束----------------


   //////////////////////////////////////////////////////////////////////////
      // $scope.change = function(d)
      // {
      //   console.log(d);
      // }




     var MonthInterval = function(usertime){
        
        interval = new Date().getTime() - Date.parse(usertime);
        return(Math.floor(interval/(24*3600*1000*30)));
    }

    var distinctTask = function(kidneyType,kidneyTime,kidneyDetail){
        var sortNo = 1;
        console.log(kidneyType);
        console.log(kidneyDetail);
        // if(kidneyTime){
        //     kidneyTime = kidneyTime.substr(0,10);
        // }
        if(kidneyDetail){
            var kidneyDetail = kidneyDetail[0];
        }
        switch(kidneyType)
        {
            case "class_1":
                //肾移植
                if(kidneyTime!=undefined && kidneyTime!=null && kidneyTime!=""){
                    var month = MonthInterval(kidneyTime);
                    console.log("month"+month);
                    if(month>=0 && month<3){
                        sortNo = 1;//0-3月
                    }else if(month>=3 && month<6){
                        sortNo = 2; //3-6个月
                    }else if(month>=6 && month<36){
                        sortNo = 3; //6个月到3年
                    }else if(month>=36){
                        sortNo = 4;//对应肾移植大于3年
                    }

                }
                else{
                    sortNo = 4;
                }
                break;
            case "class_2": case "class_3"://慢性1-4期
                if(kidneyDetail!=undefined && kidneyDetail!=null && kidneyDetail!=""){
                    if(kidneyDetail=="stage_5"){//"疾病活跃期"
                        sortNo = 5;
                    }else if(kidneyDetail=="stage_6"){//"稳定期
                        sortNo = 6;
                    }else if(kidneyDetail == "stage_7"){//>3年
                        sortNo = 7;

                    }
                }
                else{
                    sortNo = 6;
                }
                break;
                
            case "class_4"://慢性5期
                sortNo = 8;
                break;
            case "class_5"://血透
                sortNo = 9;
                break;

            case "class_6"://腹透
                if(kidneyTime!=undefined && kidneyTime!=null && kidneyTime!=""){
                    var month = MonthInterval(kidneyTime);
                    console.log("month"+month);
                    if(month<6){
                        sortNo = 10;
                    }
                    else{
                        sortNo = 11;
                    }
                }
                break;


        }
        return sortNo;

    }
    $scope.infoSetup = function(){
        var back = $stateParams.last;
        if (back == 'signin'||back == 'implement'){
          // alert('register')
            $scope.User.gender = $scope.User.gender.Type;
            $scope.User.bloodType = $scope.User.bloodType.Type;
            $scope.User.hypertension = $scope.User.hypertension.Type;
            if ($scope.User.class.typeName == "ckd5期未透析"){
                $scope.User.class_info == null;
            }
            else if ($scope.User.class_info != null){
                $scope.User.class_info = $scope.User.class_info.code;
            }
            $scope.User.class = $scope.User.class.type;

            var patientId = Storage.get('UID');
            $scope.User.userId = patientId;
            // console.log(patientId);
            Patient.newPatientDetail($scope.User).then(function(data){

                // console.log(data);
                var task = distinctTask(data.results.class,data.results.operationTime,data.results.class_info);
                Task.insertTask({userId:patientId,sortNo:task}).then(function(data){
                    if(data.result=="插入成功"){
                        if($scope.User.weight){
                            var now = new Date()
                            now =  $filter("date")(now, "yyyy-MM-dd HH:mm:ss")
                            VitalSign.insertVitalSign({patientId:patientId, type: "Weight",code: "Weight_1", date:now.substr(0,10),datatime:now,datavalue:$scope.User.weight,unit:"kg"}).then(function(data){
                                // $scope.User.weight = data.results;
                                // console.log($scope.User);
                                $state.go('tab.tasklist');
                            },function(err){
                                $ionicLoading.show({
                                template: '注册失败',
                                duration:1000
                                });
                            });
                        }else{
                            $state.go('tab.tasklist');
                        }
                    }
                },function(err){
                    $ionicLoading.show({
                        template: '注册失败',
                        duration:1000
                    });
                    // console.log("插入任务" + err);
                });
            },function(err){
                $ionicLoading.show({
                    template: '注册失败',
                    duration:1000
                });
                console.log(err);
            });
            
            
        }else{//非注册用户
            $ionicPopup.show({
                template: '肾病类型及高血压等诊断信息的修改会影响肾病管理方案，建议在医生指导下修改，请谨慎！',
                title: '保存确认',
                      //subTitle: '2',
                scope: $scope,
                buttons: [
                { 
                    text: '取消',
                    type: 'button-small',
                    onTap: function(e){}
                },
                {
                    text: '确定',
                    type: 'button-small button-positive ',
                    onTap: function(e) {
                        $scope.User.gender = $scope.User.gender.Type
                        $scope.User.bloodType = $scope.User.bloodType.Type
                        $scope.User.hypertension = $scope.User.hypertension.Type
                        if ($scope.User.class == "ckd5期未透析"){
                            $scope.User.class_info == null
                        }
                        else if ($scope.User.class_info != null){
                            $scope.User.class_info = $scope.User.class_info.code;
                                  // $scope.User.class_info = $scope.User.class_info.name;

                        }
                        $scope.User.class = $scope.User.class.type;
                              // $scope.User.class = $scope.User.class.typeName;
                              // console.log($scope.User);
                        Patient.editPatientDetail($scope.User).then(function(data){
                            if(data.result=="修改成功"){
                                console.log(data.results);
                                var patientId = Storage.get('UID');
                                var task = distinctTask(data.results.class,data.results.operationTime,data.results.class_info);
                                Task.insertTask({userId:patientId,sortNo:task}).then(function(data){
                                    if(data.result=="插入成功"){
                                        if($scope.User.weight){
                                            var now = new Date()
                                            now =  $filter("date")(now, "yyyy-MM-dd HH:mm:ss");
                                            VitalSign.insertVitalSign({patientId:patientId, type: "Weight",code: "Weight_1", date:now.substr(0,10),datatime:now,datavalue:$scope.User.weight,unit:"kg"}).then(
                                                function(data){
                                                    // $scope.User.weight = data.results;
                                                    if(back == 'mine'){
                                                        $scope.canEdit = false;
                                                        initialPatient();
                                                    }else if(back == 'tasklist'){
                                                        $state.go('tab.tasklist');
                                                    }
                                                
                                                },function(err){
                                                    console.log(err);
                                                }
                                            );
                                        }else{
                                            if(back == 'mine'){
                                                $scope.canEdit = false;
                                                initialPatient();
                                            }else if(back == 'tasklist'){
                                                $state.go('tab.tasklist');
                                            }
                                        }
                                    }
                                },function(err){
                                    console.log("err" + err);
                                });
                            }

                        },function(err){
                            console.log(err);
                        });

                    }
                }
                ]
            });
                    

        }

    

    }


  
}])

//主页面--PXY
.controller('GoToMessageCtrl', ['$scope','$timeout','$state', '$location','wechat','$window','Patient','Storage','$ionicPopup','$window','$interval','News','$ionicHistory',function($scope, $timeout,$state,$location,wechat,$window,Patient,Storage,$ionicPopup,$window,$interval,News,$ionicHistory) {
  // $scope.QRscan = function(){
  //   // alert(1)
  //   var config = "";
  //   var path = $location.absUrl().split('#')[0]
  //   //var path = "http://patient.haihonghospitalmanagement.com/?code=" + Storage.get('code');
  //   wechat.settingConfig({url:path}).then(function(data){
  //     // alert(data.results.timestamp)
  //     config = data.results;
  //     config.jsApiList = ['scanQRCode']
  //     // alert(config.jsApiList)
  //     // alert(config.debug)
  //     console.log(angular.toJson(config))
  //     wx.config({
  //       debug:false,
  //       appId:config.appId,
  //       timestamp:config.timestamp,
  //       nonceStr:config.nonceStr,
  //       signature:config.signature,
  //       jsApiList:config.jsApiList
  //     })
  //     wx.ready(function(){
  //       wx.checkJsApi({
  //           jsApiList: ['scanQRCode'],
  //           success: function(res) {
  //               wx.scanQRCode({
  //                 needResult:0,
  //                 scanType: ['qrCode','barCode'],
  //                 success: function(res) {
  //                  //  var result = res.resultStr;
  //                  //  Patient.bindingMyDoctor({"patientId":Storage.get("UID"),"doctorId":result}).then(function(res){
  //                  //    if(res.result=="修改成功"){
  //                  //      $ionicPopup.alert({
  //                  //       title: '绑定成功'
  //                  //      }).then(function(res) {
  //                  //        if ($location.absUrl().indexOf('myDoctors') != -1)
  //                  //        {
  //                  //          $window.location.reload();
  //                  //        }
  //                  //        else
  //                  //        {
  //                  //          $state.go('tab.myDoctors');
  //                  //        }
  //                  //      });
  //                  //    }else if(res.result=="不存在的医生ID！"){
  //                  //      $ionicPopup.alert({
  //                  //       title: '不存在的医生ID！'
  //                  //      })
  //                  //    }
  //                  // },function(){                    
  //                  // })
  //                 }
  //               })
  //           }
  //       });
  //     })
  //     wx.error(function(res){
  //       alert(res.errMsg)
  //     })

  //   },function(err){

  //   })
  // }

  $scope.HasUnreadMessages  = false;
    $scope.GoToMessage = function(){
        Storage.set('messageBackState',$ionicHistory.currentView().stateId);
        $state.go('messages');
    }
    $scope.gotomine=function(){
      $state.go('tab.mine');
    }
    $scope.gotomyDoctors=function(){
      Patient.getPatientDetail({userId:Storage.get('UID')}).then(function(data){
        if (data.results == null)
        {
          $ionicPopup.show({
                template: '您的个人信息尚未补全，请完善个人信息后体验咨询服务！',
                title: '请完善个人信息',
                scope: $scope,
                buttons: [
                { 
                    text: '取消',
                    type: 'button-small',
                    onTap: function(e){
                      $state.go('tab.tasklist');
                    }
                },
                {
                    text: '确定',
                    type: 'button-small button-positive ',
                    onTap: function(e) {
                      $state.go('userdetail',{last:'implement'});
                    }
                }
                ]
            });
        }
        else
        {
          $state.go('tab.myDoctors')
        }
      },function(err){
          console.log(err);
      })
    }
    var RefreshUnread;
    var GetUnread = function(){
        // console.log(new Date());
        News.getNewsByReadOrNot({userId:Storage.get('UID'),readOrNot:0}).then(//
            function(data){
                if(data.results.length){
                    $scope.HasUnreadMessages = true;
                    // console.log($scope.HasUnreadMessages);
                }
            },function(err){
                    console.log(err);
            });
    }
    GetUnread();
    if(Storage.get('isSignIn')=='Yes'){
      RefreshUnread = $interval(GetUnread,2000);
    }

}])


  


//任务列表--GL
.controller('tasklistCtrl', ['$scope','$timeout','$state','$cordovaBarcodeScanner','Storage','$ionicHistory', '$ionicPopup', '$ionicModal', 'Compliance', '$window', 'Task', 'Patient', 'VitalSign', function($scope, $timeout,$state,$cordovaBarcodeScanner,Storage,$ionicHistory,$ionicPopup,$ionicModal,Compliance, $window, Task, Patient, VitalSign) {
  
  //初始化
    // $scope.barwidth="width:0%";
    var UserId = Storage.get('UID');
    //UserId = "Test13"; //

    $scope.Tasks = {}; //任务
    $scope.HemoBtnFlag = false; //血透排班设置标志    
    var OverTimeTaks = [];
    var index = 0;
    var dateNowStr = ChangeTimeForm(new Date()); //方便设定当前日期进行调试，或是之后从数据库获取当前日期
    $scope.$on('$ionicView.enter', function() {      
        GetTasks();      
    });  
  
  //判断是否需要修改任务时间
   function IfTaskOverTime(startTime, frequencyTimes, unit, times)
   {
        var res = "";
        var days = GetDifDays(startTime, dateNowStr);
        if((unit == '年') && (times == 2))//一年2次
        {
           unit = "月";
           frequencyTimes =  6;
        }
        var tbl = {"周": 7, "月": 30, "年": 365};
        var someDays = tbl[unit] * frequencyTimes;
        if(days < 0)
        {
            while (days < -someDays) //若长时间未使用APP使日期错过了下次任务，则再往后延
            {
                startTime = ChangeTimeForm(SetNextTime(startTime, frequencyTimes, unit, times));
                days = GetDifDays(startTime, dateNowStr);
            }
            res = startTime;
        }        
        //console.log(res);   　　   
        return res;
   }
   //IfTaskOverTime("2017-04-05", 1, "周",1 );

  //当前日期与默认日期比较，自动修改填写状态
   function CompDateToDefault(task)
   {
      var res = false;
      var freqTimes = task.frequencyTimes;
      var unit = task.frequencyUnits;
      var times = task.frequencyTimes;
      var dateNow = new Date(dateNowStr);
      var dateStart = new Date(task.startTime);
      if(times == 1) //只对周期内1次任务有效
      {
          if(unit == '周')
          {
              var weekDayNow = dateNow.getDay();              
              var days = GetDifDays(task.startTime, dateNowStr);             
              if((weekDayNow >= 1) && (days < 7))//已过周一
              {
                  res = true;
              }
             
          }
          else if(unit == "月")
          {
             var monthNow = dateNow.getMonth();
             var monthStart = dateStart.getMonth();
             if(monthNow == monthStart)
             {
                res = true;
             }
          }
          else //年
          {
             var yearNow = dateNow.getFullYear();
             var yearStart = dateStart.getFullYear();
             if(yearNow == yearStart)
             {
                res = true;
             }
          }
      }
      task.Flag = !res;
   }
   //CompDateToDefault({});

   $scope.CompleteUserdetail = function(){
        $state.go('userdetail',{last:'tasklist'});
    }

  //获取对应任务模板
   function GetTasks(TaskCode)
   {
    var promise =  Task.getUserTask({userId:UserId});
    promise.then(function(data){
        if(data.result)
        {
            $scope.unCompleted = false;
            $scope.Tasks = data.result.task;
            //console.log($scope.Tasks);
            HandleTasks();
        }else{
            $scope.unCompleted = true;
        }
     },function(){

     })
   }

  //获取模板后进行处理
    function HandleTasks()
    {
        $scope.Tasks.Other = []; 
        $scope.Tasks.Hemo = [];    
        for (var i=0;i<$scope.Tasks.length;i++)
        {
           var task = $scope.Tasks[i];
           //console.log(task);
           if(task.type == 'Measure')
           {   
              InitialEveTask(task);        
           }
           else //其他任务
           {                   
              InitialOtherTask(task);                                                  
           } 
        }
       //console.log($scope.Tasks);
       $scope.Tasks.Other.sort(SortByTime); //按时间先后排序
       for(var i=0; i<$scope.Tasks.Other.length;i++)
       {
         if($scope.Tasks.Other[i].frequencyTimes == 0)//只执行一次的任务置顶
         {
            var item = $scope.Tasks.Other[i];
            $scope.Tasks.Other.splice(i, 1);
            $scope.Tasks.Other.unshift(item);
         }
       }
       GetDoneTask();
     //console.log($scope.Tasks);
    }

  //初始化每日任务
    function InitialEveTask(task)
    {
        $scope.Tasks.Measure = task.details;
        for(var i=0;i<$scope.Tasks.Measure.length;i++)
        {
            $scope.Tasks.Measure[i].type = 'Measure';
            if($scope.Tasks.Measure[i].frequencyUnits == '天')//限定每日完成的任务
            {
                $scope.Tasks.Measure[i].Name = NameMatch($scope.Tasks.Measure[i].code);
                $scope.Tasks.Measure[i].Unit = UnitMatch($scope.Tasks.Measure[i].code);
                $scope.Tasks.Measure[i].Range = RangeMatch($scope.Tasks.Measure[i].code);
                $scope.Tasks.Measure[i].Freq = $scope.Tasks.Measure[i].frequencyTimes + $scope.Tasks.Measure[i].frequencyUnits +$scope.Tasks.Measure[i].times + $scope.Tasks.Measure[i].timesUnits;
                $scope.Tasks.Measure[i].Flag = false;  
                if($scope.Tasks.Measure[i].times > 1)
                {
                    $scope.Tasks.Measure[i].TimesFlag = true;
                    $scope.Tasks.Measure[i].Progress = "0";                     
                }   
                else
                {
                    $scope.Tasks.Measure[i].TimesFlag = false;
                }                 
            }
            else //测量中的非每日任务 加入Other并从测量中去除（即血管通路情况）
            {
                var newTask = $scope.Tasks.Measure[i];
                HandlOtherTask(newTask, task);                 
                $scope.Tasks.Measure.splice(i, 1);
            }                        
        }
    }  

  //初始化血透任务
    function InitialHemoTask(task)
    {
        task.type = 'ReturnVisit';
        if(task.content == "") //未设定排班时间                  
        {
            $scope.HemoBtnFlag = true;
        }
        else
        {
            task.DateStr = task.content;
            $scope.HemoBtnFlag = false;
            var StartArry = task.DateStr.split('+')[0].split(',');
            var EndArry = [];
            task.Flag = false;
            task.Progress = "0";
            if(task.DateStr.split('+')[2])
            {
               task.endTime = task.DateStr.split('+')[2];
               EndArry = task.DateStr.split('+')[2].split(',');
               task.Progress = (Math.round(EndArry.length/task.times * 10000)/100).toFixed(2) + '%'; //进度条
               if(EndArry.length == task.times)
               {
                  task.Flag = true;
               }
            }
            else
            {
               task.endTime = "";
            }
            //判定是否为新的一周以更新任务日期
            var days = GetDifDays(dateNowStr, StartArry[0]);
            if(days >= 7)
            {
                task.Flag = false;
                while(days >= 7)
                {
                    for (var i=0;i<StartArry.length;i++)
                    { 
                       StartArry[i] = ChangeTimeForm(SetNextTime(StartArry[i], task.frequencyTimes, task.frequencyUnits, task.times));                 
                    }
                    days = GetDifDays(dateNowStr, StartArry[0]);
                }
                task.DateStr = GetHemoStr(StartArry, task.DateStr.split('+')[1], []); 
                //修改数据库
                item = {
                          "userId":UserId, 
                          "type":task.type, 
                          "code":task.code, 
                          "instruction":task.instruction, 
                          "content":task.DateStr, 
                          "startTime":"2050-11-02T07:58:51.718Z", 
                          "endTime":"2050-11-02T07:58:51.718Z", 
                          "times":task.times,
                          "timesUnits":task.timesUnits, 
                          "frequencyTimes":task.frequencyTimes, 
                          "frequencyUnits":task.frequencyUnits
                        };     
               UpdateUserTask(item);  //更改任务下次执行时间
            }
            task.Name = "血透";
            task.startTime = task.DateStr.split('+')[0];
            $scope.Tasks.Hemo.push(task);  
            //console.log( $scope.Tasks.Hemo);
        }
    }
  
  //初始化其他任务
    function InitialOtherTask(task)
    {
        for (var i=0;i<task.details.length;i++)
        {
            var newTask = task.details[i];
            if((task.type == "ReturnVisit") && (newTask.code == "stage_9"))//血透排班
            {
               InitialHemoTask(newTask);
            }               
            else
            {   
               HandlOtherTask(newTask, task);            
            }
        } 
        if(OverTimeTaks.length != 0)
        {
            ChangeOverTime();//过期任务新任务时间插入数据库   
        }  
    }

  //处理其他任务详细
  function HandlOtherTask(newTask, task)
  {
      newTask.Flag = false;   
      newTask.DoneFlag = false;          
      newTask.type = task.type;
      newTask.Name = NameMatch(newTask.type)
      if(newTask.type == 'Measure') //血管通路情况
      {
         newTask.Name = NameMatch(newTask.code);
      }
      newTask.Freq = newTask.frequencyTimes + newTask.frequencyUnits + newTask.times + newTask.timesUnits;
      if ((newTask.type == "LabTest") && (newTask.code == "LabTest_9"))
      {
          newTask.Freq = "初次评估";
      }
      if(newTask.endTime != '2050-11-02T07:58:51.718Z') //显示已执行时间              
      {
         newTask.Flag = true;
         newTask.DoneFlag = true;
         newTask.endTime = newTask.endTime.substr(0, 10);
      }    
      
      var TimeCompare = IfTaskOverTime(newTask.startTime, newTask.frequencyTimes, newTask.frequencyUnits, newTask.times); //错过任务执行时间段，后延
      if (TimeCompare != '')
      {
         newTask.startTime = TimeCompare;
         newTask.Flag = false; 
         OverTimeTaks.push(newTask);
      } 
      else
      {
         var days = GetDifDays(newTask.startTime, dateNowStr);
         if(days <= 0)
         {
           newTask.Flag = false;
         }
         else
         {
           if(newTask.Flag) //到默认时间修改填写状态
           {
             CompDateToDefault(newTask);
           }                   
         }                 
      }                       
      $scope.Tasks.Other.push(newTask);   
  }

  //批量更新任务
    function ChangeOverTime()
    {   
        var temp = OverTimeTaks[index];
        var task = {
                    "userId":UserId, 
                    "type":temp.type, 
                    "code":temp.code, 
                    "instruction":temp.instruction, 
                    "content":temp.content, 
                    "startTime":temp.startTime, 
                    "endTime":temp.endTime, 
                    "times":temp.times,
                    "timesUnits":temp.timesUnits, 
                    "frequencyTimes":temp.frequencyTimes, 
                    "frequencyUnits":temp.frequencyUnits
                  }; 
        var promise = Task.updateUserTask(task);
         promise.then(function(data){
           if(data.results)
           {
              index = index + 1;
              if (index < OverTimeTaks.length)
              {
                  ChangeOverTime();
              }
           };
         },function(){                    
         })                         
    }
  
  //获取今日已执行任务
    function GetDoneTask()
    {               
         var nowDay = dateNowStr;
         var promise = Compliance.getcompliance({userId:UserId, date:nowDay});
         promise.then(function(data){
           if(data.results)
           {
              for(var i=0;i<data.results.length;i++) 
              {
                AfterDoneTask(data.results[i], "GET");
              }              
           }           
           //console.log(data.results);  
           ChangeLongFir();//修改长周期任务第一次执行时间                    
         },function(){                       
         });
    }   

  //获取今日已执行任务后进行处理(falg用于区分获取还是新插入已执行任务)
    function AfterDoneTask(doneTask, flag)
    {
      //确定任务是否完成，修改显示标志位，获取已填写的数值并在页面显示                      
      var Code = doneTask.code;
      var Description = doneTask.description;                  
      EveTaskDone(doneTask, flag);
      if(flag == "POST")
      {
          if((doneTask.type == 'ReturnVisit') &&(doneTask.code == 'stage_9')) //血透排班
          { 
             $scope.Tasks.Hemo[0].instruction = Description;    
             HemoTaskDone($scope.Tasks.Hemo[0]);                    
          }
          else
          {
              for (var i=0;i<$scope.Tasks.Other.length;i++)
              {
                 var task = $scope.Tasks.Other[i];
                 if(task.code == Code)
                 {               
                    OtherTaskDone(task, Description);                
                    break;
                 }
              }    
          }
       }                           
    }
  
  //每日任务执行后处理
    function EveTaskDone(doneTask, flag)
    {
        var Code = doneTask.code;
        var Description = doneTask.description; 
        var flag1 = false;    
        for (var i=0;i<$scope.Tasks.Measure.length;i++)
        {  
            if($scope.Tasks.Measure[i].code == Code)
             {   
                                     
                $scope.Tasks.Measure[i].instruction = Description;
                flag1 = true;  
                var num = i;
                if($scope.Tasks.Measure[i].times == 1) //每天一次
                {
                    $scope.Tasks.Measure[i].Flag = true;
                }
                else //多次(修改进度条)
                {
                    var ValueArry = Description.split('，');
                    //console.log(ValueArry);
                    if(ValueArry.length == $scope.Tasks.Measure[i].times)
                    {
                        $scope.Tasks.Measure[i].Flag = true;
                        $scope.Tasks.Measure[i].DoneTimes = ValueArry.length;
                    }
                    $scope.Tasks.Measure[i].Progress = (Math.round(ValueArry.length/$scope.Tasks.Measure[i].times * 10000)/100).toFixed(2) + '%';
                }                                    
                break;
             }                      
        }
        if(flag1) //插入体征表
        {
           if((flag == "POST") && (VitalSignTbl[$scope.Tasks.Measure[num].code]))
           {
               var task = $scope.Tasks.Measure[num];
               if(task.code == "BloodPressure")//console.log(task);  
               {
                  var array = Description.split('，')
                  var i = array.length
                  var temp = {
                                "patientId": UserId,
                                "type": VitalSignTbl[task.code].type,
                                "code": VitalSignTbl[task.code].code,
                                "date": dateNowStr,
                                "datatime": new Date(),
                                "datavalue": array[i-1].split('/')[0],
                                "datavalue2": array[i-1].split('/')[1],
                                "unit":task.Unit
                              };
                                     
               } 
               else
               {
                  var array = Description.split('，')
                  var i = array.length
                  var temp = {
                                "patientId": UserId,
                                "type": VitalSignTbl[task.code].type,
                                "code": VitalSignTbl[task.code].code,
                                "date": dateNowStr,
                                "datatime": new Date(),
                                "datavalue": array[i-1],
                                "unit":task.Unit
                              }
                        
               }  
               InsertVitalSign(temp);            
           }                 
        }        
    }

  //其他任务后处理
    function OtherTaskDone(task, Description)
    {      
        var NextTime = "";
        var item;    
        //var instructionStr = task.instruction;//避免修改模板 暂时就让它修改吧
        task.instruction = Description; //用于页面显示
        task.Flag = true;
        task.endTime = task.endTime.substr(0, 10);            
        if(task.endTime != "2050-11-02T07:58:51.718Z") //说明任务已经执行过
        {
                            
            task.DoneFlag = true;                                           
        }
        else
        {
            task.DoneFlag = false;
        }                       
        NextTime = ChangeTimeForm(SetNextTime(task.startTime, task.frequencyTimes, task.frequencyUnits, task.times));
        task.startTime = NextTime;//更改页面显示                                               
        task.endTime = dateNowStr;
        item = {
                    "userId":UserId, 
                    "type":task.type, 
                    "code":task.code, 
                    "instruction":task.instruction, 
                    "content":task.content, 
                    "startTime":NextTime, 
                    "endTime":task.endTime, 
                    "times":task.times,
                    "timesUnits":task.timesUnits, 
                    "frequencyTimes":task.frequencyTimes, 
                    "frequencyUnits":task.frequencyUnits
                };                       
       
       UpdateUserTask(item);  //更改任务下次执行时间                             
    }
  
  //血透任务执行后处理
    function HemoTaskDone(task, flag)
    {
       //console.log(task);
       var dateStr = task.DateStr;
       var StartArry = dateStr.split('+')[0].split(',');
       var Mediean = dateStr.split('+')[1];
       var EndArry = [];
       var content;
       if(dateStr.split('+')[2])
       {
          EndArry = dateStr.split('+')[2].split(',');
       }
       var instructionArry = task.instruction.split('，');
       if(instructionArry.length > EndArry.length) //判断是添加还是修改，修改不加次数
       {
          var newEnd = dateNowStr;
          EndArry.push(newEnd);
          task.Progress = (Math.round(EndArry.length/task.times * 10000)/100).toFixed(2) + '%'; //更新进度条
       }                  
       
        if(EndArry.length == task.times)
        {
            task.Flag = true;
        }
        content =  GetHemoStr(StartArry, Mediean, EndArry);                     
          
        //更新任务完成时间
      
        task.endTime = EndArry.join(",");                                                                
        task.DateStr =  GetHemoStr(StartArry, Mediean, EndArry); 
         
        //更新任务模板
        item = {
                    "userId":UserId, 
                    "type":task.type, 
                    "code":task.code, 
                    "instruction":task.instruction, 
                    "content":task.DateStr, 
                    "startTime":'2050-11-02T07:58:51.718Z', 
                    "endTime":'2050-11-02T07:58:51.718Z', 
                    "times":task.times,
                    "timesUnits":task.timesUnits, 
                    "frequencyTimes":task.frequencyTimes, 
                    "frequencyUnits":task.frequencyUnits
                };  
        UpdateUserTask(item);                                                               
    }
  
  //血透字符串组装
    function GetHemoStr(startArry, mediean, endArry)
    {
        var res = "";
        res = startArry.join(',') +  "+" + mediean;
        if(endArry.length != 0)
        {
           res = res + "+" + endArry.join(",");
        }
        return res;
    }  

  //名称转换
   function NameMatch(name)
   {
     var Tbl = [
                 {Name:'体温', Code:'Temperature'},
                 {Name:'体重', Code:'Weight'},
                 {Name:'血压', Code:'BloodPressure'},
                 {Name:'尿量', Code:'Vol'},
                 {Name:'心率', Code:'HeartRate'},
                 {Name:'复诊', Code:'ReturnVisit'},
                 {Name:'化验', Code:'LabTest'},
                 {Name:'特殊评估', Code:'SpecialEvaluate'},
                 {Name:'血管通路情况', Code:'VascularAccess'},
                 {Name:'腹透', Code:'PeritonealDialysis'},
                 {Name:'超滤量', Code:'cll'},
                 {Name:'浮肿', Code:'ywfz'},
                 {Name:'引流通畅', Code:'yl'}
                ];
      for (var i=0;i<Tbl.length;i++)
      {
         if(Tbl[i].Code == name)
         {
            name = Tbl[i].Name
            break;
         }
      }
      return name;
   }

  //单位匹配
   function UnitMatch(code)
   {
      var Unit = "";
      var Tbl = [
                 {Code:'Temperature', Unit:"摄氏度"},
                 {Code:'Weight', Unit:"kg"},
                 {Code:'BloodPressure', Unit:"mmHg"},
                 {Code:'Vol', Unit:"mL"},
                 {Code:'HeartRate', Unit:"次/分"},
                 {Code:'cll', Unit:"mL"}                
                ];
      for (var i=0;i<Tbl.length;i++)
      {
         if(Tbl[i].Code == code)
         {
            Unit = Tbl[i].Unit
            break;
         }
      }
      return Unit;
   }
  
  //范围匹配
   function RangeMatch(code)
   {
      var res = {};
      var Tbl = [
                 {Code:'Temperature', Min: 35, Max: 42},
                 {Code:'Weight', Min: 0, Max: 300},
                 {Code:'BloodPressure', Min: 0, Max: 250},
                 {Code:'Vol', Min: 0, Max: 5000},
                 {Code:'HeartRate', Min: 30, Max: 200}                
                ];
      for (var i=0;i<Tbl.length;i++)
      {
         if(Tbl[i].Code == code)
         {
            res.Min = Tbl[i].Min;
            res.Max = Tbl[i].Max;
            break;
         }
      }
      return res;
   }

  //时间比较排序
   function SortByTime(a, b)
   {
      var res = 0;
      var strA = a.startTime.substr(0,10).replace(/-/g, '');
      var strB = b.startTime.substr(0,10).replace(/-/g, '');
      if ((!isNaN(strA)) && (!isNaN(strB)))
      {
          res =  parseInt(strA) - parseInt(strB);
      }
      return res;
   }

  //比较时间天数
   function GetDifDays(date1Str, date2Str)
   {
      res = 0;
      var date1 = new Date(date1Str);
      var date2 = new Date(date2Str);
      if((date1 instanceof Date) && (date2 instanceof Date))
      {
         days = date1.getTime() - date2.getTime();
         res = parseInt(days / (1000 * 60 * 60 * 24)); 
      }
      return res;
   }

  //比较下次任务时间与当前时间
   function CompareTime(startTime, frequencyTimes, unit, times)
   {
        var res = {"Flag": false, "Date": ""};
        var date1 = new Date(dateNowStr);
        var date2 = new Date(startTime);
        var days = date2.getTime() - date1.getTime(); 

        while (days < 0) //若长时间未使用APP使日期错过了下次任务，则再往后延
        {
            date2 = SetNextTime(date2.toString(), frequencyTimes, unit, times);
            days = date2.getTime() - date1.getTime(); 
            res.Date = ChangeTimeForm(date2);
        }

    　　    var day = parseInt(days / (1000 * 60 * 60 * 24)); 
            if (day <= 7)
            {
                res.Flag = true;
            }
            return res;
   }
   //CompareTime("2017-06-24", 2, "周", 1);

  //插入任务执行情况    
    function Postcompliance(task)
    {          
         //console.log(task);           
         var promise = Compliance.postcompliance(task);
         promise.then(function(data){
           if(data.results)
           {
              //console.log(data.results);
              AfterDoneTask(data.results, "POST"); 
           }                        
         },function(){                        
         });
    }
   
  //插入体征数据
   function InsertVitalSign(task)
    {          
         var promise = VitalSign.insertVitalSign(task);
         promise.then(function(data){
           if(data.results)
           {
              console.log(data.results);             
           }                        
         },function(){                        
         });
    }

  //体征字典
  var VitalSignTbl = {"Temperature": {code:"体温", type:"体温"},
                      "Weight": {code:"体重", type:"体重"},
                      "BloodPressure": {code:"血压", type:"血压"},
                      "Vol": {code:"尿量", type:"尿量"},
                      "HeartRate": {code:"心率", type:"心率"}                   
                     };

  //更新用户任务模板
    function UpdateUserTask(task)
    {
      var promise = Task.updateUserTask(task);
       promise.then(function(data){
         //console.log(data);
         if(data.results)
         {
          //console.log(data.results);
         };
       },function(){                    
       })
    }

  //修改长期任务第一次时间  
    function ChangeLongFir()
    {
        //界面
        for (var i=0;i<$scope.Tasks.Other.length;i++)
        {
          if($scope.Tasks.Other[i].startTime == '2050-11-02T07:58:51.718Z') //未设定时间时
          {
            $scope.Tasks.Other[i].startTime = SetTaskTime($scope.Tasks.Other[i].frequencyUnits, $scope.Tasks.Other[i].times);           
          }
          else
          {
             $scope.Tasks.Other[i].startTime = $scope.Tasks.Other[i].startTime.substr(0,10);
          }
          /*var item = $scope.Tasks.Other[i];  //先不管吧
          var CompRes = CompareTime(item.startTime, item.frequencyTimes, item.frequencyUnits, item.times);
          if(!CompRes.Flag)
          {
              $scope.Tasks.Other[i].Flag = true;
          }*/
        }
        //数据库
        for (var i=0;i<$scope.Tasks.Other.length;i++)
        {
          if($scope.Tasks.Other[i].startTime != '2050-11-02T07:58:51.718Z') //修改任务执行时间
          {
            var temp = $scope.Tasks.Other[i];
            var task = {
                          "userId":UserId, 
                          "type":temp.type, 
                          "code":temp.code, 
                          "instruction":temp.instruction, 
                          "content":temp.content, 
                          "startTime":temp.startTime, 
                          "endTime":temp.endTime, 
                          "times":temp.times,
                          "timesUnits":temp.timesUnits, 
                          "frequencyTimes":temp.frequencyTimes, 
                          "frequencyUnits":temp.frequencyUnits
                        };                      
            UpdateUserTask(task);
          }
        }
    }
  
  //设定长期任务第一次时间
   function SetTaskTime (Type, Times)
   {
      //暂时就用本地时间
      var CurrentDate = new Date(dateNowStr);
      var NewDate;
      var WeekDay = CurrentDate.getDay(); //0-6 0为星期日
      var Day = CurrentDate.getDate(); //1-31
      var Month = CurrentDate.getMonth(); //0-11,0为1月
      
      var Num = 0;     
      if(Type == "周")
      {
         Num = 1;//默认周一

         if(Num >= WeekDay) //所选日期未过，选择本星期
         {
            NewDate = new Date(CurrentDate.setDate(Day + Num - WeekDay));
         }
         else //下个星期
         {
            NewDate = new Date(CurrentDate.setDate(Day + Num + 7 - WeekDay));
         }        
      }
      else if(Type == "月")
      {
         Num = 1; //默认1日
         NewDate = new Date(CurrentDate.setDate(Num));
         if (Num < Day) //所选日期已过，选择下月
         {
            NewDate = new Date(CurrentDate.setMonth(CurrentDate.getMonth() + 1));
         }         
      }
      else if(Type == "年")
      {
         if(Times == 2) //一年2次 -- 6月1次
         {
            Num = 1;
            NewDate = new Date(CurrentDate.setDate(Num));
            if (Num < Day) //所选日期已过，选择下月
            {
              NewDate = new Date(CurrentDate.setMonth(CurrentDate.getMonth() + 1));
            }  
         }
         else
         {
             Num = 0; //默认1月
             NewDate = new Date(CurrentDate.setMonth(Num));
             if(Num < Month)//所选日期已过，选择明年
             {
                NewDate = new Date(CurrentDate.setYear(CurrentDate.getFullYear() + 1));
             }
             }
         
      }
      //console.log(ChangeTimeForm(NewDate));
      return ChangeTimeForm(NewDate);
   }

  //弹框格式
   var PopTemplate = {
                        Input:'<input type="text" ng-model="data.value"><p ng-if = "data.alertFlag" style="color:red;">{{data.alertWords}}</P>',
                        InputBP:'收缩压<input type="text" ng-model="data.value1"><p ng-if = "data.alertFlag1" style="color:red;">123{{data.alertWords1}}</P>'
                                + '舒张压<input type="text" ng-model="data.value2"><p ng-if = "data.alertFlag2" style="color:red;">{{data.alertWords2}}</P>',
                        Textarea:'<textarea type="text" ng-model="data.value" rows="10" cols="100"></textarea>',
                        Select:'<select ng-model = "data.value"><option >是</option><option >否</option></select>'
                    };//Textarea：VascularAccess；
  
  //测量弹窗
    $scope.showMesPop = function(task, type) {
      $scope.data = {};
      $scope.data.alertFlag = false; 
      //console.log(task);
      var PopInfo = GetPopInfo('input', type, task);
      $scope.data.value = PopInfo.content;
      var myPopup = $ionicPopup.show({
         template: PopInfo.Template,     
         title: PopInfo.word,
         scope: $scope,
         buttons: [
           { text: '取消' },
           {
             text: '保存',
             type: 'button-positive',
             onTap: function(e) {
               if(PopInfo.flag == 'InputBP')
               {
                 if((!$scope.data.value1) || (!$scope.data.value2))
                 {
                   e.preventDefault();
                 }
                 else
                 {
                    var Range1 = AboutRange($scope.data.value1, task.code);
                    var Range2 = AboutRange($scope.data.value2, task.code);
                    var word1 = Range1.word;
                    var word2 = Range2.word;
                    if(word1 != "")
                    {
                       $scope.data.alertWords1 = word1;
                       $scope.data.alertFlag1 = true;
                       e.preventDefault();
                    }
                    else if(word2 != "")
                    {
                       $scope.data.alertWords2 = word2;
                       $scope.data.alertFlag2 = true;
                       e.preventDefault();
                    }
                    else
                    {
                       if((Range1.num > 140) || (Range2.num > 90))
                        {
                           $scope.showAlert();
                        }                      
                        return  Range1.str + "/" + Range2.str;  
                    }
                 }
               }
               else
               {
                   if (!$scope.data.value) 
                   {                
                     e.preventDefault();
                   }                                   
                   if(PopInfo.flag == 'input')  
                   {
                       var Range = AboutRange($scope.data.value, task.code);
                       var word = Range.word;
                       if(word != "")
                       {
                         $scope.data.alertWords = word;
                         $scope.data.alertFlag = true;
                         e.preventDefault();
                       }
                       else
                       {                    
                         return Range.str;   
                       }    
                   }                      
                   else
                   {
                      console.log($scope.data.value)
                      if(!$scope.data.value)
                      {
                         e.preventDefault();
                      }
                      else
                      {
                          return $scope.data.value;
                      }
                   }   
                }                                                                                                                                  
              }    
           },
         ]
       });
       myPopup.then(function(res) {
        if(res)
        {  
           var Description = res;            
          //向任务表中插入数据
          if((task.frequencyUnits == '天') && (task.instruction != ""))
          {
              if(type == 'fill')
              {
                 Description = task.instruction + '，' + Description; //若为一天多次的任务
              }
              else
              {
                  var arry = task.instruction.split('，');
                  arry[arry.length-1] = res;
                  Description = arry.join('，');
              }             
          } 
          var item = {
                      "userId": UserId,
                      "type": task.type,
                      "code": task.code,
                      "date": dateNowStr,
                      "status": 0,
                      "description": Description
                    };
          
          //console.log(item); 
          Postcompliance(item);
        }  
      });
    };
 
  //弹窗标题、输入类型、显示内容
    function GetPopInfo(flag, type, task)
    {
        var res = {};
        var Template = PopTemplate.Input; //默认为输入框
        var word = '请填写'+ task.Name + "(" + task.Unit + ")";
        var content = "";  
        var instruction = task.instruction;           
        if((task.code == "ywfz") || (task.code == "yl"))
        {
           flag = 'Select';               
           Template = PopTemplate.Select;
           if(task.code == "ywfz")
           {
             word = "请选择是否浮肿";
           }
           else
           {
             word = "请选择引流是否通畅";
           }
           if(instruction != "")
           {
             content = instruction;
           }
         }
         else if(task.code == 'BloodPressure')
         {
            flag = 'InputBP';
            Template = PopTemplate.InputBP;
            if(instruction != "")
            {
               if(type == 'edit')
               {
                 word = task.Name + "(" + task.Unit + ")";
                 var arry = instruction.split("，");
                 var blStr = arry[arry.length - 1];
                 $scope.data.value1 = blStr.split("/")[0];
                 $scope.data.value2 = blStr.split("/")[1];
               }
               
            }         
            $scope.data.alertFlag1 = false;
            $scope.data.alertFlag2 = false;
         }
         else
         {
            if(instruction == "")
            {
               type = 'fill';
            }
            if(type == 'edit')
            {
                word = task.Name + "(" + task.Unit + ")";
                content = instruction;
                var arry = content.split('，');         
                content = arry[arry.length-1];                      
            }       
         }       
        res.Template = Template;
        res.word = word;
        res.content = content;
        res.flag = flag;
        return res;
    }
  
  //血透弹窗
   $scope.showHemoPop = function(task, type) {
      $scope.data = {};
      $scope.data.alertFlag = false;
      //console.log(task);
      if(task.instruction == "")
      {
         type = 'fill';
      }
      if(type == "edit")
      {
         var arry = task.instruction.split('，');
         $scope.data.value = arry[arry.length - 1];
         word =  task.Name + "情况";
      }
      else
      {
         content = "";
         word = "请填写" + task.Name + "情况";
      }
      var myPopup = $ionicPopup.show({
         template: PopTemplate.Textarea,     
         title: word,
         scope: $scope,
         buttons: [
           { text: '取消' },
           {
             text: '保存',
             type: 'button-positive',
             onTap: function(e) {
               if (!$scope.data.value) 
               {
                 // 不允许用户关闭，除非输入内容
                 e.preventDefault();
               } 
               else 
               {                 
                  return $scope.data.value;                                   
               }  
              }  
           },
         ]
       });
       myPopup.then(function(res) {
        if(res)
        {  
           var Description = res;                              
           if (task.instruction == '设定血透排班')
           {
              task.instruction = "";
           }
           if((type == 'fill') && (task.instruction != ""))
           {             
               Description = task.instruction + '，' + Description; 
           }
           else
           {
                var arry = task.instruction.split('，');
                arry[arry.length-1] = res;
                Description = arry.join('，');
           }                  
          var item = {
                      "userId": UserId,
                      "type": task.type,
                      "code": task.code,
                      "date": dateNowStr,
                      "status": 0,
                      "description": Description
                    };
          
          //console.log(item); 
          Postcompliance(item);
        }  
      });
    };

  //其他任务弹窗
    $scope.showOtherPop = function(task, type) {
        $scope.data = {};
        $scope.data.alertFlag = false;
        $scope.data.value = task.instruction;
        if(!task.Flag)
        {
          type = "fill";
        }
        word = task.Name + "情况";
        if(type == 'fill')
        {
           word = "请填写" + word;
           $scope.data.value = "";
        }     
        var myPopup = $ionicPopup.show({
           template: PopTemplate.Textarea,     
           title: word,
           scope: $scope,
           buttons: [
             { text: '取消' },
             {
               text: '保存',
               type: 'button-positive',
               onTap: function(e) {
                 if (!$scope.data.value) 
                 {
                   // 不允许用户关闭，除非输入内容
                   e.preventDefault();
                 } 
                 else 
                 {                 
                   return $scope.data.value;                                  
                 }    
               },
             }
           ]
         });
         myPopup.then(function(res) {
          if(res)
          {                   
            //向任务表中插入数据          
            var item = {
                        "userId": UserId,
                        "type": task.type,
                        "code": task.code,
                        "date": dateNowStr,
                        "status": 0,
                        "description": res
                      };
            
            //console.log(item); 
            Postcompliance(item);
          }  
        });
    };

  //获取某项任务执行情况
    function GetTaskInfo(task)
    {   
       var res = "";            
       var promise = Compliance.getcompliance(task);
       promise.then(function(data){
         if(data.results)
         {
            res = data.results.description;    
         }           
         //console.log(data.results);  
         ChangeLongFir();//修改长周期任务第一次执行时间                    
       },function(){                       
       });
       return res;
    }   

  //测量输入格式与范围判定
   function AboutRange(value, code)
   {
      var word = "";
      var num = -1;
      var res = {};
      var str = value.replace(/(^\s*)|(\s*$)/g, "");//去除字符串两端空格                     
      if(isNaN(str))
      {
          word = "请输入数字！";       
      } 
      else
      {
         var num = parseInt(str);
         var range = RangeMatch(code);
         if(!jQuery.isEmptyObject(range))
         {
            if((num < range.Min) || (num > range.Max))
            {
                word = "您输入的数值不在正常范围内!"
            }
         }
      }
      res.word = word;
      res.num = num;
      res.str = str;
      return res;
   }

  //提示框
   $scope.showAlert = function() {
     var alertPopup = $ionicPopup.alert({
       title: '提示',
       template: '请注意，您可能患有高血压！'
     });
     alertPopup.then(function(res) {    
     });
   };
 
  //任务完成后设定下次任务执行时间
    function SetNextTime(LastDate, FreqTimes, Unit, Times)
    {
        var NextTime; 
        if((Unit == '年') && (Times == 2))//一年2次
        {
           Unit = "月";
           FreqTimes =  6;
        }
        var tbl = {"周": 7, "月": 30, "年": 365};
        var someDays = tbl[Unit] * FreqTimes;
        var days = GetDifDays(LastDate, dateNowStr);
        if(days > someDays)
        {
            NextTime = new Date(LastDate);
        }
        else
        {
            var add = FreqTimes;
            if(Unit == "周")
            {
               add = FreqTimes * 7;
            }        
            NextTime = DateCalc(LastDate, Unit, add);                         
        }       
        //console.log(NextTime);     
        return NextTime;
    }

  //点击按钮开始新任务
   $scope.StartNewTask = function(task)
   {
      task.Flag = false;
   }

  //日期延后计算
    function DateCalc(LastDate, Type, Addition)
    {      
      var Date1 = new Date(LastDate);
      var Date2;
      if(Type == "周") //周
      {
          Date2 = new Date(Date1.setDate(Date1.getDate() + Addition));
      }
      else if(Type == "月")
      {
          Date2 = new Date(Date1.setMonth(Date1.getMonth() + Addition));
      }
      else //年
      {
          Date2 = new Date(Date1.setYear(Date1.getFullYear() + Addition));
      }     
      return Date2;
    }
 
  //医生排班表数据
    $scope.Docweek = ["周一","周二","周三","周四","周五","周六","周日"];
    $scope.TblColor1 = ["gray", "green", "gray" ,"gray", "green", "green", "gray"];
    $scope.TblColor2 = ["gray", "green", "green" ,"green", "gray", "gray", "gray"];

  //弹窗：医生排班表
    $ionicModal.fromTemplateUrl('templates/modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
       }).then(function(modal) {
        $scope.modal = modal;
      });
       $scope.openModal = function() {
       GetMyDoctors();
       $scope.modal.show();
     };
     $scope.closeModal = function() {
       $scope.modal.hide();
     };
     //清除
     $scope.$on('$destroy', function() {
       $scope.modal.remove();
     });  

  //修改日期格式Date → yyyy-mm-dd
   function ChangeTimeForm(date)
   {
      var nowDay = "";
      if (date instanceof Date)
      {
          var mon = date.getMonth() + 1;
          var day = date.getDate();
          nowDay = date.getFullYear() + "-" + (mon<10?"0"+mon:mon) + "-" +(day<10?"0"+day:day);
      }     
      return nowDay;
   }

  //页面刷新
    $scope.Refresh = function()
    {
        $window.location.reload();
    }

  //跳转至任务设置页面
   $scope.GotoSet = function()
   {
      $state.go('tab.taskSet');
   }

  //血透排班表字典
   $scope.HemoTbl =[
                     {'background-color':'white'},
                     {'background-color':'white'},
                     {'background-color':'white'},
                     {'background-color':'white'},
                     {'background-color':'white'},
                     {'background-color':'white'},
                     {'background-color':'white'},
                     {'background-color':'white'},
                     {'background-color':'white'},
                     {'background-color':'white'},
                     {'background-color':'white'},
                     {'background-color':'white'},
                     {'background-color':'white'},
                     {'background-color':'white'}    
                  ];

  //获取医生排班
    function GetMyDoctors()
    {
      var promise =  Patient.getMyDoctors({userId:UserId});
       promise.then(function(data){
         if(data.results.doctorId)
         {           
            var schedules = data.results.doctorId.schedules;
            //console.log(schedules);
            if(schedules)
            {
                 for (var i=0;i<schedules.length;i++)
                {
                   var num = parseInt(schedules[i].day);
                   if(schedules[i].time == "1")
                   {
                      num = num + 7;
                   }
                   //console.log(num);
                   $scope.HemoTbl[num]['background-color'] = 'red';
                }
         }
            }
       },function(){
                      
       })
    }

    $scope.gotoinsurance = function(){
      $state.go('insurance');
    }
  

}])

//任务设置--GL
.controller('TaskSetCtrl', ['$scope', '$state', '$ionicHistory', 'Storage', 'Patient', 'Task',  '$ionicPopup',function($scope, $state, $ionicHistory, Storage, Patient, Task,  $ionicPopup) {
  
  //初始化
    var UserId = Storage.get('UID'); 
    //UserId = "Test13"; 
    $scope.Tasks = {};
    $scope.OKBtnFlag = true;
    $scope.EditFlag = false;
    var dateNowStr = ChangeTimeForm(new Date()); //方便设定当前日期进行调试，或是之后从数据库获取当前日期
    $scope.$on('$ionicView.enter', function() {
        GetTasks();
    });  
  
  //获取对应任务模板
   function GetTasks(TaskCode)
   {     
     var promise =  Task.getUserTask({userId:UserId});
     promise.then(function(data){
       if(data.result.length != 0)
       {
          $scope.Tasks = data.result.task;
          //console.log($scope.Tasks);
          HandleTasks();
       }
     },function(){
                    
     })
   }

  //获取模板后进行处理
    function HandleTasks()
    {
      $scope.Tasks.Other = [];
      $scope.Tasks.Hemo = []; //血透排班
      $scope.Tasks.Hemo.Flag = false;
      for (var i=0;i<$scope.Tasks.length;i++)
      {
         var task = $scope.Tasks[i];
         var newTask = [];
         //console.log(task);
         if(task.type == 'Measure')
         {
            $scope.Tasks.Measure = task.details;
            for(var j=0;j<$scope.Tasks.Measure.length;j++)
            {
                var temp = $scope.Tasks.Measure[j];
                if(temp.frequencyUnits == '天')//限定每日完成的任务
                {
                    $scope.Tasks.Measure[j].Name = NameMatch($scope.Tasks.Measure[j].code);
                    $scope.Tasks.Measure[j].Freq = temp.frequencyTimes + temp.frequencyUnits + temp.times + temp.timesUnits;  
                }
                else
                {
                    if(temp.code == 'VascularAccess')
                    {
                        newTask = $scope.Tasks.Measure[j];
                        newTask.type = task.type;
                        newTask.Name = "血管通路情况";
                        newTask.Freq = newTask.frequencyTimes + newTask.frequencyUnits +newTask.times + newTask.timesUnits; 
                        newTask = TimeSelectBind(newTask);                  
                        $scope.Tasks.Other.push(newTask); 
                        $scope.Tasks.Measure.splice(j, 1);  
                    }                                      
                }
                                  
            }
          }
          else
          {
              for (var j=0;j<task.details.length;j++)
            {
                newTask = task.details[j];  
                if((task.type == 'ReturnVisit') &&(newTask.code == 'stage_9')) //排除血透排班
                {                   
                    $scope.Tasks.Hemo = newTask;
                    $scope.Tasks.Hemo.type = task.type;
                    $scope.Tasks.Hemo.Flag = true;
                    $scope.Tasks.Hemo.Freq =  newTask.frequencyTimes + newTask.frequencyUnits +newTask.times + newTask.timesUnits;
                    //console.log($scope.Tasks.Hemo);
                    if((newTask.content != "") &&(newTask.content != " ")) //修改表格样式
                    {
                       var NumArry = newTask.content.split('+')[1].split(',');
                       for (var k=0;k<NumArry.length;k++)
                       {
                         $scope.HemoTbl[NumArry[k]].style["background-color"] = "red";
                       }
                    }
                }
                else if(newTask.times == 0) //排除只执行一次的任务
                {
                    //暂时不放进来
                }             
                else
                {
                  newTask.type = task.type;
                  newTask.Name = NameMatch(newTask.type);
                  newTask.Freq = newTask.frequencyTimes + newTask.frequencyUnits +newTask.times + newTask.timesUnits;
                  newTask = TimeSelectBind(newTask);
                  $scope.Tasks.Other.push(newTask);   
                }
            }     
          }                                  
      } 
      //console.log($scope.Tasks);      
    }    
  
  //名称转换
   function NameMatch(name)
   {
     var Tbl = [
                 {Name:'体温', Code:'Temperature'},
                 {Name:'体重', Code:'Weight'},
                 {Name:'血压', Code:'BloodPressure'},
                 {Name:'尿量', Code:'Vol'},
                 {Name:'心率', Code:'HeartRate'},
                 {Name:'复诊', Code:'ReturnVisit'},
                 {Name:'化验', Code:'LabTest'},
                 {Name:'特殊评估', Code:'SpecialEvaluate'},
                 {Name:'血管通路情况', Code:'VascularAccess'},
                 {Name:'腹透', Code:'PeritonealDialysis'},
                 {Name:'超滤量', Code:'cll'},
                 {Name:'浮肿', Code:'ywfz'},
                 {Name:'引流通畅', Code:'yl'}
                ];
      for (var i=0;i<Tbl.length;i++)
      {
         if(Tbl[i].Code == name)
         {
            name = Tbl[i].Name
            break;
         }
      }
      return name;
   }

  //时间下拉框绑定
   function TimeSelectBind(item)
   {
        var flag = false;
        var day;
        if(item.startTime != "2050-11-02T07:58:51.718Z") //已设置过时间，选定的日期应从取得的数据计算
        {
           var date = new Date(item.startTime);
           flag = true;
        }
        var Unit = item.frequencyUnits;
        if (Unit == "周")
        {
          item.Days = $scope.Week;
          item.Type = "week"; 
          if(flag)
          {
             var day = date.getDay();
             item.SelectedDay = $scope.Week[day];
          }
          else
          {
             item.SelectedDay = "星期一"; //默认时间
          }          
        }
        else if(Unit == "月")
        {
          item.Days = $scope.Days;
          item.Type = "month"; 
          if(flag)
          {
             var day = date.getDate();
             item.SelectedDay = $scope.Days[day - 1];
          }
          else
          {
             item.SelectedDay = "1日"; //默认时间
          }            
        }
        else if(Unit == '年')
        {
          item.Days = $scope.Month;
          item.Type = "year"; 
           if(flag)
          {
             var day = date.getMonth();
             item.SelectedDay = $scope.Month[day];
          }
          else
          {
             item.SelectedDay = "1月"; //默认时间
          }            
        }
        return item;     
   }

  //时间下拉框数据
   $scope.Week = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
   $scope.Days = ["1日","2日","3日","4日","5日","6日","7日","8日","9日","10日","11日","12日","13日","14日","15日","16日","17日","18日","19日","20日","21日","22日","23日","24日","25日","26日","27日","28日"];
   $scope.Month = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
  
  //页面跳转
   $scope.SetDate = function()
   {
     if($scope.Tasks.Hemo.Flag)
     {
         SetHemoDate($scope.Tasks.Hemo);
     }   
     for (var i=0;i<$scope.Tasks.Other.length;i++)
     {
        var task = $scope.Tasks.Other[i];
        $scope.Tasks.Other.startTime = SetTaskTime(task.SelectedDay, task.frequencyUnits);
        item = {
                  "userId":UserId, 
                  "type":task.type, 
                  "code":task.code, 
                  "instruction":task.instruction, 
                  "content":task.content, 
                  "startTime":$scope.Tasks.Other.startTime, 
                  "endTime":task.endTime, 
                  "times":task.times,
                  "timesUnits":task.timesUnits, 
                  "frequencyTimes":task.frequencyTimes, 
                  "frequencyUnits":task.frequencyUnits
              };  
       UpdateUserTask(item);  //更改任务下次执行时间
     }
     if($scope.OKBtnFlag)
     {
        $ionicHistory.goBack();
        //$state.go('tab.tasklist');
     }   
     
   }
   


   $scope.Goback = function(){
     $ionicHistory.goBack();
   }
   
  //更新用户任务模板
    function UpdateUserTask(task)
    {
      var promise = Task.updateUserTask(task);
       promise.then(function(data){
         //console.log(data);
         if(data.results)
         {
          //console.log(data.results);
         };
       },function(){                    
       })
    }

  //选定星期或号数后，默认为离当前日期最近的日期
   function SetTaskTime (SelectedDay, Type)
   {
      //暂时就用本地时间
      var CurrentDate = new Date(dateNowStr);
      var NewDate;
      var WeekDay = CurrentDate.getDay(); //0-6 0为星期日
      var Day = CurrentDate.getDate(); //1-31
      var Month = CurrentDate.getMonth(); //0-11,0为1月
      
      var Num = 0;     
      if(Type == "周")
      {
         Num = $scope.Week.indexOf(SelectedDay);

         if(Num >= WeekDay) //所选日期未过，选择本星期
         {
            NewDate = new Date(CurrentDate.setDate(Day + Num - WeekDay));
         }
         else //下个星期
         {
            NewDate = new Date(CurrentDate.setDate(Day + Num + 7 - WeekDay));
         }        
      }
      else if(Type == "月")
      {
         Num = $scope.Days.indexOf(SelectedDay) + 1;
         NewDate = new Date(CurrentDate.setDate(Num));
         if (Num < Day) //所选日期已过，选择下月
         {
            NewDate = new Date(CurrentDate.setMonth(CurrentDate.getMonth() + 1));
         }         
      }
      else if(Type == "年")
      {
         Num = $scope.Month.indexOf(SelectedDay);
         NewDate = new Date(CurrentDate.setMonth(Num));
         if(Num < Month)//所选日期已过，选择明年
         {
            NewDate = new Date(CurrentDate.setYear(CurrentDate.getFullYear() + 1));
         }
      }
      //console.log(NewDate);
      return ChangeTimeForm(NewDate);
   }
 
  //编辑按钮
   $scope.EnableEdit = function ()
   {
      $('select').attr("disabled", false);
      $scope.EditFlag = true;
   }   

  //修改日期格式Date → yyyy-mm-dd
   function ChangeTimeForm(date)
   {
      var nowDay = "";
      if(date instanceof Date) //判断是否为日期格式
      {
          var mon = date.getMonth() + 1;
          var day = date.getDate();
          nowDay = date.getFullYear() + "-" + (mon<10?"0"+mon:mon) + "-" +(day<10?"0"+day:day);
      }      
      return nowDay;
   }

  //血透排班表字典
   $scope.HemoTbl =[
                     {No: 0, style:{'background-color':'white'}, Day:"星期一"},
                     {No: 1, style:{'background-color':'white'}, Day:"星期二"},
                     {No: 2, style:{'background-color':'white'}, Day:"星期三"},
                     {No: 3, style:{'background-color':'white'}, Day:"星期四"},
                     {No: 4, style:{'background-color':'white'}, Day:"星期五"},
                     {No: 5, style:{'background-color':'white'}, Day:"星期六"},
                     {No: 6, style:{'background-color':'white'}, Day:"星期日"},
                     {No: 7, style:{'background-color':'white'}, Day:"星期一"},
                     {No: 8, style:{'background-color':'white'}, Day:"星期二"},
                     {No: 9, style:{'background-color':'white'}, Day:"星期三"},
                     {No: 10, style:{'background-color':'white'}, Day:"星期四"},
                     {No: 11, style:{'background-color':'white'}, Day:"星期五"},
                     {No: 12, style:{'background-color':'white'}, Day:"星期六"},
                     {No: 13, style:{'background-color':'white'}, Day:"星期日"}    
                  ];

  //点击进行血透排班选择
    $scope.HemoSelect = function(num)
    {
        if($scope.EditFlag)
        {
            var num1;
            if ($scope.HemoTbl[num].style["background-color"] == 'white')
            {        
               //判断是否选中同一天
                if (num >= 7)
                {
                    num1 = num - 7;
                }
                else
                {
                   num1 = num + 7;
                }
                if ($scope.HemoTbl[num1].style["background-color"] == 'red')
                {
                     $scope.showAlert("请不要在同一天安排两次血透！");
                }
                else
                {
                    $scope.HemoTbl[num].style["background-color"] = 'red';
                }
            }     
            else
            {
               $scope.HemoTbl[num].style["background-color"] = 'white';
            }
        }       

    }
 
  //血透排班写入数据库
    function SetHemoDate(task)
    {
        var times = task.times;
        var dateStr = "";
        var numStr = "";
        var res = "";
        var count = 0;
        for (var i=0;i<$scope.HemoTbl.length;i++)
        {
           if($scope.HemoTbl[i].style["background-color"] == 'red')
           {
              count++;
              numStr = numStr + "," + i.toString();
              dateStr = dateStr + "," + SetTaskTime($scope.HemoTbl[i].Day, "周");
           }
        }

        if(count < times)
        {
            $scope.showAlert("血透排班次数不足");
            $scope.OKBtnFlag = false;
        }
        else if(count > times)
        {
           $scope.showAlert("血透排班次数过多");
           $scope.OKBtnFlag = false;
        }
        else
        {
           numStr = numStr.substr(1);
           dateStr = dateStr.substr(1);
           $scope.OKBtnFlag = true;
           res = dateStr + "+" + numStr;
           var item = {
                          "userId":UserId, 
                          "type":task.type, 
                          "code":task.code, 
                          "instruction":task.instruction, 
                          "content":res, 
                          "startTime":task.startTime, 
                          "endTime":task.endTime, 
                          "times":task.times,
                          "timesUnits":task.timesUnits, 
                          "frequencyTimes":task.frequencyTimes, 
                          "frequencyUnits":task.frequencyUnits
                      };  
          UpdateUserTask(item);  //更改任务下次执行时间
        }              
    }
 
  //血透次数选择
   $scope.HemoTimesOptions=[2, 3];
   /*$scope.SetHemoTimes = function(times)
   {
      $scope.Tasks.Hemo.times = times;
      console.log($scope.Tasks.Hemo.times);
   }*/

  //提示对话框
   $scope.showAlert = function(words) {
     var alertPopup = $ionicPopup.alert({
       title: '提示',
       template: words
     });
     alertPopup.then(function(res) {       
     });
   };

}])


//我的 页面--PXY
//我的 页面--PXY
.controller('MineCtrl', ['$scope','$ionicHistory','$state','$ionicPopup','$resource','Storage','CONFIG','$ionicLoading','$ionicPopover','Camera', 'Patient','Upload','wechat','$location','$timeout','$sce',function($scope, $ionicHistory, $state, $ionicPopup, $resource, Storage, CONFIG, $ionicLoading, $ionicPopover, Camera,Patient,Upload,wechat,$location,$timeout,$sce) {
  //$scope.barwidth="width:0%";
  // Storage.set("personalinfobackstate","mine")
  
  var patientId = Storage.get('UID')
  //页面跳转---------------------------------
  $scope.GoUserDetail = function(){
    $state.go('userdetail',{last:'mine'});
  }
  $scope.GoDiagnosiInfo = function(){
    $state.go('tab.DiagnosisInfo');
  }
  $scope.GoConsultRecord = function(){
    $state.go('tab.myConsultRecord');
  }
  $scope.GoHealthInfo = function(){
    $state.go('tab.myHealthInfo');
  }
  $scope.GoManagement = function(){
    $state.go('tab.taskSet');
  }

  $scope.GoMoney = function(){
    $state.go('tab.myMoney');
  }

  $scope.SignOut = function(){
    var myPopup = $ionicPopup.show({
            template: '<center>确定要退出登录吗?</center>',
            title: '退出',
            //subTitle: '2',
            scope: $scope,
            buttons: [
              { text: '取消',
                type: 'button-small',
                onTap: function(e) {
                  
                }
              },
              {
                text: '<b>确定</b>',
                type: 'button-small button-positive ',
                onTap: function(e) {
                    $state.go('signin');
                    Storage.rm('TOKEN');
                    var USERNAME=Storage.get("USERNAME");
                    //Storage.clear();
                    Storage.set("IsSignIn","No");
                     Storage.set("USERNAME",USERNAME);
                     //$timeout(function () {
                     $ionicHistory.clearCache();
                     $ionicHistory.clearHistory();
                     $scope.navigation_login=$sce.trustAsResourceUrl("http://patientdiscuss.haihonghospitalmanagement.com/member.php?mod=logging&action=logout&formhash=xxxxxx");
                    //}, 30);
                    //$ionicPopup.hide();
                }
              }
            ]
          });

  }

  $scope.ReflectAdvice = function(){
    $state.go('tab.advice');
  }

  $scope.About = function(){
    $state.go('tab.about');
  }

  $scope.ChangePassword = function(){
    $state.go('tab.changePassword');
  }
  $scope.myAvatar = ""
  //根据用户ID查询用户头像
  Patient.getPatientDetail({userId:Storage.get("UID")}).then(function(res){
    console.log(Storage.get("UID"))
    // console.log(res.results)
    console.log(res.results.photoUrl)
    // console.log(angular.fromJson(res.results))
    if(res.results.photoUrl==undefined||res.results.photoUrl==""){
      $scope.myAvatar=Storage.get('wechathead')
    }else{
      $scope.myAvatar=res.results.photoUrl;
    }
  })
 
  // 上传头像的点击事件----------------------------
  $scope.onClickCamera = function($event){
    Patient.getPatientDetail({userId:Storage.get('UID')}).then(function(data){
        if (data.results == null)
        {
          $ionicPopup.show({
                template: '您的个人信息尚未补全，请完善个人信息上传头像！',
                title: '请完善个人信息',
                scope: $scope,
                buttons: [
                { 
                    text: '取消',
                    type: 'button-small',
                    onTap: function(e){
                      $state.go('tab.mine');
                    }
                },
                {
                    text: '确定',
                    type: 'button-small button-positive ',
                    onTap: function(e) {
                      $state.go('userdetail',{last:'implement'});
                    }
                }
                ]
            });
        }
        else
        {
          $scope.openPopover($event);
        }
      },function(err){
          console.log(err);
      })
  };
  $scope.reload=function(){
    var t=$scope.myAvatar; 
    $scope.myAvatar=''

    $scope.$apply(function(){
      $scope.myAvatar=t;
    })

  }
 
 // 上传照片并将照片读入页面-------------------------
  var photo_upload_display = function(serverId){
    $ionicLoading.show({
        template:'头像更新中',
        duration:5000
    })
   // 给照片的名字加上时间戳
    var temp_photoaddress = Storage.get("UID") + "_" +  "myAvatar.jpg";
    console.log(temp_photoaddress)
    var temp_name = 'resized' + Storage.get("UID") + "_" +  "myAvatar.jpg";
    wechat.download({serverId:serverId, name:temp_name})
    .then(function(res){
      //res.path_resized
      $timeout(function(){
          $ionicLoading.hide();
          //图片路径
          $scope.myAvatar="http://121.43.107.106:8052/uploads/photos/"+temp_name+'?'+new Date().getTime();
          console.log($scope.myAvatar)
          // $state.reload("tab.mine")
          Patient.editPatientDetail({userId:Storage.get("UID"),photoUrl:$scope.myAvatar}).then(function(r){
            console.log(r);
          })
      },1000)
      
    },function(err){
      console.log(err);
      reject(err);
    })
  };
  //-----------------------上传头像---------------------
      // ionicPopover functions 弹出框的预定义
        //--------------------------------------------
        // .fromTemplateUrl() method
  $ionicPopover.fromTemplateUrl('my-popover.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(popover) {
    $scope.popover = popover;
  });
  $scope.openPopover = function($event) {
    $scope.popover.show($event);
  };
  $scope.closePopover = function() {
    $scope.popover.hide();
  };
  //Cleanup the popover when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.popover.remove();
  });
  // Execute action on hide popover
  $scope.$on('popover.hidden', function() {
    // Execute action
  });
  // Execute action on remove popover
  $scope.$on('popover.removed', function() {
    // Execute action
  });

// 相册键的点击事件---------------------------------
  $scope.onClickCameraPhotos = function(){        
   // console.log("选个照片"); 
   $scope.choosePhotos();
   $scope.closePopover();
  };      
  $scope.choosePhotos = function() {
    var config = "";
    var path = $location.absUrl().split('#')[0]
    wechat.settingConfig({url:path}).then(function(data){
      // alert(data.results.timestamp)
      config = data.results;
      config.jsApiList = ['chooseImage','uploadImage']
      // alert(config.jsApiList)
      // alert(config.debug)
      console.log(angular.toJson(config))
      wx.config({
        debug:false,
        appId:config.appId,
        timestamp:config.timestamp,
        nonceStr:config.nonceStr,
        signature:config.signature,
        jsApiList:config.jsApiList
      })
      wx.ready(function(){
        wx.checkJsApi({
            jsApiList: ['chooseImage','uploadImage'],
            success: function(res) {
                wx.chooseImage({
                  count:1,
                  sizeType: ['original','compressed'],
                  sourceType: ['album'],
                  success: function(res) {
                    var localIds = res.localIds;
                    wx.uploadImage({
                       localId: localIds[0],
                       isShowProgressTips: 1, // 默认为1，显示进度提示
                        success: function (res) {
                            var serverId = res.serverId; // 返回图片的服务器端ID
                            photo_upload_display(serverId);
                        }
                    })
                  }
                })
            }
        });
      })
      wx.error(function(res){
        alert(res.errMsg)
      })

    },function(err){

    })
  }; // function结束

    // 照相机的点击事件----------------------------------
    $scope.getPhoto = function() {
      // console.log("要拍照了！");
      $scope.takePicture();
      $scope.closePopover();
    };
    $scope.isShow=true;
    $scope.takePicture = function() {
      var config = "";
      var path = $location.absUrl().split('#')[0]
      wechat.settingConfig({url:path}).then(function(data){
        // alert(data.results.timestamp)
        config = data.results;
        config.jsApiList = ['chooseImage','uploadImage']
        // alert(config.jsApiList)
        // alert(config.debug)
        console.log(angular.toJson(config))
        wx.config({
          debug:false,
          appId:config.appId,
          timestamp:config.timestamp,
          nonceStr:config.nonceStr,
          signature:config.signature,
          jsApiList:config.jsApiList
        })
        wx.ready(function(){
          wx.checkJsApi({
          jsApiList: ['chooseImage','uploadImage'],
          success: function(res) {
              wx.chooseImage({
                count:1,
                sizeType: ['original','compressed'],
                sourceType: ['camera'],
                success: function(res) {
                    var localIds = res.localIds;
                    wx.uploadImage({
                       localId: localIds[0],
                       isShowProgressTips: 1, // 默认为1，显示进度提示
                        success: function (res) {
                            var serverId = res.serverId; // 返回图片的服务器端ID
                            photo_upload_display(serverId);
                        }
                    })
                }
              })
          }
          });
        })
      wx.error(function(res){
        alert(res.errMsg)
      })

      },function(err){

      })
    }; // function结束


}])
//咨询记录--PXY
.controller('ConsultRecordCtrl', ['News','arrTool','$q','Patient','Storage','$scope','$state','$ionicHistory','$ionicLoading','$ionicPopover','Counsels','$ionicPopup',function(News,arrTool,$q,Patient,Storage,$scope,$state,$ionicHistory,$ionicLoading,$ionicPopover,Counsels,$ionicPopup) {

  //$scope.barwidth="width:0%";

  $scope.Goback = function(){
    $state.go('tab.mine')
  }

    $scope.noConsult = false;

    //过滤重复的医生 顺序从后往前，保证最新的一次咨询不会被过滤掉
    var FilterDoctor = function(arr){
        var result =[];
        var hash ={};
        for(var i =arr.length-1; i>=0; i--){
            var elem = arr[i].doctorId.userId;
            if(!hash[elem]){
                result.push(arr[i].doctorId);
                hash[elem] = true;
            }
        }
        return result;
    }

    var RefreshCounSelRecords = function(){
        var MyId = Storage.get('UID');
        var promise = Patient.getCounselRecords({userId:MyId});
        promise.then(function(data){
            console.log(data);
            if(data.results!=""){

                FilteredDoctors = FilterDoctor(data.results);
                console.log(FilteredDoctors);
                News.getNews({userId:MyId,type:11}).then(
                    function(data){
                        console.log(data.results);
                        if(data.results){
                            for(x in FilteredDoctors){
                                for(y in data.results){
                                    if(FilteredDoctors[x].userId==data.results[y].sendBy||FilteredDoctors[x].userId==data.results[y].userId){
                                        FilteredDoctors[x].lastMsgDate = data.results[y].time;
                                        FilteredDoctors[x].latestMsg = data.results[y].description;
                                        try{
                                            data.results[y].url = JSON.parse(data.results[y].url);
                                            FilteredDoctors[x].readOrNot = data.results[y].readOrNot || ( MyId == data.results[y].url.fromID ? 1:0);
                                        }
                                        catch(e){
                                            FilteredDoctors[x].readOrNot = data.results[y].readOrNot;
                                        }
                                        
                                    }
                                }
                            }

                        }
                        $scope.items = FilteredDoctors;
                        console.log(FilteredDoctors);
                    },function(err){
                        console.log(err);
                    }
                );
                // setSingleUnread(FilteredDoctors)
                // .then(function(doctors){
                //     $scope.items=doctors;
                // });
            }else{
                $scope.noConsult = true;
            }
        },function(err){
            console.log(err);

        });
    }

     $scope.$on('$ionicView.enter', function() {
        RefreshCounSelRecords();
    })

    
    $scope.do_refresher = function(){
        RefreshCounSelRecords();
        $scope.$broadcast('scroll.refreshComplete');
    }
    
    
  $scope.getConsultRecordDetail = function(ele,doctorId) {
    var template="";
    var counseltype=0;
    var counselstatus='';
      if(ele.target.nodeName == "IMG"){
          $state.go("tab.DoctorDetail",{DoctorId:doctorId});
      }else{
        //zz最新方法根据docid pid 不填写type获取最新一条咨询信息
        Counsels.getStatus({doctorId:doctorId,patientId:Storage.get('UID')})
        .then(function(data){
          console.log(data.result)
          console.log(data.result.type)
          console.log(data.result.status)
          if(data.result.type==1){
            if(data.result.status==1){//有尚未完成的咨询 直接进入
               $ionicPopup.confirm({
                  title:"咨询确认",
                  template:"您有尚未结束的咨询，点击确认可以查看历史消息，在医生完成三次问答之前，您还可以对您的问题作进一步的描述。",
                  okText:"确认",
                  cancelText:"取消"
              }).then(function(res){
                  if(res){counseltype
                      $state.go("tab.consult-chat",{chatId:doctorId,type:1,status:1}); //虽然传了type和status但不打算使用 byZYH
                  }

              })     
            }else{
              $ionicPopup.confirm({
                  title:"咨询确认",
                  template:"您的咨询已结束，点击确认可以查看历史消息，但是无法继续发送消息。",
                  okText:"确认",
                  cancelText:"取消"
              }).then(function(res){
                  if(res){counseltype
                      $state.go("tab.consult-chat",{chatId:doctorId,type:1,status:0}); //虽然传了type和status但不打算使用 byZYH
                  }

              }) 
            }
          }else if(data.result.type==2||data.result.type==3){
            if(data.result.status==1){//尚未结束的问诊
              $ionicPopup.confirm({
                  title:"问诊确认",
                  template:"您有尚未结束的问诊，点击确认可以查看历史消息，在医生结束该问诊之前您还可以对您的问题作进一步的描述。",
                  okText:"确认",
                  cancelText:"取消"
              }).then(function(res){
                  if(res){counseltype
                      $state.go("tab.consult-chat",{chatId:doctorId,type:data.result.type,status:1}); //虽然传了type和status但不打算使用 byZYH
                  }

              }) 
            }else{
              $ionicPopup.confirm({
                  title:"问诊确认",
                  template:"您的问诊已结束，点击确认可以查看历史消息，但是无法继续发送消息。",
                  okText:"确认",
                  cancelText:"取消"
              }).then(function(res){
                  if(res){counseltype
                      $state.go("tab.consult-chat",{chatId:doctorId,type:data.result.type,status:0}); //虽然传了type和status但不打算使用 byZYH
                  }

              })
            }
          }
        })
      }
    };
}])


//聊天 XJZ 
.controller('ChatCtrl',['$scope', '$state', '$rootScope', '$ionicModal', '$ionicScrollDelegate', '$ionicHistory', 'Camera', 'voice','$http','CONFIG','Patient','Storage','wechat','$location','$q','Communication','Counsels','$ionicPopup','Account','News','Doctor','payment', '$filter','$ionicLoading',function($scope, $state, $rootScope, $ionicModal, $ionicScrollDelegate, $ionicHistory, Camera, voice,$http,CONFIG,Patient,Storage,wechat,$location,$q,Communication,Counsels,$ionicPopup,Account,News,Doctor,payment,$filter,$ionicLoading) {
    $scope.input = {
        text: ''
    }
    var path = $location.absUrl().split('#')[0]
    // $scope.msgs = [];
    $scope.scrollHandle = $ionicScrollDelegate.$getByHandle('myContentScroll');
    function toBottom(animate,delay){
        if(!delay) delay=100;
        setTimeout(function(){
            $scope.scrollHandle.scrollBottom(animate);
        },delay)
    }
    //render msgs 
    $scope.$on('$ionicView.beforeEnter', function() {
        $scope.timer=[];
        $scope.photoUrls={};
        // $state.params.chatId='13709553333';
        $scope.msgs = [];
        $scope.params = {
            msgCount: 0,
            helpDivHeight: 0,
            hidePanel: true,
            moreMsgs:true,
            UID:Storage.get('UID'),
            chatId:$state.params.chatId,
            counselcount:0,
            counseltype:'',
            counselstatus:'',
            needlisten:0,
            counsel:'',
            connect:false
        }
        // if($state.params.type=='0') $scope.params.hidePanel=false;
        // if (window.JMessage) {
        //     window.JMessage.enterSingleConversation($state.params.chatId, CONFIG.crossKey);
        //     getMsg(15);
        // }
        var loadWatcher = $scope.$watch('msgs.length',function(newv,oldv){
            if(newv) {
                loadWatcher();
                var lastMsg=$scope.msgs[$scope.msgs.length-1];
                if(lastMsg.fromID==$scope.params.UID) return;
                return News.insertNews({userId:lastMsg.targetID,sendBy:lastMsg.fromID,type:'11',readOrNot:1});
            }
        });
        $scope.getMsg(15).then(function(data){
            $scope.msgs=data;
            toBottom(true,400);
        });
    });
    $scope.$on('$ionicView.enter', function() {
        $rootScope.conversation.type = 'single';
        $rootScope.conversation.id = $state.params.chatId;
        // News.insertNews({userId:Storage.get('UID'),sendBy:$scope.params.chatId,type:'11',readOrNot:1});
        Counsels.getStatus({doctorId:$state.params.chatId,patientId:Storage.get('UID')})
            .then(function(data)
            {
                // Storage.set('STATUSNOW',data.result.status);
                $scope.params.counseltype = data.result.type=='3'?'2':data.result.type;
                $scope.params.counsel = data.result;
                $scope.counselstatus=data.result.status;

                Account.getCounts({doctorId:$scope.params.chatId,patientId:Storage.get('UID')})
                .then(function(res){
                    if($scope.params.connect){
                        return sendNotice($scope.params.counseltype,$scope.counselstatus,res.result.count);
                    }else{
                        var connectWatcher = $scope.$watch('params.connect',function(newv,oldv){
                            if(newv) {
                                connectWatcher();
                                return sendNotice($scope.params.counseltype,$scope.counselstatus,res.result.count);
                            }
                        });
                    }
                    // var head='',body='';
                    // if($scope.params.counseltype!='1'){
                    //     head+='问诊';
                    //     if($scope.counselstatus=='0'){
                    //         head+='-已结束';
                    //         body='您没有提问次数了。如需提问，请新建咨询或问诊';
                    //     }else{
                    //         body='您可以不限次数进行提问';
                    //     }
                    // }else{
                    //     head+='咨询';
                    //     if(res.result.count<=0){
                    //         head+='-已结束';
                    //         body='您没有提问次数了。如需提问，请新建咨询或问诊';
                    //     }else{
                    //         body='您还有'+res.result.count+'次提问机会';
                    //     }
                    // }
                    // var alertPopup = $ionicPopup.alert({
                    //     title: head,
                    //     template: body
                    // });
                })
            },function(err)
            {
                console.log(err)
            })
            Doctor.getDoctorInfo({userId:$state.params.chatId})
            .then(function(data){
                $scope.photoUrls[data.results.userId]=data.results.photoUrl;
            });
        Patient.getPatientDetail({ userId: $scope.params.UID })
        .then(function(response) {
            thisPatient=response.results;
            $scope.photoUrls[response.results.userId]=response.results.photoUrl;
            // socket = io.connect('ws://121.43.107.106:4050/chat');
            socket.emit('newUser',{user_name:response.results.name,user_id:$scope.params.UID});
            socket.on('err',function(data){
                console.error(data)
                // $rootScope.$broadcast('receiveMessage',data);
            });
            socket.on('getMsg',function(data){
                console.info('getMsg');
                console.log(data);
                if (data.msg.targetType == 'single' && data.msg.fromID == $state.params.chatId) {
                    $scope.$apply(function(){
                        $scope.pushMsg(data.msg);
                    });
                
                    News.insertNews({userId:Storage.get('UID'),sendBy:$scope.params.groupId,type:'11',readOrNot:1});
                    setTimeout(function() {
                        // if ($scope.params.counseltype == 1 && Storage.get('STATUSNOW') == 1) {
                            Counsels.getStatus({ doctorId: $state.params.chatId, patientId: Storage.get('UID')})
                                .then(function(data) {
                                    console.log(data);
                                    $scope.counselstatus=data.result.status;
                                    // Storage.set('STATUSNOW', data.result.status);
                                }, function(err) {
                                    console.log(err)
                                })
                        // } else if ($scope.params.counseltype == 2 && Storage.get('STATUSNOW') == 1) {
                            // Counsels.getStatus({ doctorId: $state.params.chatId, patientId: Storage.get('UID'), type: 2 })
                            //     .then(function(data) {
                            //         console.log(data)
                            //         Storage.set('STATUSNOW', data.result.status);
                            //     }, function(err) {
                            //         console.log(err)
                            //     })
                        // }
                    }, 5000);
                }
            });
            socket.on('messageRes',function(data){
                console.info('messageRes');
                console.log(data);
                if (data.msg.targetType == 'single' && data.msg.targetID == $state.params.chatId) {
                    // setTimeout(function(){
                        $scope.$apply(function(){
                            $scope.pushMsg(data.msg);
                        });
                    // },200)
                }
                // $rootScope.$broadcast('messageResponse',data);
            });
            $scope.params.connect=true;
        }, function(err) {

        });
        wechat.settingConfig({ url:path}).then(function(data) {
            config = data.results;
            config.jsApiList = ['startRecord','stopRecord','playVoice','chooseImage','uploadVoice', 'uploadImage']
            console.log(angular.toJson(config))
            wx.config({
                debug: false,
                appId: config.appId,
                timestamp: config.timestamp,
                nonceStr: config.nonceStr,
                signature: config.signature,
                jsApiList: config.jsApiList
            })
            wx.error(function(res) {
                console.error(res);
                alert(res.errMsg)
            })
        }); 
        imgModalInit();
    })
    // function msgsRender(first,last){
    //     while(first!=last){
    //         $scope.msgs[first+1].diff=($scope.msgs[first+1].createTimeInMillis-$scope.msgs[first].createTimeInMillis)>300000?true:false;
    //         first++;
    //     }
    // }
    function sendNotice(type,status,cnt){
        var t = setTimeout(function(){
            return sendCnNotice(type,status,cnt);
        },2000);
        $scope.timer.push(t);
    }
    function sendCnNotice(type,status,cnt){

        var len=$scope.msgs.length;
        if(len==0 || !($scope.msgs[len-1].content.type=='count-notice' && $scope.msgs[len-1].content.count==cnt)){
            var bodyDoc='';
            if(type!='1'){
                if(status=='0'){
                    bodyDoc='您仍可以向患者追加回答，该消息不计费';
                    bodyPat='您没有提问次数了。如需提问，请新建咨询或问诊';
                }else{
                    bodyDoc='患者提问不限次数';
                    bodyPat='您可以不限次数进行提问';
                }
            }else{
                if(cnt<=0 || status=='0'){
                    bodyDoc='您仍可以向患者追加回答，该消息不计费';
                    bodyPat='您没有提问次数了。如需提问，请新建咨询或问诊';
                }else{
                    bodyDoc='您还需要回答'+cnt+'个问题';
                    bodyPat='您还有'+cnt+'次提问机会';
                }
            }

            var notice={
                type:'count-notice',
                ctype:type,
                cstatus:status,
                count:cnt,
                bodyDoc:bodyDoc,
                bodyPat:bodyPat,
                counseltype:type
            }
            var msgJson={
                contentType:'custom',
                fromID:$scope.params.UID,
                fromName:thisPatient.name,
                fromUser:{
                    avatarPath:CONFIG.mediaUrl+'uploads/photos/resized'+$scope.params.UID+'_myAvatar.jpg'
                },
                targetID:$scope.params.chatId,
                targetName:$scope.params.counsel.doctorId.name,
                targetType:'single',
                status:'send_going',
                createTimeInMillis: Date.now(),
                newsType:11,
                content:notice
            }
            socket.emit('message',{msg:msgJson,to:$scope.params.chatId,role:'patient'});
        }
    }
    function noMore(){
        $scope.params.moreMsgs = false;
        setTimeout(function(){
            $scope.$apply(function(){
                $scope.params.moreMsgs = true;
            });
        },5000);
    }
    $scope.getMsg = function(num) {
        console.info('getMsg');
        return $q(function(resolve,reject){
            var q={
                messageType:'1',
                id1:Storage.get('UID'),
                id2:$scope.params.chatId,
                skip:$scope.params.msgCount,
                limit:num
            }
            Communication.getCommunication(q)
            .then(function(data){
                console.log(data);
                var d=data.results;
                $scope.$broadcast('scroll.refreshComplete');
                if(d=='没有更多了!') return noMore();
                var res=[];
                for(var i in d){
                    res.push(d[i].content);
                }
                if(res.length==0) $scope.params.moreMsgs = false;
                else{
                    $scope.params.msgCount += res.length;
                    // $scope.$apply(function() {
                        if ($scope.msgs.length!=0) $scope.msgs[0].diff = ($scope.msgs[0].createTimeInMillis - res[0].createTimeInMillis) > 300000 ? true : false;
                        for (var i = 0; i < res.length - 1; ++i) {
                            if(res[i].contentType=='image') res[i].content.thumb=CONFIG.mediaUrl+res[i].content['src_thumb'];
                            res[i].direct = res[i].fromID==$scope.params.UID?'send':'receive';
                            res[i].diff = (res[i].createTimeInMillis - res[i + 1].createTimeInMillis) > 300000 ? true : false;
                            $scope.msgs.unshift(res[i]);
                        }
                        res[i].direct = res[i].fromID==$scope.params.UID?'send':'receive';
                        res[i].diff = true;
                        $scope.msgs.unshift(res[i]);
                    // });
                }
                console.log($scope.msgs);
                resolve($scope.msgs);
            },function(err){
                $scope.$broadcast('scroll.refreshComplete');
                resolve($scope.msgs);
            }); 
        })
        
    }

    //receiving new massage
    // $scope.$on('receiveMessage', function(event, msg) {
    //     if (msg.targetType == 'single' && msg.fromName == $state.params.chatId) {
    //         viewUpdate(5);
    //     }
    // });

    $scope.DisplayMore = function() {
        $scope.getMsg(15).then(function(data){
            $scope.msgs=data;
        });
    }


    //view image
    function imgModalInit(){
        $scope.zoomMin = 1;
        $scope.imageUrl = '';
        $scope.sound = {};
        $ionicModal.fromTemplateUrl('partials/tabs/consult/msg/imageViewer.html', {
            scope: $scope
        }).then(function(modal) {
            $scope.modal = modal;
            // $scope.modal.show();
            $scope.imageHandle = $ionicScrollDelegate.$getByHandle('imgScrollHandle');
        });
    }

    function onImageLoad(path) {
        $scope.$apply(function() {
            $scope.imageUrl = path;
        })

    }

    function onImageLoadFail(err) {

    }
    $scope.$on('image', function(event, args) {
        console.log(args)
        event.stopPropagation();
        $scope.imageHandle.zoomTo(1, true);
        $scope.imageUrl = CONFIG.mediaUrl + (args[2].src|| args[2].src_thumb);
        $scope.modal.show();
    })
    $scope.closeModal = function() {
        $scope.imageHandle.zoomTo(1, true);
        $scope.modal.hide();
    };
    $scope.switchZoomLevel = function() {
        if ($scope.imageHandle.getScrollPosition().zoom != $scope.zoomMin)
            $scope.imageHandle.zoomTo(1, true);
        else {
            $scope.imageHandle.zoomTo(5, true);
        }
    }
    $scope.$on('voice', function(event, args) {
        console.log(args)
        event.stopPropagation();
        $scope.params.audio=args[1];
        wx.downloadVoice({
            serverId: args[1].mediaId, // 需要下载的音频的服务器端ID，由uploadVoice接口获得
            isShowProgressTips: 0, // 默认为1，显示进度提示
            success: function (res) {
                // var localId = res.localId; // 返回音频的本地ID
                wx.playVoice({
                    localId: res.localId// 需要播放的音频的本地ID，由stopRecord接口获得
                });
            }
        });
    })
    $scope.$on('profile', function(event, args) {
        event.stopPropagation();
        if(args[1].direct=='receive'){
            $state.go('tab.DoctorDetail',{DoctorId:args[1].fromID});
        }
        // $state.go('tab.DoctorDetail',{DoctorId:args[1]});
    })
    $scope.$on('gopingjia', function(event, args) {
        event.stopPropagation();
        $state.go('tab.consult-comment',{counselId:$scope.params.counsel.counselId,doctorId:$scope.params.chatId,patientId:$scope.params.counsel.patientId.userId});
    });

    $scope.viewPic = function(url) {
            $scope.imageHandle.zoomTo(1, true);
            $scope.imageUrl = url;
            $scope.modal.show();
        }
    // send message--------------------------------------------------------------------------------
        //
    $scope.updateMsg = function(msg){
        console.info('updateMsg');
        var pos=arrTool.indexOf($scope.msgs,'createTimeInMillis',msg.createTimeInMillis);
        if(pos!=-1){
            if(msg.contentType=='image') msg.content.thumb=CONFIG.mediaUrl+msg.content['src_thumb'];
            msg.diff=$scope.msgs[pos].diff;
            // $scope.$apply(function(){
                msg.direct = msg.fromID==$scope.params.UID?'send':'receive';
                $scope.msgs[pos]=msg;
            // });
        }
        // $scope.msgs=$scope.msgs;
    }
    $scope.pushMsg = function(msg){
        console.info('pushMsg');
        if($scope.msgs.length==0){
            msg.diff=true;
        }else{
            msg.diff=(msg.createTimeInMillis - $scope.msgs[$scope.msgs.length-1].createTimeInMillis) > 300000 ? true : false;
        }
        msg.direct = msg.fromID==$scope.params.UID?'send':'receive';
        if(msg.contentType=='image') {
            msg.content.thumb=CONFIG.mediaUrl+msg.content['src_thumb'];
            $http.get(msg.content.thumb).then(function(data){
                $scope.msgs.push(msg);
                toBottom(true,300);
                $scope.params.msgCount++;
            })
        }else{
            $scope.msgs.push(msg);
            toBottom(true,100);
            $scope.params.msgCount++;
        }
        
        // $scope.$apply(function(){
            // $scope.msgs.push(msg);

        // });
        // $scope.msgs=$scope.msgs;
    }
    function msgGen(content,type,local){
        var data={};
        if(type=='text'){
            data={
                text:content
            };
        }else if(type=='image'){
            data={
                mediaId:content[0],
                mediaId_thumb:content[1],
                src:'',
                src_thumb:''
            };
        }else if(type=='voice'){
            data={
                mediaId:content,
                src:''
            };
        }
        var msgJson={
            contentType:type,
            fromID:$scope.params.UID,
            fromName:thisPatient.name,
            fromUser:{
                avatarPath:CONFIG.mediaUrl+'uploads/photos/resized'+$scope.params.UID+'_myAvatar.jpg'
            },
            targetID:$scope.params.chatId,
            targetName:$scope.params.counsel.doctorId.name,
            targetType:'single',
            status:'send_going',
            createTimeInMillis: Date.now(),
            newsType:'11',
            content:data
        }
        if(local){
            if(type=='image'){
                msgJson.content.localId=content[2];
                msgJson.content.localId_thumb=content[3];
            }else if(type=='voice'){
                msgJson.content.localId=content[1];
            }
        }
        return msgJson;
    }
    function nomoney(){
        var alertPopup = $ionicPopup.alert({
             title: '本次咨询已结束',
           });
    }
    function sendmsg(content,type){
        // if($scope.counselstatus!=1) return nomoney();
        var msgJson=msgGen(content,type);
        // if(type=='text'){
            // $scope.pushMsg(msgJson);
            // toBottom(true);
        // }
        socket.emit('message',{msg:msgJson,to:$scope.params.chatId,role:'patient'});
        toBottom(true);
    }
    function onSendSuccess(res) {
        viewUpdate(10);
    }

    function onSendErr(err) {
        console.log(err);
        alert('[send msg]:err');
        viewUpdate(10);
    }
    $scope.submitMsg = function() {
        if($scope.counselstatus!=1) return nomoney();
        var actionUrl = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxfa2216ac422fb747&redirect_uri=http://proxy.haihonghospitalmanagement.com/go&response_type=code&scope=snsapi_userinfo&state=doctor_11_'+ $scope.params.counselstatus+'_'+$scope.params.UID+'_'+$scope.params.counsel.counselId+ '&#wechat_redirect';
        var template = {
            "userId": $scope.params.chatId, //医生的UID
            "role": "doctor",
            "postdata": {
                "template_id": "cVLIgOb_JvtFGQUA2KvwAmbT5B3ZB79cRsAM4ZKKK0k",
                "url":actionUrl,
                "data": {
                    "first": {
                        "value": "您有一个新的"+($scope.params.counseltype==1?'咨询':'问诊')+"消息，请及时处理",
                        "color": "#173177"
                    },
                    "keyword1": {
                        "value": $scope.params.counsel.counselId, //咨询ID
                        "color": "#173177"
                    },
                    "keyword2": {
                        "value": $scope.params.counsel.patientId.name, //患者信息（姓名，性别，年龄）
                        "color": "#173177"
                    },
                    "keyword3": {
                        "value": $scope.params.counsel.help, //问题描述
                        "color": "#173177"
                    },
                    "keyword4": {
                        "value": $scope.params.counsel.time.substr(0,10), //提交时间
                        "color": "#173177"
                    },

                    "remark": {
                        "value": "感谢您的使用！",
                        "color": "#173177"
                    }
                }
            }
        }
        wechat.messageTemplate(template);
        sendmsg($scope.input.text,'text');
        $scope.input.text = '';
            
        }
        //get image
    $scope.getImage = function(type) {
        if($scope.counselstatus!=1) return nomoney();
        var ids=['',''];
        if(type=='cam') var st=['camera'];
        else var st = ['album'];
        wx.chooseImage({
            count: 1, // 默认9
            sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: st, // 可以指定来源是相册还是相机，默认二者都有
            success: function (response) {
                console.log(response);
                ids=ids.concat(response.localIds);

                wx.uploadImage({
                    localId: response.localIds[0], // 需要上传的图片的本地ID，由chooseImage接口获得
                    isShowProgressTips: 0, // 默认为1，显示进度提示
                    success: function (res) {
                        console.log(res);
                        ids[0]=res.serverId; // 返回图片的服务器端ID
                            sendmsg(ids,'image');
                    }
                });
            }
        });
    }
        //get voice
    $scope.getVoice = function(){
        wx.startRecord();
    }
    $scope.stopAndSend = function() {
        wx.stopRecord({
            success: function (res) {
                var ids=['',res.localId];
                var m=msgGen(ids,'voice',true);
                $scope.pushMsg(m);
                toBottom(true);
                wx.uploadVoice({
                    localId: res.localId, // 需要上传的图片的本地ID，由chooseImage接口获得
                    isShowProgressTips: 0, // 默认为1，显示进度提示
                    success: function (response) {
                        console.log(response);
                        ids[0]=response.serverId;
                        // var serverId = res.serverId; // 返回图片的服务器端ID
                        sendmsg(ids,'voice');
                    }
                });
            }
        });
    }

    $scope.backview=$ionicHistory.viewHistory().backView;
    $scope.backstateId=null;
    if($scope.backview!=null){
      $scope.backstateId=$scope.backview.stateId
    }
    $scope.goChats = function() {
        $ionicHistory.nextViewOptions({
            disableBack: true
        });
        if($scope.backstateId=="tab.myConsultRecord"){
          $state.go("tab.myConsultRecord")
        }
        else if($scope.backstateId=="messages"){
            $state.go('messages');
        }else{
          $state.go('tab.myDoctors');
        }
        // $ionicHistory.goBack();
    }


    $scope.$on('keyboardshow', function(event, height) {
        $scope.params.helpDivHeight = height;
        setTimeout(function() {
            $scope.scrollHandle.scrollBottom();
        }, 100);

    })
    $scope.$on('keyboardhide', function(event) {
        // socket.close();
        $scope.params.helpDivHeight = 0;
        // $ionicScrollDelegate.scrollBottom();
    })
    $scope.$on('$ionicView.leave', function() {
        for(var i in $scope.timer) clearTimeout($scope.timer[i]);
        socket.off('messageRes');
        socket.off('getMsg');
        socket.off('err');
        socket.emit('disconnect');
        $scope.msgs = [];
        if($scope.modal)$scope.modal.remove();
        $rootScope.conversation.type = null;
        $rootScope.conversation.id = '';
    })
}])



//健康信息--PXY
.controller('HealthInfoCtrl', ['$ionicLoading','$scope','$timeout','$state','$ionicHistory','$ionicPopup','HealthInfo','Storage','Health','Dict',function($ionicLoading,$scope, $timeout,$state,$ionicHistory,$ionicPopup,HealthInfo,Storage,Health,Dict) {
  //$scope.barwidth="width:0%";
  var patientId = Storage.get('UID')

  $scope.Goback = function(){
    $state.go('tab.mine')
  }
  
  //从字典中搜索选中的对象。
  // var searchObj = function(code,array){
  //     for (var i = 0; i < array.length; i++) {
  //       if(array[i].Type == code || array[i].type == code || array[i].code == code) return array[i];
  //     };
  //     return "未填写";
  // }
  //console.log(HealthInfo.getall());

  $scope.items = new Array();//HealthInfo.getall();
  

    var RefreshHealthRecords = function(){
        $scope.noHealth = false;
        Health.getAllHealths({userId:patientId}).then(
        function(data)
        {
          if (data.results != "" && data.results!= null)
          {
            $scope.items = data.results;
            for (var i = 0; i < $scope.items.length; i++){
              $scope.items[i].acture = $scope.items[i].insertTime;
              // $scope.items[i].time = $scope.items[i].time.substr(0,10)
              // if ($scope.items[i].url != ""&&$scope.items[i].url!=null)
              // {
              //   $scope.items[i].url = [$scope.items[i].url]
              // }
            }
          }else{
            $scope.noHealth = true;
          }
        },
        function(err)
        {
          console.log(err);
        }
      );
    }

     $scope.$on('$ionicView.enter', function() {
        RefreshHealthRecords();
    })

  
    
    $scope.do_refresher = function(){
        RefreshHealthRecords();
        $scope.$broadcast('scroll.refreshComplete');

    }


  $scope.gotoHealthDetail=function(ele,editId){
    console.log(ele)
    console.log(ele.target)
    if(ele.target.nodeName=="I"){
      var confirmPopup = $ionicPopup.confirm({
      title: '删除提示',
      template: '记录删除后将无法恢复，确认删除？',
      cancelText:'取消',
      okText:'删除'
      });

      confirmPopup.then(function(res) {
        if(res) 
          {
            Health.deleteHealth({userId:patientId,insertTime:editId.acture}).then(
              function(data)
              {
                if (data.results == 0)
                {
                  for (var i = 0; i < $scope.items.length; i++){
                    if (editId.acture == $scope.items[i].acture)
                    {
                      $scope.items.splice(i,1)
                      break;
                    }
                  }
                }
                
                console.log($scope.items)
              },
              function(err)
              {
                console.log(err);
              }
            )
            //20140421 zxf
            var healthinfotimes=angular.fromJson(Storage.get('consulthealthinfo'))
            for(var i=0;i<healthinfotimes.length;i++){
              if(healthinfotimes[i].time==editId.acture){
                healthinfotimes.splice(i, 1)
                break;
              }
            }
            Storage.set('consulthealthinfo',angular.toJson(healthinfotimes))
            // HealthInfo.remove(number);
            // $scope.items = HealthInfo.getall();
          } 
        });
    }else{
      $state.go('tab.myHealthInfoDetail',{id:editId,caneidt:false});
    }
    
  }


  $scope.newHealth = function(){
    $state.go('tab.myHealthInfoDetail',{id:null,caneidt:true});

  }

  // $scope.EditHealth = function(editId){
  //   console.log("健康信息");
  //   console.log(editId);
  //   $state.go('tab.myHealthInfoDetail',{id:editId});
  // }


  
}])


//健康详情--PXY
.controller('HealthDetailCtrl', ['$scope','$state','$ionicHistory','$ionicPopup','$stateParams','$ionicPopover','$ionicModal','$ionicScrollDelegate','HealthInfo','$ionicLoading','$timeout','Dict','Health','Storage','Camera','wechat','$location',function($scope, $state,$ionicHistory,$ionicPopup,$stateParams,$ionicPopover,$ionicModal,$ionicScrollDelegate,HealthInfo,$ionicLoading,$timeout,Dict,Health,Storage,Camera,wechat,$location) {
    // //$scope.barwidth="width:0%";
  var patientId = Storage.get('UID')
  $scope.$watch("canEdit",function(oldval,newval){
      console.log("oldval:"+oldval)
      console.log("newval:"+newval)
    })
  $scope.canEdit=$stateParams.caneidt;
  console.log($stateParams.caneidt)
  $scope.Goback = function(){
        // if($scope.canEdit==true){
        //     $scope.canEdit = false;
        // }else{
            if($ionicHistory.backTitle()==null){
                $state.go('tab.myHealthInfo');
            }else{
                $ionicHistory.goBack();
            }
            console.log(123);
            console.log($ionicHistory.backTitle());
            
        // }
        
    }

    //点击显示大图
  $scope.zoomMin = 1;
  $scope.imageUrl = '';
  $ionicModal.fromTemplateUrl('partials/tabs/consult/msg/imageViewer.html', {
      scope: $scope
  }).then(function(modal) {
      $scope.modal = modal;
      // $scope.modal.show();
      $scope.imageHandle = $ionicScrollDelegate.$getByHandle('imgScrollHandle');
  });
  // $scope.healthinfoimgurl = '';
  // $ionicModal.fromTemplateUrl('partials/tabs/consult/msg/healthinfoimag.html', {
  //     scope: $scope,
  //     animation: 'slide-in-up'
  //   }).then(function(modal) {
  //     $scope.modal = modal;
  //   });
  $scope.edit = function(){
      $scope.canEdit = true;
      
  }
  // $scope.$on('$ionicView.enter', function() {
    
  // })

    //从字典中搜索选中的对象。
  var searchObj = function(code,array){
    for (var i = 0; i < array.length; i++) {
      if(array[i].name == code) return array[i];
    };
    return "未填写";
  }

  // 获取标签类别
  $scope.labels = {}; // 初始化
    $scope.health={
    label:null,
    date:null,
    text:null,
    imgurl:null
  }
  $scope.health.imgurl=[]
  Dict.getHeathLabelInfo({category:"healthInfoType"}).then(
    function(data)
    {
      $scope.labels = data.results.details
      //判断是修改还是新增
      if($stateParams.id!=null && $stateParams!=""){
        //修改
        // $scope.canEdit = false;
        var info = $stateParams.id;
        console.log(info)
        Health.getHealthDetail({userId:patientId,insertTime:info.acture}).then(
          function(data)
          {
            if (data.results != "" && data.results != null)
            {
              $scope.health.label = data.results.label
              if ($scope.health.label != null && $scope.health.label != "")
              {
                $scope.health.label = searchObj($scope.health.label,$scope.labels);
                console.log( $scope.health.label);
              }
              $scope.health.date = data.results.time
              $scope.health.text = data.results.description
              if (data.results.url != ""&&data.results.url!=null)
              {
                console.log(data.results.url)
                $scope.health.imgurl = data.results.url
                // $scope.showflag=true;
              }
            }
            console.log($scope.health);
          },
          function(err)
          {
            console.log(err);
          }
        )
      }else{
        // $scope.canEdit = true;
      }
      console.log($scope.labels);
    },
    function(err)
    {
      console.log(err);
    }
  )
  //angular.toJson fromJson()
  //2017419 zxf
  // var testtt=[];
  // testtt.push("http://121.43.107.106:8052/uploads/photos/")
  // testtt.push("http://121.43.107.10da6:8052/uploads/photos/")
  // Storage.set('test',angular.toJson(testtt))
  // console.log(testtt)
  // console.log(Storage.get('test'))
  // console.log(angular.fromJson(Storage.get('test')))
  // testtt=angular.fromJson(Storage.get('test'))

// Storage.set('localhealthinfoimg',angular.toJson(testtt))
//进入之后local有数据但是不显示
  // $scope.health.imgurl=[];
  // var tmpimgurl=Storage.get('localhealthinfoimg');
  // console.log(tmpimgurl)
  // if(tmpimgurl!=""&&tmpimgurl!=null){
  //   console.log(tmpimgurl)
  //   $scope.health.imgurl=angular.fromJson(tmpimgurl);
  //   console.log($scope.health.imgurl)
  //   $scope.showflag=true;
  // }

  
  console.log($ionicHistory.backView())
  $scope.HealthInfoSetup = function(){
    if($scope.health.label!=""&&$scope.health.text!=""&&$scope.health.date!=""){
      console.log($stateParams.id)
        if($stateParams.id==null||$stateParams==""){
            Health.createHealth({userId:patientId,type:$scope.health.label.code,time:$scope.health.date,url:$scope.health.imgurl,label:$scope.health.label.name,description:$scope.health.text,comments:""}).then(
              function(data)
              {
                console.log(data.results);
                console.log(data.results.insertTime);
                // $scope.canEdit= false;
                var healthinfoToconsult=[]
                //从咨询过来的需要返回对应的健康信息
                if($ionicHistory.backView()!=null&&$ionicHistory.backView().stateName=='tab.consultquestion2'){
                  if(Storage.get('consulthealthinfo')==''||Storage.get('consulthealthinfo')==null||Storage.get('consulthealthinfo')=='undefined'){
                    healthinfoToconsult.push({'time':data.results.insertTime})
                  }else{
                    healthinfoToconsult=angular.fromJson(Storage.get('consulthealthinfo'))
                    healthinfoToconsult.push({'time':data.results.insertTime})
                  }
                  Storage.set('consulthealthinfo',angular.toJson(healthinfoToconsult))
                  console.log(Storage.get('consulthealthinfo'))
                }


                $ionicHistory.goBack()
              },
              function(err)
              {
                console.log(err);
              }
            )
        }
        else{
            var curdate=new Date();
            Health.modifyHealth({userId:patientId,type:$scope.health.label.code,time:$scope.health.date,url:$scope.health.imgurl,label:$scope.health.label.name,description:$scope.health.text,comments:"",insertTime:$stateParams.id.insertTime}).then(
              function(data)
              {
                console.log(data.data);
                // $scope.canEdit= false;
                $ionicHistory.goBack()
              },
              function(err)
              {
                console.log(err);
              }
            )
        }
    }
    else{
        $ionicLoading.show({
            template:'信息填写不完整',
            duration:1000
        });
    }

}


  // --------datepicker设置----------------
  var  monthList=["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"];
  var weekDaysList=["日","一","二","三","四","五","六"];
  var datePickerCallback = function (val) {
    if (typeof(val) === 'undefined') {
      console.log('No date selected');
    } else {
      $scope.datepickerObject4.inputDate=val;
      var dd=val.getDate();
      var mm=val.getMonth()+1;
      var yyyy=val.getFullYear();
      var d=dd<10?('0'+String(dd)):String(dd);
      var m=mm<10?('0'+String(mm)):String(mm);
      //日期的存储格式和显示格式不一致
      $scope.health.date=yyyy+'-'+m+'-'+d;
    }
  };
  $scope.datepickerObject4 = {
    titleLabel: '时间日期',  //Optional
    todayLabel: '今天',  //Optional
    closeLabel: '取消',  //Optional
    setLabel: '设置',  //Optional
    setButtonType : 'button-assertive',  //Optional
    todayButtonType : 'button-assertive',  //Optional
    closeButtonType : 'button-assertive',  //Optional
    mondayFirst: false,    //Optional
    //disabledDates: disabledDates, //Optional
    weekDaysList: weekDaysList,   //Optional
    monthList: monthList, //Optional
    templateType: 'popup', //Optional
    showTodayButton: 'false', //Optional
    modalHeaderColor: 'bar-positive', //Optional
    modalFooterColor: 'bar-positive', //Optional
    from: new Date(1900, 1, 1),   //Optional
    to: new Date(),    //Optional
    callback: function (val) {    //Mandatory
      datePickerCallback(val);
    }
  };  
//--------------copy from minectrl
  // 上传头像的点击事件----------------------------
  $scope.onClickCamera = function($event){
    $scope.openPopover($event);
  };
 
 // 上传照片并将照片读入页面-------------------------
  var photo_upload_display = function(serverId){
    $ionicLoading.show({
      template:'图片更新中',
      duration:5000
    })
   // 给照片的名字加上时间戳
    var temp_photoaddress = Storage.get("UID") + "_" + new Date().getTime() + "healthinfo.jpg";
    console.log(temp_photoaddress)
    wechat.download({serverId:serverId,name:temp_photoaddress})
    .then(function(res){
      var data=angular.fromJson(res)
      //图片路径
      $timeout(function(){
        $ionicLoading.hide();
        $scope.health.imgurl.push("http://121.43.107.106:8052/uploads/photos/"+temp_photoaddress)
      },1000)
      
      // $state.reload("tab.mine")
      // Storage.set('localhealthinfoimg',angular.toJson($scope.health.imgurl));
      console.log($scope.health.imgurl)
      // $scope.showflag=true;
    },function(err){
      console.log(err);
      reject(err);
    })
  };
//-----------------------上传头像---------------------
      // ionicPopover functions 弹出框的预定义
        //--------------------------------------------
        // .fromTemplateUrl() method
  $ionicPopover.fromTemplateUrl('my-popover1.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(popover) {
    $scope.popover = popover;
  });
  $scope.openPopover = function($event) {
    $scope.popover.show($event);
  };
  $scope.closePopover = function() {
    $scope.popover.hide();
  };
  //Cleanup the popover when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.popover.remove();
  });
  // Execute action on hide popover
  $scope.$on('popover.hidden', function() {
    // Execute action
  });
  // Execute action on remove popover
  $scope.$on('popover.removed', function() {
    // Execute action
  });

  // 相册键的点击事件---------------------------------
  $scope.onClickCameraPhotos = function(){        
   // console.log("选个照片"); 
   $scope.choosePhotos();
   $scope.closePopover();
  };      
  $scope.choosePhotos = function() {
    var config = "";
    var path = $location.absUrl().split('#')[0]
    wechat.settingConfig({url:path}).then(function(data){
      // alert(data.results.timestamp)
      config = data.results;
      config.jsApiList = ['chooseImage','uploadImage']
      // alert(config.jsApiList)
      // alert(config.debug)
      console.log(angular.toJson(config))
      wx.config({
        debug:false,
        appId:config.appId,
        timestamp:config.timestamp,
        nonceStr:config.nonceStr,
        signature:config.signature,
        jsApiList:config.jsApiList
      })
      wx.ready(function(){
        wx.checkJsApi({
            jsApiList: ['chooseImage','uploadImage'],
            success: function(res) {
                wx.chooseImage({
                  count:1,
                  sizeType: ['original','compressed'],
                  sourceType: ['album'],
                  success: function(res) {
                    var localIds = res.localIds;
                    wx.uploadImage({
                       localId: localIds[0],
                       isShowProgressTips: 1, // 默认为1，显示进度提示
                        success: function (res) {
                            var serverId = res.serverId; // 返回图片的服务器端ID
                            photo_upload_display(serverId);
                        }
                    })
                  }
                })
            }
        });
      })
      wx.error(function(res){
        alert(res.errMsg)
      })

    },function(err){

    })
  }; // function结束


  // 照相机的点击事件----------------------------------
  $scope.getPhoto = function() {
    // console.log("要拍照了！");
    $scope.takePicture();
    $scope.closePopover();
  };
  $scope.isShow=true;
  $scope.takePicture = function() {
      var config = "";
      var path = $location.absUrl().split('#')[0]
      wechat.settingConfig({url:path}).then(function(data){
        // alert(data.results.timestamp)
        config = data.results;
        config.jsApiList = ['chooseImage','uploadImage']
        // alert(config.jsApiList)
        // alert(config.debug)
        console.log(angular.toJson(config))
        wx.config({
          debug:false,
          appId:config.appId,
          timestamp:config.timestamp,
          nonceStr:config.nonceStr,
          signature:config.signature,
          jsApiList:config.jsApiList
        })
        wx.ready(function(){
          wx.checkJsApi({
              jsApiList: ['chooseImage','uploadImage'],
              success: function(res) {
                  wx.chooseImage({
                    count:1,
                    sizeType: ['original','compressed'],
                    sourceType: ['camera'],
                    success: function(res) {
                        var localIds = res.localIds;
                        wx.uploadImage({
                           localId: localIds[0],
                           isShowProgressTips: 1, // 默认为1，显示进度提示
                            success: function (res) {
                                var serverId = res.serverId; // 返回图片的服务器端ID
                                photo_upload_display(serverId);
                            }
                        })
                    }
                  })
              }
          });
        })
      wx.error(function(res){
        alert(res.errMsg)
      })

      },function(err){

      })
    }; // function结束



  //   $scope.openModal = function() {
  //     $scope.modal.show();
  //   };
  //   $scope.closeModal = function() {
  //     $scope.modal.hide();
  //   };
  //   //Cleanup the modal when we're done with it!
  //   $scope.$on('$destroy', function() {
  //     $scope.modal.remove();
  //   });
  //   // Execute action on hide modal
  //   $scope.$on('modal.hidden', function() {
  //     // Execute action
  //   });
  //   // Execute action on remove modal
  //   $scope.$on('modal.removed', function() {
  //     // Execute action
  //   });

  // //点击图片返回
  // $scope.imggoback = function(){
  //   $scope.modal.hide();
  // };
  $scope.showoriginal=function(resizedpath){
    // $scope.openModal();
    // console.log(resizedpath)
    var originalfilepath=resizedpath
    console.log(originalfilepath)
    // $scope.healthinfoimgurl=originalfilepath;
    $scope.imageHandle.zoomTo(1, true);
    $scope.imageUrl = originalfilepath;
    $scope.modal.show();
  }
  $scope.closeModal = function() {
      $scope.imageHandle.zoomTo(1, true);
      $scope.modal.hide();
      // $scope.modal.remove()
  };
  $scope.switchZoomLevel = function() {
      if ($scope.imageHandle.getScrollPosition().zoom != $scope.zoomMin)
          $scope.imageHandle.zoomTo(1, true);
      else {
          $scope.imageHandle.zoomTo(5, true);
      }
  }
  $scope.deleteimg=function(index){
    //somearray.removeByValue("tue");
    console.log($scope.health.imgurl)
    $scope.health.imgurl.splice(index, 1)
    // Storage.set('tempimgrul',angular.toJson($scope.images));
  }

  $scope.$on('$ionicView.leave', function() {
    $scope.modal.remove();
  })



  
}])




//增值服务--PXY
.controller('MoneyCtrl', ['$scope','$state','$ionicHistory','Account','Storage','Patient',function($scope, $state,$ionicHistory,Account,Storage,Patient) {
  // $scope.barwidth="width:0%";
  var PID = Storage.get('UID')
  var docid=""
  $scope.Goback = function(){
    $state.go('tab.mine')
  }
  // $scope.TimesRemain ="0";
  $scope.TimesRemainZX="0";
  $scope.TimesRemainWZ="0";
  $scope.freeTimesRemain ="0";
  //20170504 zxf
  var LoadMyAccount = function(){
    Account.getCounts({patientId:Storage.get('UID')}).then(
    function(data)
    {
        console.log(data);
      $scope.freeTimesRemain=data.result.freeTimes;
      // $scope.TimesRemain=data.result.totalCount;
    },
    function(err)
    {
      console.log(err);
    }
  );
  }
  //0515 zxf
  Account.getCountsRespective({patientId:Storage.get('UID')}).then(function(data){
    $scope.TimesRemainZX=data.result.count1;
    $scope.TimesRemainWZ=data.result.count2;
  },function(err){
    console.log(err);
  })
  
 $scope.$on('$ionicView.enter', function() {
      LoadMyAccount();
  })

 $scope.do_refresher = function(){
      LoadMyAccount();
      $scope.$broadcast("scroll.refreshComplete");

 }
}])

//消息中心--PXY
.controller('messageCtrl', ['$ionicPopup','Counsels','$q','$scope','$state','$ionicHistory','News','Storage','Doctor',function($ionicPopup,Counsels,$q,$scope, $state,$ionicHistory,News,Storage,Doctor) {
    //$scope.barwidth="width:0%";

    var getDocNamePhoto = function(sender,doctor){
        Doctor.getDoctorInfo({userId:sender}).then(
            function(data){
                if(data.results){
                    doctor.docName = data.results.name;
                    doctor.docPhoto = data.results.photoUrl;
                }
                        
            },function(err){
                console.log(err);
            });
            // return doctor;
    }
 
    var Lastnews = function(){
        var receiver = Storage.get('UID');
        News.getNews({userId:receiver,type:1}).then(
            function(data){
                if(data.results.length){
                    console.log(data.results);
                    $scope.pay = data.results[0];
                }
                
            },function(err){
                console.log(err);
            }
        );

        News.getNews({userId:receiver,type:2}).then(
            function(data){
                if(data.results.length){
                    console.log(data.results);
                    $scope.alert = data.results[0];
                }
            },function(err){
                console.log(err);
            }
        );

        News.getNews({userId:receiver,type:3}).then(
            function(data){
                if(data.results.length){
                    console.log(data.results);
                    $scope.task = data.results[0];
                }
            },function(err){
                console.log(err);
            }
        );

        News.getNews({userId:receiver,type:5}).then(
            function(data){
                if(data.results.length){
                    console.log(data.results);
                    $scope.insurance = data.results[0];
                }
            },function(err){
                console.log(err);
            }
        );


        News.getNewsByReadOrNot({userId:receiver,type:11,readOrNot:0}).then(
            function(data){
                console.log(data);
                if(data.results.length){

                    var mesFromDoc = new Array();
                    var singleMes = new Object();
                   
                    for(var x in data.results){
                       
                        getDocNamePhoto(data.results[x].sendBy,data.results[x]);

                    }
                }
                $scope.chats=data.results;
                    
                
            },function(err){
                console.log(err);
            }
        );
    }
     $scope.$on('$ionicView.enter', function() {
        Lastnews();
    })


    

    $scope.do_refresher = function(){
        Lastnews();
        $scope.$broadcast("scroll.refreshComplete");
    }


    
    


    $scope.Goback = function(){
        $state.go(Storage.get('messageBackState'));
      // $ionicHistory.goBack();
    }

    var SetRead = function(message){
        console.log(message);
        if(message.readOrNot==0){
            message.readOrNot = 1;
            News.insertNews(message).then(
                function(data){
                    console.log(data);
                    Lastnews();
                },function(err){
                    console.log(err);
                }
            );
        }
        
        
    }


    $scope.getConsultRecordDetail = function(chat) {
    var template="";
    var counseltype=0;
    var counselstatus='';
    var doctorId=chat.sendBy;
      
        //zz最新方法根据docid pid 不填写type获取最新一条咨询信息
        Counsels.getStatus({doctorId:doctorId,patientId:Storage.get('UID')})
        .then(function(data){
          console.log(data.result)
          console.log(data.result.type)
          console.log(data.result.status)
          if(data.result.type==1){
            if(data.result.status==1){//有尚未完成的咨询 直接进入
               $ionicPopup.confirm({
                  title:"咨询确认",
                  template:"您有尚未结束的咨询，点击确认可以查看历史消息，在医生完成三次问答之前，您还可以对您的问题作进一步的描述。",
                  okText:"确认",
                  cancelText:"取消"
              }).then(function(res){
                  if(res){counseltype
                      $state.go("tab.consult-chat",{chatId:doctorId,type:1,status:1}); //虽然传了type和status但不打算使用 byZYH
                  }

              })     
            }else{
              $ionicPopup.confirm({
                  title:"咨询确认",
                  template:"您的咨询已结束，点击确认可以查看历史消息，但是无法继续发送消息。",
                  okText:"确认",
                  cancelText:"取消"
              }).then(function(res){
                  if(res){counseltype
                      $state.go("tab.consult-chat",{chatId:doctorId,type:1,status:0}); //虽然传了type和status但不打算使用 byZYH
                  }

              }) 
            }
          }else if(data.result.type==2||data.result.type==3){
            if(data.result.status==1){//尚未结束的问诊
              $ionicPopup.confirm({
                  title:"问诊确认",
                  template:"您有尚未结束的问诊，点击确认可以查看历史消息，在医生结束该问诊之前您还可以对您的问题作进一步的描述。",
                  okText:"确认",
                  cancelText:"取消"
              }).then(function(res){
                  if(res){counseltype
                      $state.go("tab.consult-chat",{chatId:doctorId,type:data.result.type,status:1}); //虽然传了type和status但不打算使用 byZYH
                  }

              }) 
            }else{
              $ionicPopup.confirm({
                  title:"问诊确认",
                  template:"您的问诊已结束，点击确认可以查看历史消息，但是无法继续发送消息。",
                  okText:"确认",
                  cancelText:"取消"
              }).then(function(res){
                  if(res){counseltype
                      $state.go("tab.consult-chat",{chatId:doctorId,type:data.result.type,status:0}); //虽然传了type和status但不打算使用 byZYH
                  }

              })
            }
          }
        });
        // SetRead(chat);
      
    }

    $scope.getMessageDetail = function(message){
        console.log(message);
        Storage.set("getMessageType",message.type);
        $state.go('messagesDetail');
        SetRead(message);
    }
}])
//消息类型--PXY
.controller('VaryMessageCtrl', ['Doctor','News','$scope','Message','$state','$ionicHistory','Storage',function(Doctor,News,$scope, Message,$state,$ionicHistory,Storage) {
    $scope.notInsurance = true;
    var getDocNamePhoto = function(sender,doctor){
        Doctor.getDoctorInfo({userId:sender}).then(
            function(data){
                if(data.results){
                    doctor.docName = data.results.name;
                    doctor.docPhoto = data.results.photoUrl;

                }
                // console.log(doctor);
                        
            },function(err){
                console.log(err);
            });
            // return doctor;
    }
    var varyMessage = function(){
        console.log(Storage.get('getMessageType'));
        switch(Storage.get('getMessageType')){

            case '1':
                $scope.varyMes ={name:"支付",avatar:'payment.png'};
                console.log($scope.varyMes);
                break;
            case '2':
                $scope.varyMes ={name:"警报",avatar:'alert.png'};
                break;
            case '3':
                $scope.varyMes ={name:"任务",avatar:'task.png'};
                break;
            case '5':
                $scope.varyMes ={name:"保险"};
                $scope.notInsurance = false;
                break;

        }
        
        Message.getMessages({userId:Storage.get('UID'),type:Storage.get('getMessageType')}).then(
            function(data){
                
                if(data.results.length){
                    console.log(data.results);
                    if(Storage.get('getMessageType')==5){
                        for(var x in data.results){
                            getDocNamePhoto(data.results[x].sendBy,data.results[x]);
                        }
                        
                    }
                    $scope.messages = data.results;
                }

            },function(err){
                console.log(err);
            });

    }

    $scope.$on('$ionicView.enter', function() {
        varyMessage();
    })

    $scope.do_refresher = function(){
        varyMessage();
        News.getNewsByReadOrNot({userId:Storage.get('UID'),type:Storage.get('MessageType'),readOrNot:0}).then(
            function(data){
                if(data.results){
                    console.log(data.results);
                    if(data.results[0].readOrNot==0){
                        data.results[0].readOrNot=1;
                        News.insertNews(data.results[0]).then(
                            function(success){
                                console.log(success);
                            },function(err){
                                console.log(err);
                            }
                        );
                    }
                }
            },function(err){

            }

        );

        $scope.$broadcast("scroll.refreshComplete");
    }
   


    $scope.MoreMessageDetail = function(ele,doctorId,MessageType){
        if(MessageType==5){
            if(ele.target.nodeName =="IMG"){
            $state.go('tab.DoctorDetail',{DoctorId:doctorId});
            }else{
                $state.go('insurance');
            }

        }
        
    }
    // var messageType = Storage.get("getMessageType")
    // $scope.messages=angular.fromJson(Storage.get("allMessages"))[messageType]
    // console.log($scope.messages)

    // if(messageType=='ZF')
    //     $scope.avatar='payment.png'
    // else if(messageType=='JB')
    //     $scope.avatar='alert.png'
    // else if(messageType=='RW')
    //     $scope.avatar='task.png'
    // else if(messageType=='BX')
    //     $scope.avatar='security.png'

    $scope.Goback = function(){
        $ionicHistory.goBack();
    }

  
}])

//医生列表--PXY
.controller('DoctorCtrl', ['Storage','$ionicLoading','$scope','$state','$ionicPopup','$ionicHistory','Dict','Patient','$location','Doctor','Counsels','wechat','order','Account','$http','CONFIG','payment','$filter','Expense','$q',function(Storage,$ionicLoading,$scope, $state,$ionicPopup,$ionicHistory,Dict,Patient,$location,Doctor,Counsels,wechat,order,Account,$http,CONFIG,payment,$filter,Expense,$q) {
  //$scope.barwidth="width:0%";
  $scope.Goback = function(){
    $state.go('tab.myDoctors');
    // $ionicHistory.goBack();
  }
  //清空搜索框
  $scope.searchCont = {};

  $scope.clearSearch = function(){ 
    $scope.searchCont = {};  
    //清空之后获取所有医生 
    ChangeSearch();

  }  

 
    $scope.Provinces={};
    $scope.Cities={};
    // $scope.Districts={};
    $scope.Hospitals={};

    $scope.doctors = [];
    $scope.doctor = "";
    $scope.moredata=true;

    var pagecontrol = {skip:0,limit:10};
    var alldoctors = new Array();



    $scope.loadMore=function(params){
          // $scope.$apply(function() {
        if(!params){
            params={province:"",city:"",workUnit:"",name:""};
        }
        console.log(params);
         Patient.getDoctorLists({skip:pagecontrol.skip,limit:pagecontrol.limit,province:params.province,city:params.city,workUnit:params.workUnit,name:params.name})
                  .then(function(data){
                    console.log(data.results);
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                    
                    alldoctors=alldoctors.concat(data.results);
                    $scope.doctors=alldoctors;
                    if(alldoctors.length==0){
                        console.log("aaa")
                        $ionicLoading.show({ 
                            template: '没有医生', duration: 1000 
                        })
                    }
                    // $scope.nexturl=data.nexturl;
                     var skiploc=data.nexturl.indexOf('skip');
                    pagecontrol.skip=data.nexturl.substring(skiploc+5);
                    console.log(pagecontrol.skip);
                    if(data.results.length<pagecontrol.limit){$scope.moredata=false}else{$scope.moredata=true};
                  },function(err){
                      console.log(err);
                  })
          // });
       }

    var ChangeSearch = function(){
        pagecontrol = {skip:0,limit:10};
        alldoctors = new Array();
        // console.log($scope.Province);
        var _province = ($scope.Province&&$scope.Province.province)? $scope.Province.province.name:"";
        var _city = ($scope.City&&$scope.City.city)? $scope.City.city.name:"";
        // var _district = ($scope.District&&$scope.District.district)? $scope.District.district.name:"";
        // console.log($scope.Hospital);
        var _hospital = ($scope.Hospital&&$scope.Hospital.hospitalName)? $scope.Hospital.hospitalName.hospitalName:"";
        console.log(_hospital);
        var params = {province:_province,city:_city,workUnit:_hospital,name:($scope.searchCont.t||"")};
        $scope.loadMore(params);
    }


    $scope.search = function(){
        // console.log("清空了");
        ChangeSearch();
    } 

    Dict.getDistrict({level:"1",province:"",city:""}).then(
      function(data)
      {
        $scope.Provinces = data.results;
        // $scope.Province.province = "";
        // console.log($scope.Provinces)
      },
      function(err)
      {
        console.log(err);
      }
    )

  $scope.getCity = function (province) {
    console.log(province)
    if(province!=null){
        Dict.getDistrict({level:"2",province:province.province,city:""}).then(
          function(data)
          {
            $scope.Cities = data.results;
            // console.log($scope.Cities);
            
          },
          function(err)
          {
            console.log(err);
          }
        );
    }else{
        $scope.Cities = {};
        // $scope.Districts ={};
        $scope.Hospitals = {};
    }
    
    $scope.City = "";
    $scope.Hospital = "";
    ChangeSearch();
  }
  
 

  $scope.getHospital = function (province,city) {
    console.log(city);
    if(city!=null){
        
    Dict.getHospital({province: province.name,city:city.name}).then(
      function(data)
      {
        $scope.Hospitals = data.results;

        // console.log($scope.Hospitals);

        // var params = {province:province.name,city:city.name,district:district.name,hospital:"",name:($scope.searchCont.t||"")};
        // initialSearch();
        // $scope.loadMore(params);

        // Patient.getDoctorLists({province:province.name,city:city.name,district:district.name}).then(
        //     function(data){
        //         console.log(data.results);
        //         $scope.doctors = data.results;
        //     },function(err){
        //         console.log(err);
        //     })
      },
      function(err)
      {
        console.log(err);
      }
    )
    }else{
        $scope.Hospitals = {};
    }
    
    $scope.Hospital = "";
    ChangeSearch();
    // console.log($scope.Hospital)
    

    
  }
  
  $scope.getDoctorByHospital = function (hospital) {
        
     ChangeSearch();
  }


  $scope.allDoctors = function(){
    $state.go('tab.AllDoctors');
  }

  $scope.consultable=1;
  var chargemoney = 0;
  $scope.question = function(DoctorId,docname,doctor){
      Counsels.getStatus({doctorId:DoctorId,patientId:Storage.get('UID')})
      .then(function(data){
        //zxf 判断条件重写
        if(data.result!="请填写咨询问卷!"&&data.result.status==1){//有尚未完成的咨询或者问诊
          if(data.result.type==1){
            if($scope.consultable==1){
              $scope.consultable=0  
              $ionicPopup.confirm({
                title:"咨询确认",
                template:"您有尚未结束的咨询，点击确认继续上一次咨询！",
                okText:"确认",
                cancelText:"取消"
              }).then(function(res){
                  if(res){
                    $scope.consultable=1
                    $state.go("tab.consult-chat",{chatId:DoctorId,type:1,status:1});
                  }else{
                    $scope.consultable=1
                  }
              })
            }
          }else{
            if($scope.consultable==1){
              $scope.consultable=0  
              $ionicPopup.confirm({
                title:"咨询确认",
                template:"您有尚未结束的问诊，点击确认继续上一次问诊！",
                okText:"确认",
                cancelText:"取消"
              }).then(function(res){
                  if(res){
                    $scope.consultable=1
                    $state.go("tab.consult-chat",{chatId:DoctorId,type:data.result.type,status:1});
                  }else{
                    $scope.consultable=1
                  }

              })
            }
          }
        }else{//没有进行中的问诊咨询 查看是否已经付过费
          // console.log("fj;akfmasdfzjl")
          Account.getCounts({patientId:Storage.get('UID'),doctorId:DoctorId}).then(function(data){
          console.log(data.result.freeTimes)
          if(data.result.count==999){//上次有购买问诊 但是没有新建问诊
            if($scope.consultable==1){
              $scope.consultable=0
              $ionicPopup.confirm({
                title:"咨询确认",
                template:"您上次付费的问诊尚未新建成功，点击确认继续填写完善上次的咨询问卷，进入问诊后，您询问该医生的次数不限，最后由医生结束此次问诊，请尽可能在咨询问卷以及问诊过程中详细描述病情和需求。",
                okText:"确认",
                cancelText:"取消"
              }).then(function(res){
                if(res){
                  $scope.consultable=1
                  $state.go("tab.consultquestion1",{DoctorId:DoctorId,counselType:2});
                }else{
                  $scope.consultable=1
                }
              })
            }
          }else if(data.result.count==3){
            if($scope.consultable==1){
              $scope.consultable=0
              $ionicPopup.confirm({
                title:"咨询确认",
                template:"您上次付费的咨询尚未新建成功，点击确认继续填写完善上次的咨询问卷，进入咨询后，根据您提供的问卷描述，医生会最多作三次回答，之后此次咨询自动结束，请谨慎组织语言，尽可能在咨询问卷以及咨询过程中详细描述病情和需求。",
                okText:"确认",
                cancelText:"取消"
              }).then(function(res){
                if(res){
                  $scope.consultable=1
                  $state.go("tab.consultquestion1",{DoctorId:DoctorId,counselType:1});
                }else{
                  $scope.consultable=1
                }
              })
            }
          }else if(data.result.freeTimes>0){//判断是否已经花过钱了，花过但是还没有新建咨询成功 那么跳转问卷
            if($scope.consultable==1){
              $scope.consultable=0
              $ionicPopup.confirm({
                title:"咨询确认",
                template:"您还有剩余免费咨询次数，进入咨询后，根据您提供的问卷描述，医生会最多作三次回答，之后此次咨询自动结束，请谨慎组织语言，尽可能在咨询问卷以及咨询过程中详细描述病情和需求。点击确认进入免费咨询",
                okText:"确认",
                cancelText:"取消"
              }).then(function(res){
                if(res){
                  $scope.consultable=1
                  // var tempresult = []
                  // var temperr = []
                  $q.all([
                      Account.updateFreeTime({patientId:Storage.get('UID')}).then(function(data){//免费咨询次数减一 count+3
                        console.log(data)
                      },function(err){
                        console.log(err)
                      }),
                      Account.modifyCounts({patientId:Storage.get('UID'),doctorId:DoctorId,modify:3}).then(function(data){
                        console.log(data)
                      },function(err){
                        console.log(err)
                      }),
                      Expense.rechargeDoctor({patientId:Storage.get('UID'),doctorId:DoctorId,type:'咨询',doctorName:docname,money:0}).then(function(data){
                        console.log(data)
                      },function(err){
                        console.log(err)
                      })
                  ]).then(function(){
                    $state.go("tab.consultquestion1",{DoctorId:DoctorId,counselType:1});
                  })
                  //免费咨询次数减一 count+3
                  // Account.updateFreeTime({patientId:Storage.get('UID')}).then(function(data){
                  //   Account.modifyCounts({patientId:Storage.get('UID'),doctorId:DoctorId,modify:3}).then(function(data){
                  //     console.log(data)
                  //   },function(err){
                  //     console.log(err)
                  //   })
                  //   Expense.rechargeDoctor({patientId:Storage.get('UID'),doctorId:DoctorId,type:'咨询',doctorName:docname,money:0}).then(function(data){
                  //     console.log(data)
                  //   },function(err){
                  //     console.log(err)
                  //   })
                  // },function(err){
                  //   console.log(err)
                  // })
                  // $state.go("tab.consultquestion1",{DoctorId:DoctorId,counselType:1});
                }else{
                  $scope.consultable=1
                }
              })
            }
          }else{
            if($scope.consultable==1){
              $scope.consultable=0
              $ionicPopup.confirm({//没有免费也没有回答次数 交钱 充值 加次数
                title:"咨询确认",
                template:"进入咨询后，根据您提供的问卷描述，医生会最多作三次回答，之后此次咨询自动结束，请谨慎组织语言，尽可能在咨询问卷以及咨询过程中详细描述病情和需求。确认付费咨询？",
                okText:"确认",
                cancelText:"取消"
              }).then(function(res){
                if(res){
                  $scope.consultable=1
                  var time = new Date()
                  time =  $filter("date")(time, "yyyy-MM-dd HH:mm:ss");
                  var neworder = {
                      "userId":Storage.get('UID'),
                      "role":"patient",
                      "money":doctor.charge1*100,
                      "class":"01",
                      "name":"咨询",
                      "notes":DoctorId,
                      "paystatus":1,
                      "paytime":time,
                      "openid":Storage.get('messageopenid'),
                      "trade_type":"JSAPI"
                                // userId:Storage.get('UID'),
                                // money:doctor.charge1*100,
                                // goodsInfo:{
                                //   class:'01',
                                //   name:'咨询',
                                //   notes:DoctorId
                                // },
                                // paystatus:0,
                                // paytime:time
                  }
                  payment.payment(neworder).then(function(data){
                    console.log(data) //data.errMsg:"chooseWXPay:ok"时支付成功
                    if (data.errMsg == "chooseWXPay:ok")
                    {
                      chargemoney = doctor.charge1
                      // var tempresult = []
                      // var temperr = []
                      $q.all([
                          Expense.rechargeDoctor({patientId:Storage.get('UID'),doctorId:DoctorId,type:'咨询',doctorName:docname,money:chargemoney}).then(function(data){
                            console.log(data)
                          },function(err){
                            console.log(err)
                          }),
                          //plus doc answer count  patientId:doctorId:modify
                          Account.modifyCounts({patientId:Storage.get('UID'),doctorId:DoctorId,modify:3}).then(function(data){
                            console.log(data)
                          },function(err){
                            console.log(err)
                          })
                      ]).then(function(){
                        $state.go("tab.consultquestion1",{DoctorId:DoctorId,counselType:1});
                      })
                      // Expense.rechargeDoctor({patientId:Storage.get('UID'),doctorId:DoctorId,type:'咨询',doctorName:docname,money:chargemoney}).then(function(data){
                      //   console.log(data)
                      // },function(err){
                      //   console.log(err)
                      // })
                      // //plus doc answer count  patientId:doctorId:modify
                      // Account.modifyCounts({patientId:Storage.get('UID'),doctorId:DoctorId,modify:3}).then(function(data){
                      //   console.log(data)
                      // },function(err){
                      //   console.log(err)
                      // })
                      // $state.go("tab.consultquestion1",{DoctorId:DoctorId,counselType:1});
                    }
                    else{
                      $ionicLoading.show({ 
                          template: '付款失败，请重新支付！', duration: 2000 
                      });
                    }
                  },function(err){
                    console.log(err)
                  })
                }else{
                  $scope.consultable=1
                }
              })
            }
          }
          // }
        },function(err){
          console.log(err)
        })
      }
    },function(err){
      console.log(err)
    })
  }

  $scope.consult = function(DoctorId,docname,doctor){
    Counsels.getStatus({doctorId:DoctorId,patientId:Storage.get('UID')})
    .then(function(data){
      //zxf 判断条件重写
      if(data.result!="请填写咨询问卷!"&&data.result.status==1){//有尚未完成的咨询或者问诊
        if(data.result.type==1){//咨询转问诊
          if($scope.consultable==1){
            $scope.consultable=0
            $ionicPopup.confirm({
              title:"问诊确认",
              template:"您有尚未结束的咨询，补齐差价可升级为问诊，问诊中询问医生的次数不限。确认付费升级为问诊？",
              okText:"确认",
              cancelText:"取消"
            }).then(function(res){
              if (res)
              {
                $scope.consultable=1
                var time = new Date()
                time =  $filter("date")(time, "yyyy-MM-dd HH:mm:ss");
                var neworder = {
                    "userId":Storage.get('UID'),
                    "role":"patient",
                    "money":doctor.charge2*100 - doctor.charge1*100,
                    "class":"03",
                    "name":"升级",
                    "notes":DoctorId,
                    "paystatus":1,
                    "paytime":time,
                    "openid":Storage.get('messageopenid'),
                    "trade_type":"JSAPI"
                              // userId:Storage.get('UID'),
                              // money:doctor.charge2*100 - doctor.charge1*100,
                              // goodsInfo:{
                              //   class:'03',
                              //   name:'升级',
                              //   notes:DoctorId
                              // },
                              // paystatus:0,
                              // paytime:time
                }
                payment.payment(neworder).then(function(data){
                  console.log(data) //data.errMsg:"chooseWXPay:ok"时支付成功
                  if (data.errMsg == "chooseWXPay:ok")
                  {
                    chargemoney = doctor.charge2 - doctor.charge1
                    Counsels.changeType({doctorId:DoctorId,patientId:Storage.get('UID'),type:1,changeType:"true"}).then(function(data){
                      console.log(data.result)
                      if(data.result=="修改成功"){
                        //确认新建咨询之后 给医生账户转积分 其他新建都在最后提交的时候转账 但是升级是在这里完成转账
                        //chargedoc
                        // var tempresult = []
                        // var temperr = []
                        $q.all([
                            Expense.rechargeDoctor({patientId:Storage.get('UID'),doctorId:DoctorId,type:'升级',doctorName:docname,money:chargemoney}).then(function(data){
                              console.log(data)
                            },function(err){
                              console.log(err)
                            }),
                            //plus doc answer count  patientId:doctorId:modify
                            Account.modifyCounts({patientId:Storage.get('UID'),doctorId:DoctorId,modify:999}).then(function(data){
                              console.log(data)
                            },function(err){
                              console.log(err)
                            })
                        ]).then(function(){
                          var msgJson={
                              contentType:'custom',
                              fromName:'',
                              fromID:Storage.get('UID'),
                              fromUser:{
                                  avatarPath:CONFIG.mediaUrl+'uploads/photos/resized'+Storage.get('UID')+'_myAvatar.jpg'
                              },
                              targetID:id,
                              targetName:'',
                              targetType:'single',
                              status:'send_going',
                              createTimeInMillis: Date.now(),
                              newsType:'11',
                              content:{
                                  type:'counsel-upgrade',
                              }
                          }
                          socket.emit('newUser',{user_name:Storage.get('UID'),user_id:Storage.get('UID')});
                          socket.emit('message',{msg:msgJson,to:id,role:'patient'});
                          socket.on('messageRes',function(data){
                            socket.off('messageRes');
                            socket.emit('disconnect');
                            $state.go("tab.consult-chat",{chatId:id,type:3,status:1}); 
                          })
                        })
                        // Expense.rechargeDoctor({patientId:Storage.get('UID'),doctorId:DoctorId,type:'升级',doctorName:docname,money:chargemoney}).then(function(data){
                        //   console.log(data)
                        // },function(err){
                        //   console.log(err)
                        // })
                        // //plus doc answer count  patientId:doctorId:modify
                        // Account.modifyCounts({patientId:Storage.get('UID'),doctorId:DoctorId,modify:999}).then(function(data){
                        //   console.log(data)
                        // },function(err){
                        //   console.log(err)
                        // })
                        // var msgJson={
                        //     contentType:'custom',
                        //     fromName:'',
                        //     fromID:Storage.get('UID'),
                        //     fromUser:{
                        //         avatarPath:CONFIG.mediaUrl+'uploads/photos/resized'+Storage.get('UID')+'_myAvatar.jpg'
                        //     },
                        //     targetID:id,
                        //     targetName:'',
                        //     targetType:'single',
                        //     status:'send_going',
                        //     createTimeInMillis: Date.now(),
                        //     newsType:'11',
                        //     content:{
                        //         type:'counsel-upgrade',
                        //     }
                        // }
                        // socket.emit('newUser',{user_name:Storage.get('UID'),user_id:Storage.get('UID')});
                        // socket.emit('message',{msg:msgJson,to:id,role:'patient'});
                        // socket.on('messageRes',function(data){
                        //   socket.off('messageRes');
                        //   socket.emit('disconnect');
                        //   $state.go("tab.consult-chat",{chatId:id,type:3,status:1}); 
                        // })
                      }
                    },function(err)
                    {
                        console.log(err)
                    })
                  }
                  else{
                    $ionicLoading.show({ 
                        template: '付款失败，请重新支付！', duration: 2000 
                    });
                  }
                  },function(err){
                  console.log(err)
                })
              }else{
                  $scope.consultable=1
              }
            })
          }
        }else{
          if($scope.consultable==1){
              $scope.consultable=0
              $ionicPopup.confirm({
                title:"问诊确认",
                template:"您有尚未结束的问诊，点击确认继续上一次问诊！",
                okText:"确认",
                cancelText:"取消"
              }).then(function(res){
                  if(res){
                    $scope.consultable=1
                    $state.go("tab.consult-chat",{chatId:DoctorId,type:data.result.type,status:1});
                  }else{
                    $scope.consultable=1
                  }
              })
            }
          }
        }else{//没有进行中的问诊咨询 查看是否已经付过费
          Account.getCounts({patientId:Storage.get('UID'),doctorId:DoctorId}).then(function(data){
            console.log(data.result.count)
            if(data.result.count==999){//上次有购买问诊 但是没有新建问诊
              if($scope.consultable==1){
                $scope.consultable=0
                $ionicPopup.confirm({
                  title:"问诊确认",
                  template:"您上次付费的问诊尚未新建成功，点击确认继续填写完善上次的咨询问卷，进入问诊后，您询问该医生的次数不限，最后由医生结束此次问诊，请尽可能在咨询问卷以及问诊过程中详细描述病情和需求。",
                  okText:"确认",
                  cancelText:"取消"
                }).then(function(res){
                  if(res){
                    $scope.consultable=1
                    $state.go("tab.consultquestion1",{DoctorId:DoctorId,counselType:2});
                  }else{
                    $scope.consultable=1
                  }
                })
              }
            }else if(data.result.count==3){//已经付费的咨询 但是没有开始 
              if($scope.consultable==1){
                $scope.consultable=0
                $ionicPopup.confirm({
                  title:"问诊确认",
                  template:"您上次付费的咨询尚未新建成功，补齐差价可升级为问诊，进入问诊后，您询问该医生的次数不限，最后由医生结束此次问诊，请尽可能在咨询问卷以及问诊过程中详细描述病情和需求。确认付费升级为问诊？",
                  okText:"确认",
                  cancelText:"取消"
                }).then(function(res){
                  if(res){
                    $scope.consultable=1
                    var time = new Date()
                    time =  $filter("date")(time, "yyyy-MM-dd HH:mm:ss");
                    var neworder = {
                        "userId":Storage.get('UID'),
                        "role":"patient",
                        "money":doctor.charge2*100 - doctor.charge1*100,
                        "class":"03",
                        "name":"升级",
                        "notes":DoctorId,
                        "paystatus":1,
                        "paytime":time,
                        "openid":Storage.get('messageopenid'),
                        "trade_type":"JSAPI"
                                  // userId:Storage.get('UID'),
                                  // money:doctor.charge2*100 - doctor.charge1*100,
                                  // goodsInfo:{
                                  //   class:'03',
                                  //   name:'升级',
                                  //   notes:DoctorId
                                  // },
                                  // paystatus:0,
                                  // paytime:time
                    }
                    payment.payment(neworder).then(function(data){
                      console.log(data) //data.errMsg:"chooseWXPay:ok"时支付成功
                      if (data.errMsg == "chooseWXPay:ok")
                      {
                        chargemoney = doctor.charge2 - doctor.charge1
                        // var tempresult = []
                        // var temperr = []
                        $q.all([
                            Expense.rechargeDoctor({patientId:Storage.get('UID'),doctorId:DoctorId,type:'升级',doctorName:docname,money:chargemoney}).then(function(data){
                              console.log(data)
                            },function(err){
                              console.log(err)
                            }),
                            //plus doc answer count  patientId:doctorId:modify
                            Account.modifyCounts({patientId:Storage.get('UID'),doctorId:DoctorId,modify:999}).then(function(data){
                              console.log(id+Storage.get('UID'))
                              console.log(data)
                            },function(err){
                              console.log(err)
                            })
                        ]).then(function(){
                          $state.go("tab.consultquestion1",{DoctorId:DoctorId,counselType:2});//这里的type是2不是3 因为还没有新建成功，
                        }) 
                        // Expense.rechargeDoctor({patientId:Storage.get('UID'),doctorId:DoctorId,type:'升级',doctorName:docname,money:chargemoney}).then(function(data){
                        //   console.log(data)
                        // },function(err){
                        //   console.log(err)
                        // })
                        // //plus doc answer count  patientId:doctorId:modify
                        // Account.modifyCounts({patientId:Storage.get('UID'),doctorId:DoctorId,modify:999}).then(function(data){
                        //   console.log(id+Storage.get('UID'))
                        //   console.log(data)
                        // },function(err){
                        //   console.log(err)
                        // })
                        // $state.go("tab.consultquestion1",{DoctorId:DoctorId,counselType:2});//这里的type是2不是3 因为还没有新建成功，
                      }
                      else{
                        $ionicLoading.show({ 
                            template: '付款失败，请重新支付！', duration: 2000 
                        });
                      }
                        },function(err){
                        console.log(err)
                      })
                  }else{
                      $scope.consultable=1
                  }
                })
              }
            }else{
              if($scope.consultable==1){
                $scope.consultable=0
                $ionicPopup.confirm({//没有免费也没有回答次数 交钱 充值 加次数
                  title:"问诊确认",
                  template:"进入问诊后，您询问该医生的次数不限，最后由医生结束此次问诊，请尽可能在咨询问卷以及问诊过程中详细描述病情和需求。确认付费问诊？",
                  okText:"确认",
                  cancelText:"取消"
                }).then(function(res){
                  if(res){
                    $scope.consultable=1
                    var time = new Date()
                    time =  $filter("date")(time, "yyyy-MM-dd HH:mm:ss");
                    var neworder = {
                        "userId":Storage.get('UID'),
                        "role":"patient",
                        "money":doctor.charge2*100,
                        "class":"02",
                        "name":"问诊",
                        "notes":DoctorId,
                        "paystatus":1,
                        "paytime":time,
                        "openid":Storage.get('messageopenid'),
                        "trade_type":"JSAPI"
                                  // userId:Storage.get('UID'),
                                  // money:doctor.charge2*100,
                                  // goodsInfo:{
                                  //   class:'02',
                                  //   name:'问诊',
                                  //   notes:DoctorId
                                  // },
                                  // paystatus:0,
                                  // paytime:time
                    }
                    payment.payment(neworder).then(function(data){
                      console.log(data) //data.errMsg:"chooseWXPay:ok"时支付成功
                      if (data.errMsg == "chooseWXPay:ok")
                      {
                        chargemoney = doctor.charge2
                        // var tempresult = []
                        // var temperr = []
                        $q.all([
                            Expense.rechargeDoctor({patientId:Storage.get('UID'),doctorId:DoctorId,type:'问诊',doctorName:docname,money:chargemoney}).then(function(data){
                              console.log(data)
                            },function(err){
                              console.log(err)
                            }),
                            //plus doc answer count  patientId:doctorId:modify
                            Account.modifyCounts({patientId:Storage.get('UID'),doctorId:DoctorId,modify:999}).then(function(data){
                              console.log(data)
                            },function(err){
                              console.log(err)
                            })
                        ]).then(function(){
                          $state.go("tab.consultquestion1",{DoctorId:DoctorId,counselType:2});
                        }) 
                        // Expense.rechargeDoctor({patientId:Storage.get('UID'),doctorId:DoctorId,type:'问诊',doctorName:docname,money:chargemoney}).then(function(data){
                        //   console.log(data)
                        // },function(err){
                        //   console.log(err)
                        // })
                        // //plus doc answer count  patientId:doctorId:modify
                        // Account.modifyCounts({patientId:Storage.get('UID'),doctorId:DoctorId,modify:2}).then(function(data){
                        //   console.log(data)
                        // },function(err){
                        //   console.log(err)
                        // })
                        // $state.go("tab.consultquestion1",{DoctorId:DoctorId,counselType:2});
                      }
                      else{
                        $ionicLoading.show({ 
                            template: '付款失败，请重新支付！', duration: 2000 
                        });
                      }
                    },function(err){
                      console.log(err)
                    })
                  }else{
                      $scope.consultable=1
                  }
                })
              }
            }
          },function(err){
            console.log(err)
          })
        }
      },function(err){
        console.log(err)
      })
    
  }

  $scope.getDoctorDetail = function(id) {
    $state.go('tab.DoctorDetail',{DoctorId:id});
  }


   var RealDoctor = function(arr){
        var result =[];
        var hash ={};
        for(var i =arr.length-1; i>=0; i--){
            if(arr[i].invalidFlag==0){

            }
            var elem = arr[i].doctorId.userId;
            if(!hash[elem]){
                result.push(arr[i]);
                hash[elem] = true;
            }
        }
        return result;
    }


  
  //获取我的主管医生信息

  Patient.getMyDoctors({userId:Storage.get('UID')}).then(function(data){


        console.log(data.results.doctorId);
        if(data.results.doctorId==undefined){
          console.log(111)
          $scope.hasDoctor = false;
          if($ionicHistory.currentView().stateName=='tab.myDoctors'){
            $ionicLoading.show({ 
              template: '没有绑定的医生', duration: 1000 
          });
          }
          
        }
        else{
          $scope.hasDoctor = true;
          $scope.doctor = data.results.doctorId;
        }
  },function(err){
      console.log(err);
  })



}])


.controller('DoctorDetailCtrl', ['$ionicPopup','$scope','$state','$ionicHistory','$stateParams','$stateParams','Doctor','Counsels','Storage','Account','payment','$filter','$ionicLoading','CONFIG','Expense','$q',function($ionicPopup,$scope, $state,$ionicHistory,$stateParams,$stateParams,Doctor,Counsels,Storage,Account,payment,$filter,$ionicLoading,CONFIG,Expense,$q) {
  $scope.Goback = function(){
    $ionicHistory.goBack();
  }
  var DoctorId = $stateParams.DoctorId;
  console.log(DoctorId);

  $scope.doctor = "";
  Doctor.getDoctorInfo({userId:DoctorId}).then(
      function(data)
      {
        $scope.doctor = data.results
        console.log($scope.doctor)
      },
      function(err)
      {
        console.log(err);
      }
    )
  var chargemoney = 0;
  $scope.consultable=1
   $scope.question = function(DoctorId,docname,doctor){
    Counsels.getStatus({doctorId:DoctorId,patientId:Storage.get('UID')})
      .then(function(data){
        //zxf 判断条件重写
        if(data.result!="请填写咨询问卷!"&&data.result.status==1){//有尚未完成的咨询或者问诊
          if(data.result.type==1){
            if($scope.consultable==1){
              $scope.consultable=0
              $ionicPopup.confirm({
                title:"咨询确认",
                template:"您有尚未结束的咨询，点击确认继续上一次咨询！",
                okText:"确认",
                cancelText:"取消"
              }).then(function(res){
                  if(res){
                    $scope.consultable=1
                    $state.go("tab.consult-chat",{chatId:DoctorId,type:1,status:1});
                  }else{
                    $scope.consultable=1
                  }
              })
            }
          }else{
            if($scope.consultable==1){
              $scope.consultable=0
              $ionicPopup.confirm({
                title:"咨询确认",
                template:"您有尚未结束的问诊，点击确认继续上一次问诊！",
                okText:"确认",
                cancelText:"取消"
              }).then(function(res){
                  if(res){
                    $scope.consultable=1
                    $state.go("tab.consult-chat",{chatId:DoctorId,type:data.result.type,status:1});
                  }else{
                    $scope.consultable=1
                  }

              })
            }
          }
        }else{//没有进行中的问诊咨询 查看是否已经付过费
          // console.log("fj;akfmasdfzjl")
          Account.getCounts({patientId:Storage.get('UID'),doctorId:DoctorId}).then(function(data){
          console.log(data.result.freeTimes)
          if(data.result.count==999){//上次有购买问诊 但是没有新建问诊
            if($scope.consultable==1){
              $scope.consultable=0
              $ionicPopup.confirm({
                title:"咨询确认",
                template:"您上次付费的问诊尚未新建成功，点击确认继续填写完善上次的咨询问卷，进入问诊后，您询问该医生的次数不限，最后由医生结束此次问诊，请尽可能在咨询问卷以及问诊过程中详细描述病情和需求。",
                okText:"确认",
                cancelText:"取消"
              }).then(function(res){
                if(res){
                  $scope.consultable=1
                  $state.go("tab.consultquestion1",{DoctorId:DoctorId,counselType:2});
                }else{
                  $scope.consultable=1
                }
              })
            }
          }else if(data.result.count==3){
            if($scope.consultable==1){
              $scope.consultable=0
              $ionicPopup.confirm({
                title:"咨询确认",
                template:"您上次付费的咨询尚未新建成功，点击确认继续填写完善上次的咨询问卷，进入咨询后，根据您提供的问卷描述，医生会最多作三次回答，之后此次咨询自动结束，请谨慎组织语言，尽可能在咨询问卷以及咨询过程中详细描述病情和需求。",
                okText:"确认",
                cancelText:"取消"
              }).then(function(res){
                if(res){
                  $scope.consultable=1
                  $state.go("tab.consultquestion1",{DoctorId:DoctorId,counselType:1});
                }else{
                  $scope.consultable=1
                }
              })
            }
          }else if(data.result.freeTimes>0){//判断是否已经花过钱了，花过但是还没有新建咨询成功 那么跳转问卷
            if($scope.consultable==1){
              $scope.consultable=0
              $ionicPopup.confirm({
                title:"咨询确认",
                template:"您还有剩余免费咨询次数，进入咨询后，根据您提供的问卷描述，医生会最多作三次回答，之后此次咨询自动结束，请谨慎组织语言，尽可能在咨询问卷以及咨询过程中详细描述病情和需求。点击确认进入免费咨询",
                okText:"确认",
                cancelText:"取消"
              }).then(function(res){
                if(res){
                  $scope.consultable=1
                  Expense.rechargeDoctor({patientId:Storage.get('UID'),doctorId:DoctorId,type:'咨询',doctorName:docname,money:0}).then(function(data){
                    console.log(data)
                  },function(err){
                    console.log(err)
                  })
                  //免费咨询次数减一 count+3
                  Account.updateFreeTime({patientId:Storage.get('UID')}).then(function(data){
                    Account.modifyCounts({patientId:Storage.get('UID'),doctorId:DoctorId,modify:3}).then(function(data){
                      console.log(data)
                    },function(err){
                      console.log(err)
                    })
                  },function(err){
                    console.log(err)
                  })
                  $state.go("tab.consultquestion1",{DoctorId:DoctorId,counselType:1});
                }else{
                  $scope.consultable=1
                }
              })
            }
          }else{
            if($scope.consultable==1){
              $scope.consultable=0
            $ionicPopup.confirm({//没有免费也没有回答次数 交钱 充值 加次数
              title:"咨询确认",
              template:"进入咨询后，根据您提供的问卷描述，医生会最多作三次回答，之后此次咨询自动结束，请谨慎组织语言，尽可能在咨询问卷以及咨询过程中详细描述病情和需求。确认付费咨询？",
              okText:"确认",
              cancelText:"取消"
            }).then(function(res){
              if(res){
                $scope.consultable=1
                var time = new Date()
                time =  $filter("date")(time, "yyyy-MM-dd HH:mm:ss");
                var neworder = {
                    "userId":Storage.get('UID'),
                    "role":"patient",
                    "money":doctor.charge1*100,
                    "class":"01",
                    "name":"咨询",
                    "notes":DoctorId,
                    "paystatus":1,
                    "paytime":time,
                    "openid":Storage.get('messageopenid'),
                    "trade_type":"JSAPI"
                              // userId:Storage.get('UID'),
                              // money:$scope.doctor.charge1*100,
                              // goodsInfo:{
                              //   class:'01',
                              //   name:'咨询',
                              //   notes:DoctorId
                              // },
                              // paystatus:0,
                              // paytime:time
                }
                payment.payment(neworder).then(function(data){
                  console.log(data) //data.errMsg:"chooseWXPay:ok"时支付成功
                  if (data.errMsg == "chooseWXPay:ok")
                  {
                    chargemoney = doctor.charge1
                    Expense.rechargeDoctor({patientId:Storage.get('UID'),doctorId:DoctorId,type:'咨询',doctorName:docname,money:chargemoney}).then(function(data){
                      console.log(data)
                    },function(err){
                      console.log(err)
                    })
                    //plus doc answer count  patientId:doctorId:modify
                    Account.modifyCounts({patientId:Storage.get('UID'),doctorId:DoctorId,modify:3}).then(function(data){
                      console.log(data)
                    },function(err){
                      console.log(err)
                    })
                    $state.go("tab.consultquestion1",{DoctorId:DoctorId,counselType:1});
                  }
                  else{
                    $ionicLoading.show({ 
                        template: '付款失败，请重新支付！', duration: 2000 
                    });
                  }
                },function(err){
                  console.log(err)
                })
              }else{
                  $scope.consultable=1
              }
            })
          }
          }
          // }
        },function(err){
          console.log(err)
        })
      }
    },function(err){
      console.log(err)
    })
  }

  $scope.consult = function(DoctorId,docname,doctor){
    Counsels.getStatus({doctorId:DoctorId,patientId:Storage.get('UID')})
      .then(function(data){
        //zxf 判断条件重写
        if(data.result!="请填写咨询问卷!"&&data.result.status==1){//有尚未完成的咨询或者问诊
          if(data.result.type==1){//咨询转问诊
            if($scope.consultable==1){
              $scope.consultable=0
            $ionicPopup.confirm({
              title:"问诊确认",
              template:"您有尚未结束的咨询，补齐差价可升级为问诊，问诊中询问医生的次数不限。确认付费升级为问诊？",
              okText:"确认",
              cancelText:"取消"
            }).then(function(res){
              if(res){
                $scope.consultable=1
                var time = new Date()
                time =  $filter("date")(time, "yyyy-MM-dd HH:mm:ss");
                var neworder = {
                    "userId":Storage.get('UID'),
                    "role":"patient",
                    "money":doctor.charge2*100 - doctor.charge1*100,
                    "class":"03",
                    "name":"升级",
                    "notes":DoctorId,
                    "paystatus":1,
                    "paytime":time,
                    "openid":Storage.get('messageopenid'),
                    "trade_type":"JSAPI"
                              // userId:Storage.get('UID'),
                              // money:$scope.doctor.charge2*100 - $scope.doctor.charge1*100,
                              // goodsInfo:{
                              //   class:'03',
                              //   name:'升级',
                              //   notes:DoctorId
                              // },
                              // paystatus:0,
                              // paytime:time
                }
                payment.payment(neworder).then(function(data){
                  console.log(data) //data.errMsg:"chooseWXPay:ok"时支付成功
                  if (data.errMsg == "chooseWXPay:ok")
                  {
                    chargemoney = doctor.charge2 - doctor.charge1
                  //点击确认 将咨询的type=1 变成type=3
                  Counsels.changeType({doctorId:DoctorId,patientId:Storage.get('UID'),type:1,changeType:"true"}).then(function(data){
                    console.log(data.result)
                    if(data.result=="修改成功"){
                      //确认新建咨询之后 给医生账户转积分 其他新建都在最后提交的时候转账 但是升级是在这里完成转账
                      //chargedoc
                      Expense.rechargeDoctor({patientId:Storage.get('UID'),doctorId:DoctorId,type:'升级',doctorName:docname,money:chargemoney}).then(function(data){
                        console.log(data)
                      },function(err){
                        console.log(err)
                      })
                      //plus doc answer count  patientId:doctorId:modify
                      Account.modifyCounts({patientId:Storage.get('UID'),doctorId:DoctorId,modify:999}).then(function(data){
                        console.log(data)
                      },function(err){
                        console.log(err)
                      })
                      var msgJson={
                          contentType:'custom',
                          fromName:'',
                          fromID:Storage.get('UID'),
                          fromUser:{
                              avatarPath:CONFIG.mediaUrl+'uploads/photos/resized'+Storage.get('UID')+'_myAvatar.jpg'
                          },
                          targetID:DoctorId,
                          targetName:'',
                          targetType:'single',
                          status:'send_going',
                          createTimeInMillis: Date.now(),
                          newsType:'11',
                          content:{
                              type:'counsel-upgrade',
                          }
                      }
                      socket.emit('newUser',{user_name:Storage.get('UID'),user_id:Storage.get('UID')});
                      socket.emit('message',{msg:msgJson,to:DoctorId,role:'patient'});
                      socket.on('messageRes',function(data){
                        socket.off('messageRes');
                        socket.emit('disconnect');
                        $state.go("tab.consult-chat",{chatId:DoctorId,type:3,status:1});
                      })
                    }
                  },function(err)
                  {
                      console.log(err)
                  })
                }
                else{
                  $ionicLoading.show({ 
                      template: '付款失败，请重新支付！', duration: 2000 
                  });
                }
              },function(err){
                console.log(err)
              })
                }else{
                  $scope.consultable=1
                }
            })
          }
          }else{
            if($scope.consultable==1){
              $scope.consultable=0
              $ionicPopup.confirm({
                title:"问诊确认",
                template:"您有尚未结束的问诊，点击确认继续上一次问诊！",
                okText:"确认",
                cancelText:"取消"
              }).then(function(res){
                  if(res){
                    $scope.consultable=1
                    $state.go("tab.consult-chat",{chatId:DoctorId,type:data.result.type,status:1});
                  }else{
                    $scope.consultable=1
                  }
              })
            }
          }
        }else{//没有进行中的问诊咨询 查看是否已经付过费
          Account.getCounts({patientId:Storage.get('UID'),doctorId:DoctorId}).then(function(data){
            console.log(data.result.count)
          if(data.result.count==999){//上次有购买问诊 但是没有新建问诊
            if($scope.consultable==1){
                $scope.consultable=0
              $ionicPopup.confirm({
                title:"问诊确认",
                template:"您上次付费的问诊尚未新建成功，点击确认继续填写完善上次的咨询问卷，进入问诊后，您询问该医生的次数不限，最后由医生结束此次问诊，请尽可能在咨询问卷以及问诊过程中详细描述病情和需求。",
                okText:"确认",
                cancelText:"取消"
              }).then(function(res){
                if(res){
                  $state.go("tab.consultquestion1",{DoctorId:DoctorId,counselType:2});
                }
              })
            }else if(data.result.count==3){//已经付费的咨询 但是没有开始 
              $ionicPopup.confirm({
                title:"问诊确认",
                template:"您上次付费的咨询尚未新建成功，补齐差价可升级为问诊，进入问诊后，您询问该医生的次数不限，最后由医生结束此次问诊，请尽可能在咨询问卷以及问诊过程中详细描述病情和需求。确认付费升级为问诊？",
                okText:"确认",
                cancelText:"取消"
              }).then(function(res){
                if(res){
                  var time = new Date()
                  time =  $filter("date")(time, "yyyy-MM-dd HH:mm:ss");
                  var neworder = {
                      "userId":Storage.get('UID'),
                      "role":"patient",
                      "money":doctor.charge2*100 - doctor.charge1*100,
                      "class":"03",
                      "name":"升级",
                      "notes":DoctorId,
                      "paystatus":1,
                      "paytime":time,
                      "openid":Storage.get('messageopenid'),
                      "trade_type":"JSAPI"
                                // userId:Storage.get('UID'),
                                // money:$scope.doctor.charge2*100 - $scope.doctor.charge1*100,
                                // goodsInfo:{
                                //   class:'03',
                                //   name:'升级',
                                //   notes:DoctorId
                                // },
                                // paystatus:0,
                                // paytime:time
                  }
                  payment.payment(neworder).then(function(data){
                    console.log(data) //data.errMsg:"chooseWXPay:ok"时支付成功
                    if (data.errMsg == "chooseWXPay:ok")
                    {
                      chargemoney = doctor.charge2 - doctor.charge1
                      Expense.rechargeDoctor({patientId:Storage.get('UID'),doctorId:DoctorId,type:'升级',doctorName:docname,money:chargemoney}).then(function(data){
                        console.log(data)
                      },function(err){
                        console.log(err)
                      })
                      //plus doc answer count  patientId:doctorId:modify
                      Account.modifyCounts({patientId:Storage.get('UID'),doctorId:DoctorId,modify:999}).then(function(data){
                        console.log(DoctorId+Storage.get('UID'))
                        console.log(data)
                      },function(err){
                        console.log(err)
                      })
                      $state.go("tab.consultquestion1",{DoctorId:DoctorId,counselType:2});//这里的type是2不是3 因为还没有新建成功，
                    }
                    else{
                      $ionicLoading.show({ 
                          template: '付款失败，请重新支付！', duration: 2000 
                      });
                    }
                  },function(err){
                    console.log(err)
                  })
                }else{
                    $scope.consultable=1
                }
              })
            }
            }else{
              if($scope.consultable==1){
                $scope.consultable=0
              $ionicPopup.confirm({//没有免费也没有回答次数 交钱 充值 加次数
                title:"问诊确认",
                template:"进入问诊后，您询问该医生的次数不限，最后由医生结束此次问诊，请尽可能在咨询问卷以及问诊过程中详细描述病情和需求。确认付费问诊？",
                okText:"确认",
                cancelText:"取消"
              }).then(function(res){
                if(res){
                  var time = new Date()
                  time =  $filter("date")(time, "yyyy-MM-dd HH:mm:ss");
                  var neworder = {
                      "userId":Storage.get('UID'),
                      "role":"patient",
                      "money":doctor.charge2*100,
                      "class":"02",
                      "name":"问诊",
                      "notes":DoctorId,
                      "paystatus":1,
                      "paytime":time,
                      "openid":Storage.get('messageopenid'),
                      "trade_type":"JSAPI"
                                // userId:Storage.get('UID'),
                                // money:$scope.doctor.charge2*100,
                                // goodsInfo:{
                                //   class:'02',
                                //   name:'问诊',
                                //   notes:DoctorId
                                // },
                                // paystatus:0,
                                // paytime:time
                  }
                  payment.payment(neworder).then(function(data){
                    console.log(data) //data.errMsg:"chooseWXPay:ok"时支付成功
                    if (data.errMsg == "chooseWXPay:ok")
                    {
                      chargemoney = doctor.charge2
                      Expense.rechargeDoctor({patientId:Storage.get('UID'),doctorId:DoctorId,type:'问诊',doctorName:docname,money:chargemoney}).then(function(data){
                        console.log(data)
                      },function(err){
                        console.log(err)
                      })
                      //plus doc answer count  patientId:doctorId:modify
                      Account.modifyCounts({patientId:Storage.get('UID'),doctorId:DoctorId,modify:999}).then(function(data){
                        console.log(data)
                      },function(err){
                        console.log(err)
                      })
                      $state.go("tab.consultquestion1",{DoctorId:DoctorId,counselType:2});
                    }
                    else{
                      $ionicLoading.show({ 
                          template: '付款失败，请重新支付！', duration: 2000 
                      });
                    }
                  },function(err){
                    console.log(err)
                  })
                }else{
                    $scope.consultable=1
                  }
              })
            }
          }
          },function(err){
            console.log(err)
          })
        }
      },function(err){
        console.log(err)
      })
  }

}])


//关于--PXY
.controller('aboutCtrl', ['$scope','$timeout','$state','Storage','$ionicHistory', function($scope, $timeout,$state,Storage,$ionicHistory) {
   
  $scope.Goback = function(){
    // console.log(123);
    $state.go('tab.mine');
    // $ionicHistory.goBack();
  }
  
}])



//修改密码--PXY
.controller('changePasswordCtrl', ['$scope','$timeout','$state','$ionicPopup','Storage','$ionicHistory','User', function($scope, $timeout,$state,$ionicPopup,Storage,$ionicHistory,User) {
   
  $scope.Goback = function(){
    $ionicHistory.goBack();
  }

  $scope.ishide=true;
  $scope.change={oldPassword:"",newPassword:"",confirmPassword:""};


  $scope.passwordCheck = function(change){
    $scope.logStatus1='';
    if(change.oldPassword!=""){
        var username = Storage.get('USERNAME');
        User.logIn({username:username,password:$scope.change.oldPassword,role:'patient'})
        .then(function(succ)
        {
          console.log(succ)
          if(succ.mesg=="User password isn't correct!")
          {
            $scope.logStatus1='验证失败，密码错误！'
          }
          else
          {
            $scope.ishide=false;
          }
        },function(err)
        {
          console.log(err)
        })
        // var usernames = Storage.get('usernames').split(",");
        // var index = usernames.indexOf(username);
        // var passwords = Storage.get('passwords').split(",");
        // if(passwords[index]!=change.oldPassword){
        //   $scope.logStatus1 = "密码错误！";
        // }
        // else{
        //   $scope.logStatus1='验证成功';
        //   $timeout(function(){$scope.ishide=false;} , 500);

        // }
        
        
    }
    else{
      $scope.logStatus1='请输入旧密码！'
    }
    
  }

  $scope.gotoChange = function(change){
    $scope.logStatus2='';
    if((change.newPassword!="") && (change.confirmPassword!="")){
      if(change.newPassword == change.confirmPassword){
        if(change.newPassword.length<6){
            $scope.logStatus2 ="密码长度太短了！";
        }else{
             User.changePassword({phoneNo:Storage.get('USERNAME'),password:change.newPassword})
            .then(function(succ)
            {
              console.log(succ)
              if(succ.mesg=="password reset success!")
              {
                $ionicPopup.alert({
                 title: '修改密码成功！'
                }).then(function(res) {
                   $scope.logStatus2 ="修改密码成功！";
                  $state.go('tab.mine');
                });
              }
            },function(err)
            {
              console.log(err)
            })
        }
       

          // //把新用户和密码写入
          // var username = Storage.get('USERNAME');
          // var usernames = Storage.get('usernames').split(",");
          // var index = usernames.indexOf(username);
          // var passwords = Storage.get('passwords').split(",");
          // passwords[index] = change.newPassword;
         
          // Storage.set('passwords',passwords);
          // $scope.logStatus2 ="修改密码成功！";
          // $timeout(function(){$scope.change={originalPassword:"",newPassword:"",confirmPassword:""};
          // $state.go('tab.tasklist');
          // $scope.ishide=true;
          // } , 500);
      }else{
        $scope.logStatus2="两次输入的密码不一致";
      }
    }else{
      $scope.logStatus2="请输入两遍新密码"
    }
  }
  
}])

//肾病保险主页面--TDY
.controller('insuranceCtrl', ['$scope', '$state', '$ionicHistory','insurance','Storage','$filter','$ionicPopup',function ($scope, $state,$ionicHistory,insurance,Storage,$filter,$ionicPopup) {
  var show = false;

  $scope.isShown = function() {
        return show;
  };

  $scope.toggle = function() {
        show = !show;
  };

  $scope.intension = function(){
    $state.go("intension")
  }

  $scope.expense = function(){
    $state.go("insuranceexpense")
  }

  $scope.kidneyfunction = function(){
    $state.go("kidneyfunction")
  }

  $scope.staff = function(){
    $state.go("insurancestafflogin")
  }

  $scope.submitintension = function(){
    var time = new Date()
    time =  $filter("date")(time, "yyyy-MM-dd HH:mm:ss");
    var temp = {
      "patientId":Storage.get('UID'),
      "status":1,
      "date": time.substr(0,10)
    }
    insurance.setPrefer(temp).then(function(data){
      if (data.results == "success")
      {
        $ionicPopup.show({   
             title: '已收到您的保险意向，工作人员将尽快与您联系！',
             buttons: [
               {
                    text: '確定',
                    type: 'button-positive'
               },
               ]
        })
      }
    },
    function(err){

    })
  }

  $scope.cancel = function(){
    $state.go("insurance")
  }


}])

//肾病保险相关工具--TDY
.controller('insurancefunctionCtrl', ['$scope', '$state', '$http', '$ionicPopup',function ($scope, $state, $http,$ionicPopup) {
  $scope.InsuranceInfo = {
    "InsuranceAge": 25,
    "Gender": "NotSelected",
    "InsuranceTime": "5年",
    "CalculationType": "CalculateMoney",
    "InsuranceMoney": null,
    "InsuranceExpense": 0,
    "InsuranceParameter": 0
  }

  $scope.Kidneyfunction = {
    "Gender": "NotSelected",
    "Age": null,
    "CreatinineUnit": "μmol/L",
    "Creatinine": null,
    "KidneyfunctionValue": 0
  }

  $http.get("../data/insruanceage1.json").success(function(data){
    $scope.InsuranceAges = data
  });

  $scope.Genders = [
    {
      "Type": "NotSelected",
      "Name":"请选择",
      "No": 0
    },
    {
      "Type": "Male",
      "Name":"男",
      "No": 1
    },
    {
      "Type": "Female",
      "Name":"女",
      "No": 2
    }
  ]

  $scope.InsuranceTimes =[
    {
      "Time":"5年"
    },
    {
      "Time":"10年"
    }
  ]

  $scope.CalculationTypes = [
    {
      "Type": "CalculateMoney",
      "Name":"保费算保额",
      "No": 1
    },
    {
      "Type": "CalculateExpense",
      "Name":"保额算保费",
      "No": 2
    }
  ]

  $scope.CreatinineUnits = [
    {
      "Type":"mg/dl"
    },
    {
      "Type":"μmol/L"
    }
  ]

  $http.get("../data/InsuranceParameter.json").success(function(data){
    dict = data
  })
  $scope.getexpense = function(){
    if ($scope.InsuranceInfo.Gender == "NotSelected")
    {
      alert("请选择性别")
    }
    else if ($scope.InsuranceInfo.InsuranceMoney == null)
    {
      alert("请输入金额")
    }
    else
    {
      for (var i=0;i<dict.length;i++){
        if (dict[i].Age == $scope.InsuranceInfo.InsuranceAge && dict[i].Gender == $scope.InsuranceInfo.Gender && dict[i].Time == $scope.InsuranceInfo.InsuranceTime)
        {
          $scope.InsuranceInfo.InsuranceParameter = dict[i].Parameter
          break
        }
      }
      if ($scope.InsuranceInfo.CalculationType == "CalculateExpense")
      {
        $scope.InsuranceInfo.InsuranceExpense = $scope.InsuranceInfo.InsuranceMoney*$scope.InsuranceInfo.InsuranceParameter/1000
        // alert("您的保费为：" + $scope.InsuranceInfo.InsuranceExpense.toFixed(2) + "元")
        $ionicPopup.show({   
             title: "您的保费为：" + $scope.InsuranceInfo.InsuranceExpense.toFixed(2) + "元",
             buttons: [
               {
                    text: '確定',
                    type: 'button-positive'
               },
               ]
        })
      }
      else if ($scope.InsuranceInfo.CalculationType == "CalculateMoney")
      {
        $scope.InsuranceInfo.InsuranceExpense = 1000*$scope.InsuranceInfo.InsuranceMoney/$scope.InsuranceInfo.InsuranceParameter
        // alert("您的保额为：" + $scope.InsuranceInfo.InsuranceExpense.toFixed(2) + "元")
        $ionicPopup.show({   
             title: "您的保额为：" + $scope.InsuranceInfo.InsuranceExpense.toFixed(2) + "元",
             buttons: [
               {
                    text: '確定',
                    type: 'button-positive'
               },
               ]
        })
      }
    }
  }

  $scope.resetexpense = function(){
    $scope.InsuranceInfo = {
      "InsuranceAge": 25,
      "Gender": "NotSelected",
      "InsuranceTime": "5年",
      "CalculationType": "CalculateMoney",
      "InsuranceMoney": null,
      "InsuranceExpense": 0
    }
  }
  $scope.changeAge = function(){
    if ($scope.InsuranceInfo.InsuranceTime == "5年")
    {
      $http.get("../data/insuranceage1.json").success(function(data){
        $scope.InsuranceAges = data
      });
    }
    else
    {
      $http.get("../data/insuranceage2.json").success(function(data){
        $scope.InsuranceAges = data
      });
    }
  }
  $scope.getkidneyfunction = function(){
    if ($scope.Kidneyfunction.Age == null)
    {
      alert("请输入年龄")
    }
    if ($scope.Kidneyfunction.Creatinine == null)
    {
      alert("请输入肌酐")
    }
    if ($scope.Kidneyfunction.CreatinineUnit == "mg/dl" && $scope.Kidneyfunction.Gender == "Female")
    {
      if ($scope.Kidneyfunction.Creatinine <= 0.7)
      {
        $scope.Kidneyfunction.KidneyfunctionValue = 144*Math.pow(($scope.Kidneyfunction.Creatinine/0.7),-0.329)*Math.pow(0.993,$scope.Kidneyfunction.Age)
      }
      else
      {
        $scope.Kidneyfunction.KidneyfunctionValue = 144*Math.pow(($scope.Kidneyfunction.Creatinine/0.7),-1.209)*Math.pow(0.993,$scope.Kidneyfunction.Age)
      }
    }
    else if ($scope.Kidneyfunction.CreatinineUnit == "mg/dl" && $scope.Kidneyfunction.Gender == "Male")
    {
      if ($scope.Kidneyfunction.Creatinine <= 0.9)
      {
        $scope.Kidneyfunction.KidneyfunctionValue = 141*Math.pow(($scope.Kidneyfunction.Creatinine/0.9),-0.411)*Math.pow(0.993,$scope.Kidneyfunction.Age)
      }
      else
      {
        $scope.Kidneyfunction.KidneyfunctionValue = 141*Math.pow(($scope.Kidneyfunction.Creatinine/0.9),-1.209)*Math.pow(0.993,$scope.Kidneyfunction.Age)
      }
    }
    else if ($scope.Kidneyfunction.CreatinineUnit == "μmol/L" && $scope.Kidneyfunction.Gender == "Female")
    {
      if ($scope.Kidneyfunction.Creatinine <= 62)
      {
        $scope.Kidneyfunction.KidneyfunctionValue = 141*Math.pow(($scope.Kidneyfunction.Creatinine/0.9),-0.411)*Math.pow(0.993,$scope.Kidneyfunction.Age)
      }
      else
      {
        $scope.Kidneyfunction.KidneyfunctionValue = 141*Math.pow(($scope.Kidneyfunction.Creatinine/0.9),-1.209)*Math.pow(0.993,$scope.Kidneyfunction.Age)
      }
    }
    else if ($scope.Kidneyfunction.CreatinineUnit == "μmol/L" && $scope.Kidneyfunction.Gender == "Male")
    {
      if ($scope.Kidneyfunction.Creatinine <= 80)
      {
        $scope.Kidneyfunction.KidneyfunctionValue = 141*Math.pow(($scope.Kidneyfunction.Creatinine/0.9),-0.411)*Math.pow(0.993,$scope.Kidneyfunction.Age)
      }
      else
      {
        $scope.Kidneyfunction.KidneyfunctionValue = 141*Math.pow(($scope.Kidneyfunction.Creatinine/0.9),-1.209)*Math.pow(0.993,$scope.Kidneyfunction.Age)
      }
    }
    var kidneyclass = ""
    if ($scope.Kidneyfunction.KidneyfunctionValue >= 90)
    {
      kidneyclass = "CDK 1期";
    }
    else if ($scope.Kidneyfunction.KidneyfunctionValue < 90 && $scope.Kidneyfunction.KidneyfunctionValue >= 60)
    {
      kidneyclass = "CDK 2期";
    }
    else if ($scope.Kidneyfunction.KidneyfunctionValue < 60 && $scope.Kidneyfunction.KidneyfunctionValue >= 30)
    {
      kidneyclass = "CDK 3期";
    }
    else if ($scope.Kidneyfunction.KidneyfunctionValue < 30 && $scope.Kidneyfunction.KidneyfunctionValue >= 15)
    {
      kidneyclass = "CDK 4期";
    }
    else if ($scope.Kidneyfunction.KidneyfunctionValue < 15)
    {
      kidneyclass = "CDK 5期";
    }
    // alert("估算您的肾小球滤过率为：" + $scope.Kidneyfunction.KidneyfunctionValue.toFixed(2) + ",您处于" +kidneyclass)
    $ionicPopup.show({   
         title: "估算您的肾小球滤过率为：" + $scope.Kidneyfunction.KidneyfunctionValue.toFixed(2) + ",您处于" +kidneyclass,
         buttons: [
           {
                text: '確定',
                type: 'button-positive'
           },
           ]
    })
  }

  $scope.resetkidneyfunction = function(){
    $scope.Kidneyfunction = {
      "Gender": "NotSelected",
      "Age": null,
      "CreatinineUnit": "μmol/L",
      "Creatinine": null,
      "KidneyfunctionValue": 0
    }
  }

}])

//肾病保险工作人员--TDY
.controller('insurancestaffCtrl', ['$scope', '$state', function ($scope, $state) {
  $scope.intensions = 
  [
    {
      "name": "李爱国",
      "phoneNo": "15688745215"
    },
    {
      "name": "张爱民",
      "phoneNo": "17866656326"
    },
    {
      "name": "步爱家",
      "phoneNo": "13854616548"
    }
  ]

  $scope.stafflogin = function(){
    $state.go("insurancestaff")
  }

  $scope.Goback = function(){
    $state.go("insurance")
  }

  $scope.Back = function(){
    $state.go("insurancestafflogin")
  }
}])
//咨询问卷--TDY
.controller('consultquestionCtrl', ['$ionicLoading','Task','$scope', '$ionicPopup','$ionicModal','$state', 'Dict','Storage', 'Patient', 'VitalSign','$filter','$stateParams','$ionicPopover','Camera','Counsels','CONFIG','Health','Account','Communication','wechat',function ($ionicLoading,Task,$scope,$ionicPopup, $ionicModal,$state,Dict,Storage,Patient,VitalSign,$filter,$stateParams,$ionicPopover,Camera,Counsels,CONFIG,Health,Account,Communication,wechat) {
  $scope.showProgress = false
  $scope.showSurgicalTime = false
  var patientId = Storage.get('UID')
  var DoctorId = $stateParams.DoctorId;
  var counselType = $stateParams.counselType;

  $scope.submitable=false;


  //20140421 zxf
  $scope.items = []//HealthInfo.getall();
  var healthinfotimes=[]
  if(Storage.get('consulthealthinfo')!=''&&Storage.get('consulthealthinfo')!='undefined'&&Storage.get('consulthealthinfo')!=null){
    healthinfotimes=angular.fromJson(Storage.get('consulthealthinfo'))
  }
  for(var i=0;i<healthinfotimes.length;i++){
    Health.getHealthDetail({userId:Storage.get('UID'),insertTime:healthinfotimes[i].time}).then(
          function(data)
          {
            if(data.results!=null){
              $scope.items.push(data.results)
              $scope.items[$scope.items.length-1].acture = $scope.items[$scope.items.length-1].insertTime
              // $scope.items[$scope.items.length-1].time = $scope.items[$scope.items.length-1].time.substr(0,10)
              // $scope.items.push({'label':data.results.label,'time':data.results.time.substr(0,10),'description':data.results.description,'insertTime':data.results.insertTime})
            }
          },
          function(err)
          {
            console.log(err);
          }
        )
  }

  //跳转修改健康信息
  $scope.gotoEditHealth=function(ele,editId){
    if(ele.target.nodeName=="I"){
      // console.log(121212)
      var confirmPopup = $ionicPopup.confirm({
      title: '删除提示',
      template: '记录删除后将无法恢复，确认删除？',
      cancelText:'取消',
      okText:'删除'
      });

      confirmPopup.then(function(res) {
        if(res) 
          {
            Health.deleteHealth({userId:patientId,insertTime:editId.acture}).then(
              function(data)
              {
                if (data.results == 0)
                {
                  for (var i = 0; i < $scope.items.length; i++){
                    if (editId.acture == $scope.items[i].acture)
                    {
                      $scope.items.splice(i,1)
                      break;
                    }
                  }
                }
                
                // console.log($scope.items)
              },
              function(err)
              {
                console.log(err);
              }
            )
            //20140421 zxf
            var healthinfotimes=angular.fromJson(Storage.get('consulthealthinfo'))
            for(var i=0;i<healthinfotimes.length;i++){
              if(healthinfotimes[i].time==editId.acture){
                healthinfotimes.splice(i, 1)
                break;
              }
            }
            Storage.set('consulthealthinfo',angular.toJson(healthinfotimes))
          } 
        });
    }else{
      $state.go('tab.myHealthInfoDetail',{id:editId,caneidt:false});
    }
    
  }

  // console.log("Attention:"+DoctorId)
  // var patientId = "U201702080016"
  $scope.Genders =
  [
    {Name:"男",Type:1},
    {Name:"女",Type:2}
  ]

  $scope.BloodTypes =
  [
    {Name:"A型",Type:1},
    {Name:"B型",Type:2},
    {Name:"AB型",Type:3},
    {Name:"O型",Type:4},
    {Name:"不确定",Type:5}
  ]

  $scope.Hypers =
  [
    {Name:"是",Type:1},
    {Name:"否",Type:2}
  ]

  //从字典中搜索选中的对象。
  var searchObj = function(code,array){
      for (var i = 0; i < array.length; i++) {
        if(array[i].Type == code || array[i].type == code || array[i].code == code) return array[i];
      };
      return "未填写";
  }

  $scope.Diseases = ""
  $scope.DiseaseDetails = ""
  $scope.timename = ""
  $scope.getDiseaseDetail = function(Disease) {
    if (Disease.typeName == "肾移植")
    {
      $scope.showProgress = false
      $scope.showSurgicalTime = true
      $scope.timename = "手术日期"
    }
    else if (Disease.typeName == "血透")
    {
      $scope.showProgress = false
      $scope.showSurgicalTime = true
      $scope.timename = "插管日期"
    }
    else if (Disease.typeName == "腹透")
    {
      $scope.showProgress = false
      $scope.showSurgicalTime = true
      $scope.timename = "开始日期"
    }
    else if (Disease.typeName == "ckd5期未透析")
    {
      $scope.showProgress = false
      $scope.showSurgicalTime = false
    }
    else
    {
      $scope.showProgress = true
      $scope.showSurgicalTime = false
      $scope.DiseaseDetails = Disease.details
    }
  }
  var initialDict = function(){
    Dict.getDiseaseType({category:'patient_class'}).then(
      function(data)
      {
        $scope.Diseases = data.results[0].content
        $scope.Diseases.push($scope.Diseases[0])
        $scope.Diseases.shift()
        if ($scope.BasicInfo.class != null)
        {
          $scope.BasicInfo.class = searchObj($scope.BasicInfo.class,$scope.Diseases)
          if ($scope.BasicInfo.class.typeName == "血透")
          {
            $scope.showProgress = false
            $scope.showSurgicalTime = true
            $scope.timename = "插管日期"
          }
          else if ($scope.BasicInfo.class.typeName == "肾移植")
          {
            $scope.showProgress = false
            $scope.showSurgicalTime = true
            $scope.timename = "手术日期"
          }
          else if ($scope.BasicInfo.class.typeName == "腹透")
          {
            $scope.showProgress = false
            $scope.showSurgicalTime = true
            $scope.timename = "开始日期"
          }
          else if ($scope.BasicInfo.class.typeName == "ckd5期未透析")
          {
            $scope.showProgress = false
            $scope.showSurgicalTime = false
          }
          else
          {
            $scope.showProgress = true
            $scope.showSurgicalTime = false
            $scope.DiseaseDetails = $scope.BasicInfo.class.details
            $scope.BasicInfo.class_info = searchObj($scope.BasicInfo.class_info[0],$scope.DiseaseDetails)              
          }
        }
        // console.log($scope.Diseases)
      },
      function(err)
      {
        console.log(err);
      }
    )
    // Dict.getDiseaseType({category:'patient_class'}).then(
    //   function(data)
    //   {
    //     $scope.Diseases = data.results[0].content
    //     if ($scope.BasicInfo.class != null)
    //     {
    //       $scope.BasicInfo.class = searchObj($scope.BasicInfo.class,$scope.Diseases)
    //       if ($scope.BasicInfo.class.typeName == "血透")
    //       {
    //         $scope.showProgress = false
    //         $scope.showSurgicalTime = false
    //         $scope.BasicInfo.class_info == null
    //       }
    //       else if ($scope.BasicInfo.class.typeName == "肾移植")
    //       {
    //         $scope.showProgress = false
    //         $scope.showSurgicalTime = true
    //       }
    //       else
    //       {
    //         $scope.showProgress = true
    //         $scope.showSurgicalTime = false
    //         $scope.DiseaseDetails = $scope.BasicInfo.class.details
    //         $scope.BasicInfo.class_info = searchObj($scope.BasicInfo.class_info[0],$scope.DiseaseDetails)              
    //       }
    //     }
    //     console.log($scope.Diseases)
    //   },
    //   function(err)
    //   {
    //     console.log(err);
    //   }
    // )
  }
  $scope.BasicInfo = 
  {
    // "userId": patientId,
    // "name": null,
    // "gender": null,
    // "bloodType": null,
    // "hypertension": null,
    // "class": null,
    // "class_info": null,
    // "operationTime": null,
    // "allergic":null,
    // "height": null,
    "weight": null,
    // "birthday": null,
    // "IDNo": null
  }
  // initialDict()
  Patient.getPatientDetail({userId: patientId}).then(
      function(data)
      {
        if (data.results != null)
        {
          $scope.BasicInfo=angular.merge($scope.BasicInfo, data.results);
          // console.log($scope.BasicInfo)
          // $scope.BasicInfo = data.results
          thisPatient = data.results
          // $scope.BasicInfo.gender = data.results.gender
          // $scope.BasicInfo.bloodType = data.results.bloodType
          // $scope.BasicInfo.hypertension = data.results.hypertension
          // $scope.BasicInfo.class = data.results.class
          // $scope.BasicInfo.class_info = data.results.class_info
          // $scope.BasicInfo.height = data.results.height
          // $scope.BasicInfo.birthday = data.results.birthday
          // $scope.BasicInfo.IDNo = data.results.IDNo
          // $scope.BasicInfo.allergic = data.results.allergic||"无"

          // $scope.BasicInfo.operationTime = data.results.operationTime
        }
        if ($scope.BasicInfo.gender != null)
        {
          $scope.BasicInfo.gender = searchObj($scope.BasicInfo.gender,$scope.Genders)
        }
        if ($scope.BasicInfo.bloodType != null)
        {
          $scope.BasicInfo.bloodType = searchObj($scope.BasicInfo.bloodType,$scope.BloodTypes)
        }
        if ($scope.BasicInfo.hypertension != null)
        {
          $scope.BasicInfo.hypertension = searchObj($scope.BasicInfo.hypertension,$scope.Hypers)
        }
        // if ($scope.BasicInfo.birthday != null)
        // {
        //   $scope.BasicInfo.birthday = $scope.BasicInfo.birthday.substr(0,10)
        // }
        // if ($scope.BasicInfo.operationTime != null){
        //       $scope.BasicInfo.operationTime = $scope.BasicInfo.operationTime.substr(0,10)
        // }
        
        VitalSign.getVitalSigns({userId:patientId, type: "Weight"}).then(
          function(data)
          {
            if(data.results.length){
              var n = data.results.length - 1
              var m = data.results[n].data.length - 1
              $scope.BasicInfo.weight = data.results[n].data[m]?data.results[n].data[m].value:"";
            }
            
          },
          function(err)
          {
            console.log(err);
          }
        );
        initialDict();
        console.log($scope.BasicInfo)
      },
      function(err)
      {
        console.log(err);
      }
    )

  $scope.Questionare = {
    "LastDiseaseTime":"",
    "LastHospital":"",
    "LastVisitDate":"",
    "LastDiagnosis":"",
    "title":"",
    "help":""
  }
  if(Storage.get('consultcacheinfo')!=null&&Storage.get('consultcacheinfo')!=""&&Storage.get('consultcacheinfo')!='undefined'){
    $scope.Questionare=angular.fromJson(Storage.get('consultcacheinfo'))
  }
  // console.log(angular.toJson($scope.Questionare))
  if (Storage.get('tempquestionare') !== "" && Storage.get('tempquestionare') !== null)
  {
    $scope.Questionare = angular.fromJson(Storage.get('tempquestionare'))
  }
  // console.log($scope.Questionare)
  // console.log(Storage.get('tempquestionare'))

  $scope.images = []
  if (Storage.get('tempimgrul') != "" && Storage.get('tempimgrul') != null)
  {
    $scope.images = angular.fromJson(Storage.get('tempimgrul'))
    //http://121.43.107.106:8052/uploads/photos/resized13735579254_1492596394430.jpg

  }
  //测试用 20170419 zxf
  // $scope.images.push("http://121.43.107.106:8052/uploads/photos/resized13735579254_1492596394430.jpg");
  // $scope.images.push("http://121.43.107.106:8052/uploads/photos/resized13735579254_1492593051359.jpg");
  // $scope.images.push("http://121.43.107.106:8052/uploads/photos/resized13735579254_1492592986223.jpg");
  

  // --------datepicker设置----------------
  var  monthList=["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"];
  var weekDaysList=["日","一","二","三","四","五","六"];
  
  // --------诊断日期----------------
  var DiagnosisdatePickerCallback = function (val) {
    if (typeof(val) === 'undefined') {
      console.log('No date selected');
    } else {
      $scope.datepickerObject1.inputDate=val;
      var dd=val.getDate();
      var mm=val.getMonth()+1;
      var yyyy=val.getFullYear();
      var d=dd<10?('0'+String(dd)):String(dd);
      var m=mm<10?('0'+String(mm)):String(mm);
      //日期的存储格式和显示格式不一致
      $scope.Questionare.LastVisitDate=yyyy+'-'+m+'-'+d;
    }
  };
  
  $scope.datepickerObject1 = {
    titleLabel: '诊断日期',  //Optional
    todayLabel: '今天',  //Optional
    closeLabel: '取消',  //Optional
    setLabel: '设置',  //Optional
    setButtonType : 'button-assertive',  //Optional
    todayButtonType : 'button-assertive',  //Optional
    closeButtonType : 'button-assertive',  //Optional
    inputDate: new Date(),    //Optional
    mondayFirst: false,    //Optional
    //disabledDates: disabledDates, //Optional
    weekDaysList: weekDaysList,   //Optional
    monthList: monthList, //Optional
    templateType: 'popup', //Optional
    showTodayButton: 'false', //Optional
    modalHeaderColor: 'bar-positive', //Optional
    modalFooterColor: 'bar-positive', //Optional
    from: new Date(1900, 1, 1),   //Optional
    to: new Date(),    //Optional
    callback: function (val) {    //Mandatory
      DiagnosisdatePickerCallback(val);
    }
  };  
  // --------手术日期----------------
  var OperationdatePickerCallback = function (val) {
    if (typeof(val) === 'undefined') {
      console.log('No date selected');
    } else {
      $scope.datepickerObject2.inputDate=val;
      var dd=val.getDate();
      var mm=val.getMonth()+1;
      var yyyy=val.getFullYear();
      var d=dd<10?('0'+String(dd)):String(dd);
      var m=mm<10?('0'+String(mm)):String(mm);
      //日期的存储格式和显示格式不一致
      $scope.BasicInfo.operationTime=yyyy+'-'+m+'-'+d;
    }
  };
  $scope.datepickerObject2 = {
    titleLabel: '手术日期',  //Optional
    todayLabel: '今天',  //Optional
    closeLabel: '取消',  //Optional
    setLabel: '设置',  //Optional
    setButtonType : 'button-assertive',  //Optional
    todayButtonType : 'button-assertive',  //Optional
    closeButtonType : 'button-assertive',  //Optional
    mondayFirst: false,    //Optional
    //disabledDates: disabledDates, //Optional
    weekDaysList: weekDaysList,   //Optional
    monthList: monthList, //Optional
    templateType: 'popup', //Optional
    showTodayButton: 'false', //Optional
    modalHeaderColor: 'bar-positive', //Optional
    modalFooterColor: 'bar-positive', //Optional
    from: new Date(1900, 1, 1),   //Optional
    to: new Date(),    //Optional
    callback: function (val) {    //Mandatory
      OperationdatePickerCallback(val);
    }
  };  
  // --------出生日期----------------
  var BirthdatePickerCallback = function (val) {
    if (typeof(val) === 'undefined') {
      console.log('No date selected');
    } else {
      $scope.datepickerObject3.inputDate=val;
      var dd=val.getDate();
      var mm=val.getMonth()+1;
      var yyyy=val.getFullYear();
      var d=dd<10?('0'+String(dd)):String(dd);
      var m=mm<10?('0'+String(mm)):String(mm);
      //日期的存储格式和显示格式不一致
      $scope.BasicInfo.birthday=yyyy+'-'+m+'-'+d;
    }
  };
  $scope.datepickerObject3 = {
    titleLabel: '出生日期',  //Optional
    todayLabel: '今天',  //Optional
    closeLabel: '取消',  //Optional
    setLabel: '设置',  //Optional
    setButtonType : 'button-assertive',  //Optional
    todayButtonType : 'button-assertive',  //Optional
    closeButtonType : 'button-assertive',  //Optional
    mondayFirst: false,    //Optional
    //disabledDates: disabledDates, //Optional
    weekDaysList: weekDaysList,   //Optional
    monthList: monthList, //Optional
    templateType: 'popup', //Optional
    showTodayButton: 'false', //Optional
    modalHeaderColor: 'bar-positive', //Optional
    modalFooterColor: 'bar-positive', //Optional
    from: new Date(1900, 1, 1),   //Optional
    to: new Date(),    //Optional
    callback: function (val) {    //Mandatory
      BirthdatePickerCallback(val);
    }
  };  
  // --------首次发病日期----------------
  var FirstDiseaseTimedatePickerCallback = function (val) {
    if (typeof(val) === 'undefined') {
      console.log('No date selected');
    } else {
      $scope.datepickerObject4.inputDate=val;
      var dd=val.getDate();
      var mm=val.getMonth()+1;
      var yyyy=val.getFullYear();
      var d=dd<10?('0'+String(dd)):String(dd);
      var m=mm<10?('0'+String(mm)):String(mm);
      //日期的存储格式和显示格式不一致
      $scope.Questionare.LastDiseaseTime=yyyy+'-'+m+'-'+d;
    }
  };
  
  $scope.datepickerObject4 = {
    titleLabel: '首次发病日期',  //Optional
    todayLabel: '今天',  //Optional
    closeLabel: '取消',  //Optional
    setLabel: '设置',  //Optional
    setButtonType : 'button-assertive',  //Optional
    todayButtonType : 'button-assertive',  //Optional
    closeButtonType : 'button-assertive',  //Optional
    inputDate: new Date(),    //Optional
    mondayFirst: false,    //Optional
    //disabledDates: disabledDates, //Optional
    weekDaysList: weekDaysList,   //Optional
    monthList: monthList, //Optional
    templateType: 'popup', //Optional
    showTodayButton: 'false', //Optional
    modalHeaderColor: 'bar-positive', //Optional
    modalFooterColor: 'bar-positive', //Optional
    from: new Date(1900, 1, 1),   //Optional
    to: new Date(),    //Optional
    callback: function (val) {    //Mandatory
      FirstDiseaseTimedatePickerCallback(val);
    }
  };  
  // --------datepicker设置结束----------------

    var MonthInterval = function(usertime){
        interval = new Date().getTime() - Date.parse(usertime);
        return(Math.floor(interval/(24*3600*1000*30)));
    }

    var distinctTask = function(kidneyType,kidneyTime,kidneyDetail){
        var sortNo = 1;
        console.log(kidneyType);
        console.log(kidneyDetail);
        // if(kidneyTime){
        //     kidneyTime = kidneyTime.substr(0,10);
        // }
        if(kidneyDetail){
            var kidneyDetail = kidneyDetail[0];
        }
        switch(kidneyType)
        {
            case "class_1":
                //肾移植
                if(kidneyTime!=undefined && kidneyTime!=null && kidneyTime!=""){
                    var month = MonthInterval(kidneyTime);
                    console.log("month"+month);
                    if(month>=0 && month<3){
                        sortNo = 1;//0-3月
                    }else if(month>=3 && month<6){
                        sortNo = 2; //3-6个月
                    }else if(month>=6 && month<36){
                        sortNo = 3; //6个月到3年
                    }else if(month>=36){
                        sortNo = 4;//对应肾移植大于3年
                    }

                }
                else{
                    sortNo = 4;
                }
                break;
            case "class_2": case "class_3"://慢性1-4期
                if(kidneyDetail!=undefined && kidneyDetail!=null && kidneyDetail!=""){
                    if(kidneyDetail=="stage_5"){//"疾病活跃期"
                        sortNo = 5;
                    }else if(kidneyDetail=="stage_6"){//"稳定期
                        sortNo = 6;
                    }else if(kidneyDetail == "stage_7"){//>3年
                        sortNo = 7;

                    }
                }
                else{
                    sortNo = 6;
                }
                break;
                
            case "class_4"://慢性5期
                sortNo = 8;
                break;
            case "class_5"://血透
                sortNo = 9;
                break;

            case "class_6"://腹透
                if(kidneyTime!=undefined && kidneyTime!=null && kidneyTime!=""){
                    var month = MonthInterval(kidneyTime);
                    console.log("month"+month);
                    if(month<6){
                        sortNo = 10;
                    }
                    else{
                        sortNo = 11;
                    }
                }
                break;


        }
        return sortNo;

    }
  $scope.submit = function(){
    // console.log($scope.BasicInfo)
    if($scope.BasicInfo.name&&$scope.BasicInfo.gender&&$scope.BasicInfo.class&&$scope.BasicInfo.bloodType&&$scope.BasicInfo.hypertension&&$scope.BasicInfo.allergic&&$scope.BasicInfo.birthday&&$scope.BasicInfo.IDNo){
        var IDreg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
        var PositiveReg = /^\d+(?=\.{0,1}\d+$|$)/;
        if ($scope.BasicInfo.IDNo!='' && IDreg.test($scope.BasicInfo.IDNo) == false){
                $ionicLoading.show({
                template: '请输入正确的身份证号',
                duration:1000
                });
        }else if(($scope.BasicInfo.height!=null && $scope.BasicInfo.height!="" && PositiveReg.test($scope.BasicInfo.height) == false )||($scope.BasicInfo.weight!=null && $scope.BasicInfo.weight!=""&&PositiveReg.test($scope.BasicInfo.weight) == false) ){
                $ionicLoading.show({
                template: '请输入正确的身高体重',
                duration:1000
                });
        }
        else{
            $scope.BasicInfo.gender = $scope.BasicInfo.gender.Type
            $scope.BasicInfo.bloodType = $scope.BasicInfo.bloodType.Type
            $scope.BasicInfo.hypertension = $scope.BasicInfo.hypertension.Type
            if ($scope.BasicInfo.class.typeName == "ckd5期未透析")
            {
              $scope.BasicInfo.class_info = null
            }
            else if ($scope.BasicInfo.class_info != null)
            {
              $scope.BasicInfo.class_info = $scope.BasicInfo.class_info.code
            }
            $scope.BasicInfo.class = $scope.BasicInfo.class.type
            Patient.editPatientDetail($scope.BasicInfo).then(function(data){
                        //保存成功
                        console.log($scope.BasicInfo);
                        // console.log(data.results);
                        var patientId = Storage.get('UID');
                        var task = distinctTask(data.results.class,data.results.operationTime,data.results.class_info);
                        Task.insertTask({userId:patientId,sortNo:task}).then(
                        function(data){
                            if(data.result=="插入成功"){
                                
                                if($scope.BasicInfo.weight){
                                    var now = new Date() ;
                                    now =  $filter("date")(now, "yyyy-MM-dd HH:mm:ss");
                                VitalSign.insertVitalSign({patientId:patientId, type: "Weight",code: "Weight_1", date:now.substr(0,10),datatime:now,datavalue:$scope.BasicInfo.weight,unit:"kg"}).then(function(data){
                                    console.log($scope.BasicInfo.weight);
                                     $state.go("tab.consultquestion2",{DoctorId:DoctorId,counselType:counselType});
                                },function(err){
                                    console.log(err);
                                });
                                }else{
                                     $state.go("tab.consultquestion2",{DoctorId:DoctorId,counselType:counselType});

                                }
                            }
                        },function(err){
                            console.log("err" + err);
                        });
                    },function(err){
                        console.log(err);
                    });
        }
    }else{
            $ionicLoading.show({
                template: '信息填写不完整,请完善必填信息(红色*)',
                duration:1000
            });
        }
    
   
  }
  
  // $scope.SKip = function(){
  //   $state.go("tab.consultquestion2",{DoctorId:DoctorId})
  // }

  $scope.backtoBasic = function(){
    $state.go("tab.consultquestion1",{DoctorId:DoctorId,counselType:counselType})
  }

  $scope.nexttoquestion = function(){
    Storage.set('tempquestionare',angular.toJson($scope.Questionare))
    Storage.set('tempimgrul',angular.toJson($scope.images))
    console.log($scope.Questionare);
    
    if($scope.Questionare.LastVisitDate!=""||$scope.Questionare.LastHospital!=""||$scope.Questionare.LastDiagnosis!=""){
        console.log("Attention");
        Patient.editPatientDetail({userId:Storage.get('UID'),lastVisit:{time:$scope.Questionare.LastVisitDate,hospital:$scope.Questionare.LastHospital,diagnosis:$scope.Questionare.LastDiagnosis}}).then(function(data){
            console.log(data.results);
            $state.go("tab.consultquestion3",{DoctorId:DoctorId,counselType:counselType});

        },function(err){
        console.log(err);
        });
    }else{
        $state.go("tab.consultquestion3",{DoctorId:DoctorId,counselType:counselType});
    }
    

  }


  $scope.backtoDisease = function(){
    Storage.set('tempquestionare',angular.toJson($scope.Questionare))
    $state.go("tab.consultquestion2",{DoctorId:DoctorId,counselType:counselType})

  } 


  $scope.Submitquestion = function(){
    // Storage.set('consultcacheinfo',angular.toJson([]));
    if(($scope.Questionare.title)&&($scope.Questionare.help)){
        var temp = {
          "patientId":patientId,
          "type":counselType,
          "doctorId":$stateParams.DoctorId, 
          "hospital":$scope.Questionare.LastHospital, 
          "visitDate":$scope.Questionare.LastVisitDate,
          "diagnosis":$scope.Questionare.LastDiagnosis, 
          "diagnosisPhotoUrl":$scope.images, 
          "sickTime":$scope.Questionare.LastDiseaseTime, 
          "symptom":$scope.Questionare.title, 
          "symptomPhotoUrl":$scope.images, 
          "help":$scope.Questionare.help
        }

    Counsels.questionaire(temp).then(
      function(data)
      {
        console.log(data);
        if (data.result == "新建成功")
        {
            $scope.submitable=true;
            var actionUrl = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxfa2216ac422fb747&redirect_uri=http://proxy.haihonghospitalmanagement.com/go&response_type=code&scope=snsapi_userinfo&state=doctor_11_'+ data.results.status+'_'+patientId+'_'+data.results.counselId+ '&#wechat_redirect';
            var template = {
                "userId": $stateParams.DoctorId, //医生的UID
                "role": "doctor",
                "postdata": {
                    "template_id": "cVLIgOb_JvtFGQUA2KvwAmbT5B3ZB79cRsAM4ZKKK0k",
                    "url":actionUrl,
                    "data": {
                        "first": {
                            "value": "您有一个新的"+(data.results.type==1?'咨询':'问诊')+"消息，请及时处理",
                            "color": "#173177"
                        },
                        "keyword1": {
                            "value": data.results.counselId, //咨询ID
                            "color": "#173177"
                        },
                        "keyword2": {
                            "value": thisPatient.name, //患者信息（姓名，性别，年龄）
                            "color": "#173177"
                        },
                        "keyword3": {
                            "value": data.results.help, //问题描述
                            "color": "#173177"
                        },
                        "keyword4": {
                            "value": data.results.time.substr(0,10), //提交时间
                            "color": "#173177"
                        },

                        "remark": {
                            "value": "感谢您的使用！",
                            "color": "#173177"
                        }
                    }
                }
            }
            wechat.messageTemplate(template);


            Storage.rm('tempquestionare')
            Storage.rm('tempimgrul')
            var msgContent={
                counsel:data.results,
                type:'card',
                counselId:data.results.counselId,
                patientId:patientId,
                patientName:$scope.BasicInfo.name,
                doctorId:DoctorId,
                fromId:patientId,
                targetId:DoctorId
            };
            var msgJson={
                contentType:'custom',
                fromName:thisPatient.name,
                fromID:patientId,
                fromUser:{
                    avatarPath:CONFIG.mediaUrl+'uploads/photos/resized'+patientId+'_myAvatar.jpg'
                },
                targetID:DoctorId,
                targetName:'',
                targetType:'single',
                status:'send_going',
                createTimeInMillis: Date.now(),
                newsType:'11',
                content:msgContent
            }
            socket.emit('newUser',{user_name:$scope.BasicInfo.name,user_id:patientId});
            socket.emit('message',{msg:msgJson,to:DoctorId,role:'patient'});
            socket.on('messageRes',function(messageRes){
                socket.off('messageRes');
                socket.emit('disconnect');
                if(DoctorId=='U201612291283'){
                    var time = new Date();
                    var gid='G'+$filter('date')(time, 'MMddHmsss');
                    // var msgdata = $state.params.msg;

                    var d = {
                        teamId: '10050278',
                        counselId: data.results.counselId,
                        sponsorId: DoctorId,
                        patientId: patientId,
                        consultationId: gid,
                        status: '1'
                    }
                    msgContent.consultationId=gid;
                    var msgTeam={
                        contentType:'custom',
                        fromID:DoctorId,
                        fromName:'陈江华',
                        fromUser:{
                            avatarPath:CONFIG.mediaUrl+'uploads/photos/resized'+DoctorId+'_myAvatar.jpg'
                        },
                        targetID:'10050278',
                        teamId:'10050278',
                        targetName:'陈江华主任医师团队',
                        targetType:'group',
                        status:'send_going',
                        newsType:'13',
                        createTimeInMillis: Date.now(),
                        content:msgContent
                    }
                    Communication.newConsultation(d)
                    .then(function(con){
                        console.log(con);
                        socket.emit('newUser',{user_name:'陈江华'.name,user_id:DoctorId});
                        socket.emit('message',{msg:msgTeam,to:'10050278',role:'patient'});
                        socket.on('messageRes',function(messageRes){
                            socket.off('messageRes');
                            socket.emit('disconnect');
                            $state.go('tab.consult-chat',{chatId:DoctorId});
                        });
                    },function(er){
                        console.error(err);
                    })
                    // Communication.getTeam({teamId:'10050278'})
                    // .then(function(response){
                    //     var team = response.results,
                    //         idarr = [];
                    //     team.members.forEach(function(member){
                    //         this.push(member.userId);
                    //     },idarr);
                    //     jmapi.groups(DoctorId,idarr,thisPatient.name + '-' +team.name,'consultatioin_open')
                    //     .then(function(res){
                    //         var d = {
                    //             teamId: team.teamId,
                    //             counselId: data.results.counselId,
                    //             sponsorId: DoctorId,
                    //             patientId: patientId,
                    //             consultationId: res.results.gid,
                    //             status: '1'
                    //         }
                    //         msgContent.consultationId=res.results.gid;
                    //         var msgTeam={
                    //             contentType:'custom',
                    //             fromID:DoctorId,
                    //             fromName:'陈江华',
                    //             fromUser:{
                    //                 avatarPath:CONFIG.mediaUrl+'uploads/photos/resized'+DoctorId+'_myAvatar.jpg'
                    //             },
                    //             targetID:team.teamId,
                    //             teamId:team.teamId,
                    //             targetName:team.name,
                    //             targetType:'group',
                    //             status:'send_going',
                    //             newsType:'13',
                    //             createTimeInMillis: Date.now(),
                    //             content:msgContent
                    //         }

                    //         Communication.newConsultation(d)
                    //         .then(function(con){
                    //             console.log(con);
                    //             socket.emit('newUser',{user_name:'陈江华'.name,user_id:DoctorId});
                    //             socket.emit('message',{msg:msgTeam,to:team.teamId,role:'patient'});
                    //             socket.on('messageRes',function(messageRes){
                    //                 socket.off('messageRes');
                    //                 socket.emit('disconnect');
                    //                 $state.go('tab.consult-chat',{chatId:DoctorId});
                    //             });
                    //         },function(er){
                    //             console.error(err);
                    //         })
                    //     },function(err){
                    //         console.error(err);
                    //     })                

                    // });
                }else{
                    $state.go('tab.consult-chat',{chatId:DoctorId});
                }
            });
          
        }
        console.log(data.results)
      },
      function(err)
      {
        console.log(err);
      }
    )
    }else{
        $ionicLoading.show({
            template: '信息填写不完整,请完善必填信息',
            duration:1000
            });
    }
    
  }

  //删除健康信息
  // $scope.DeleteHealth = function(item){
  // //console.log(number);
  //  //  confirm 对话框
  //   var confirmPopup = $ionicPopup.confirm({
  //     title: '删除提示',
  //     template: '记录删除后将无法恢复，确认删除？',
  //     cancelText:'取消',
  //     okText:'删除'
  //   });

  //   confirmPopup.then(function(res) {
  //     if(res) 
  //       {
  //         Health.deleteHealth({userId:patientId,insertTime:item.acture}).then(
  //           function(data)
  //           {
  //             if (data.results == 0)
  //             {
  //               for (var i = 0; i < $scope.items.length; i++){
  //                 if (item.acture == $scope.items[i].acture)
  //                 {
  //                   $scope.items.splice(i,1)
  //                   break;
  //                 }
  //               }
  //             }
              
  //             console.log($scope.items)
  //           },
  //           function(err)
  //           {
  //             console.log(err);
  //           }
  //         )
  //         //20140421 zxf
  //         var healthinfotimes=angular.fromJson(Storage.get('consulthealthinfo'))
  //         for(var i=0;i<healthinfotimes.length;i++){
  //           if(healthinfotimes[i].time==item.acture){
  //             healthinfotimes.splice(i, 1)
  //             break;
  //           }
  //         }
  //         Storage.set('consulthealthinfo',angular.toJson(healthinfotimes))
  //         // HealthInfo.remove(number);
  //         // $scope.items = HealthInfo.getall();
  //       } 
  //     });
  // }
  // $scope.Questionare = {
  //   "LastDiseaseTime":"",
  //   "LastHospital":"",
  //   "LastVisitDate":"",
  //   "LastDiagnosis":"",
  //   "title":"",
  //   "help":""
  // }
  // 上传头像的点击事件----------------------------
  $scope.addnewimage = function($event){
    Storage.set('consultcacheinfo',angular.toJson($scope.Questionare))
    $state.go('tab.myHealthInfoDetail',{id:null,caneidt:true})
    // $scope.openPopover($event);
  };
 


}])

//论坛
.controller('forumCtrl', ['$scope', '$state', '$sce','$http','Storage','Patient',function ($scope, $state,$sce,$http,Storage,Patient) {
    var phoneNum=Storage.get('USERNAME')
    console.log(phoneNum)
    Patient.getPatientDetail({userId: Storage.get('UID')})
    .then(function(data)
    {
      console.log(data)
      $scope.navigation_login=$sce.trustAsResourceUrl("http://patientdiscuss.haihonghospitalmanagement.com/member.php?mod=logging&action=login&loginsubmit=yes&loginhash=$loginhash&mobile=2&username="+data.results.name+phoneNum.slice(7)+"&password="+data.results.name+phoneNum.slice(7));
      $scope.navigation=$sce.trustAsResourceUrl("http://patientdiscuss.haihonghospitalmanagement.com/");
    })

}])

//写评论
.controller('SetCommentCtrl',['$stateParams','$scope', '$ionicHistory', '$ionicLoading','$state','Storage','Counsels','Comment',
   function($stateParams,$scope, $ionicHistory,$ionicLoading,$state,Storage,Counsels,Comment) {
      
      $scope.comment={score:5, commentContent:""};
      $scope.editable=false;
       
      // //  //评论星星初始化
      $scope.ratingsObject = {
        iconOn: 'ion-ios-star',
        iconOff: 'ion-ios-star-outline',
        iconOnColor: '#FFD700',//rgb(200, 200, 100)
        iconOffColor: 'rgb(200, 100, 100)',
        rating: 5, 
        minRating: 1,
        readOnly:false,
        callback: function(rating) {
          $scope.ratingsCallback(rating);
        }
      };
      //$stateParams.counselId
       //获取历史评论
      if($stateParams.counselId!=undefined&&$stateParams.counselId!=""&&$stateParams.counselId!=null){
        console.log($stateParams.counselId)
        Comment.getCommentsByC({counselId:$stateParams.counselId}).then(function(data){
          if(data.results.length!=0){
            // //初始化
            $scope.comment.score=data.results[0].totalScore/2
            $scope.comment.commentContent=data.results[0].content
             //评论星星初始化
             $scope.$broadcast('changeratingstar',$scope.comment.score,true);
             $scope.editable=true;
          }
        }, function(err){
          console.log(err)
        })
      }
    


      //评论星星点击改变分数
      $scope.ratingsCallback = function(rating) {
        $scope.comment.score = rating;
        console.log($scope.comment.score)
      };

      //上传评论-有效性验证
      $scope.deliverComment = function() {
        if($scope.comment.commentContent.length <10)
        {
            $ionicLoading.show({
              template: '输入字数不足10字',
              noBackdrop: false,
              duration: 1000,
              hideOnStateChange: true
            });
        }
        
        else
        {//20170504 zxf
          Counsels.insertCommentScore({doctorId:$stateParams.doctorId,patientId:$stateParams.patientId,counselId:$stateParams.counselId,totalScore:$scope.comment.score*2,content:$scope.comment.commentContent})
          // Counsels.insertCommentScore({doctorId:"doc01",patientId:"p01",counselId:"counsel01",totalScore:$scope.comment.score,content:$scope.comment.commentContent})
          .then(function(data){
            if(data.result=="成功"){//插入成功
              $ionicLoading.show({
                template: '评价成功',
                noBackdrop: false,
                duration: 1000,
                hideOnStateChange: true
              });
              //提交結束之後不能繼續修改
              $scope.$broadcast('changeratingstar',$scope.comment.score,true);
              $scope.editable=true;
              setTimeout(function(){
                  $scope.Goback();
              },500);
            }


          },function(err) {
              console.log(err);
          })
          // SetComment();
        }
      };
      $scope.Goback=function(){
        $ionicHistory.goBack();
      }

      
}])
.controller('paymentCtrl', ['$scope', '$state','$ionicHistory','Storage', function ($scope, $state,$ionicHistory,Storage) {
    $scope.Goback=function()
    {
        $ionicHistory.goBack();
    }
    $scope.payFor=Storage.get('payFor');//1->充咨询次数 2->充问诊
    // $scope.payFor=1
    $scope.money=50;
    $scope.pay=function(m)
    {
        if($scope.payFor==1)
        {
            if(m%50)
            {
                $scope.msg="无效的金额,"
                return;
            }
        }
        else
        {
            $scope.money=250;
        }
        //微信支付
    }
    console.log($scope.payFor)
}])

//诊断信息
.controller('DiagnosisCtrl', ['Dict','$scope','$ionicHistory','$state','$ionicPopup','$resource','Storage','CONFIG','$ionicLoading','$ionicPopover','Camera', 'Patient','Upload',function(Dict,$scope, $ionicHistory, $state, $ionicPopup, $resource, Storage, CONFIG, $ionicLoading, $ionicPopover, Camera,Patient,Upload) {
    $scope.Goback = function(){
      $state.go('tab.mine');
    }

    $scope.Hypers =
    [
      {Name:"是",Type:1},
      {Name:"否",Type:2}
    ]

    var showProgress = function(diseaseType){
        switch(diseaseType)
        {
            case "class_2": case "class_3":
                return true;
                break;
            default:
                return false;
                break;

        }
    }

    var showSurgicalTime = function(diseaseType){
        switch(diseaseType)
        {
            case "class_1": case "class_5": case "class_6":
                return true;
                break;
            default:
                return false;
                break;

        }
    }



    var timename = function(diseaseType){
        switch(diseaseType)
        {
            case "class_1":
                return "手术日期";
                break;
            case "class_5":
                return "插管日期";
                break;
            case "class_6":
                return "开始日期";
                break;
            default:
                break;
        }
    }
    //过滤重复的医生诊断 顺序从后往前，保证最新的一次诊断不会被过滤掉
    var FilterDiagnosis = function(arr){
        var result =[];
        var hash ={};
        for(var i =arr.length-1; i>=0; i--){
            var elem = arr[i].doctor.userId;
            if(!hash[elem]){
                result.push(arr[i]);
                hash[elem] = true;
            }
        }
        return result;
    }

    //从字典中搜索选中的对象。
    var searchObj = function(code,array){
        for (var i = 0; i < array.length; i++) {
          if(array[i].Type == code || array[i].type == code || array[i].code == code) return array[i];
        };
        return "未填写";
    }


    // var initialDict = function(){
    //   Dict.getDiseaseType({category:'patient_class'}).then(
    //     function(data)
    //     {
    //       $scope.Diseases = data.results[0].content
    //       $scope.Diseases.push($scope.Diseases[0])
    //       $scope.Diseases.shift()
    //       if ($scope.BasicInfo.class != null)
    //       {
    //         $scope.BasicInfo.class = searchObj($scope.BasicInfo.class,$scope.Diseases)
    //         if ($scope.BasicInfo.class.typeName == "血透")
    //         {
    //           $scope.showProgress = false
    //           $scope.showSurgicalTime = true
    //           $scope.timename = "插管日期"
    //         }
    //         else if ($scope.BasicInfo.class.typeName == "肾移植")
    //         {
    //           $scope.showProgress = false
    //           $scope.showSurgicalTime = true
    //           $scope.timename = "手术日期"
    //         }
    //         else if ($scope.BasicInfo.class.typeName == "腹透")
    //         {
    //           $scope.showProgress = false
    //           $scope.showSurgicalTime = true
    //           $scope.timename = "开始日期"
    //         }
    //         else if ($scope.BasicInfo.class.typeName == "ckd5期未透析")
    //         {
    //           $scope.showProgress = false
    //           $scope.showSurgicalTime = false
    //         }
    //         else
    //         {
    //           $scope.showProgress = true
    //           $scope.showSurgicalTime = false
    //           $scope.DiseaseDetails = $scope.BasicInfo.class.details
    //           $scope.BasicInfo.class_info = searchObj($scope.BasicInfo.class_info[0],$scope.DiseaseDetails)              
    //         }
    //       }
    //       // console.log($scope.Diseases)
    //     },
    //     function(err)
    //     {
    //       console.log(err);
    //     }
    //   )}

    var RefreshDiagnosisInfo = function(){
        $scope.noDiags =false;
        Patient.getPatientDetail({userId:Storage.get('UID')}).then(//userId:Storage.get('UID')
        function(data){
            // console.log(data.results.diagnosisInfo);
            if(data.results.diagnosisInfo.length){
                var allDiags = data.results.diagnosisInfo;
                console.log(allDiags);
                var DoctorDiags = FilterDiagnosis(allDiags);
                // console.log(DoctorDiags);
                Dict.getDiseaseType({category:'patient_class'}).then(
                    function(data)
                    {
                        $scope.Diseases = data.results[0].content;
                        $scope.Diseases.push($scope.Diseases[0]);
                        $scope.Diseases.shift();
                        console.log($scope.Diseases);
                        for(var i = 0;i<DoctorDiags.length;i++){
                                
                          if (DoctorDiags[i].name != null)
                          {
                            // console.log(i);
                            // console.log(DoctorDiags[i].name);
                            DoctorDiags[i].name = searchObj(DoctorDiags[i].name,$scope.Diseases);
                            DoctorDiags[i].hypertension = searchObj(DoctorDiags[i].hypertension,$scope.Hypers);
                            if (DoctorDiags[i].name.typeName == "血透")
                            {
                              DoctorDiags[i].showProgress = false;
                              DoctorDiags[i].showSurgicalTime = true;
                              DoctorDiags[i].timename = "插管日期";
                            }
                            else if (DoctorDiags[i].name.typeName == "肾移植")
                            {
                              DoctorDiags[i].showProgress = false;
                              DoctorDiags[i].showSurgicalTime = true;
                              DoctorDiags[i].timename = "手术日期";
                            }
                            else if (DoctorDiags[i].name.typeName == "腹透")
                            {
                              DoctorDiags[i].showProgress = false;
                              DoctorDiags[i].showSurgicalTime = true;
                              DoctorDiags[i].timename = "开始日期";
                            }
                            else if (DoctorDiags[i].name.typeName == "ckd5期未透析")
                            {
                              DoctorDiags[i].showProgress = false;
                              DoctorDiags[i].showSurgicalTime = false;
                            }
                            else
                            {
                                
                              DoctorDiags[i].showProgress = true;
                              DoctorDiags[i].showSurgicalTime = false;
                              DoctorDiags[i].DiseaseDetails = DoctorDiags[i].name.details;
                              console.log(DoctorDiags[i].DiseaseDetails);
                              if(DoctorDiags[i].DiseaseDetails!=undefined){
                                DoctorDiags[i].progress = searchObj(DoctorDiags[i].progress,DoctorDiags[i].DiseaseDetails);             
                              }
                            }
                          }

                        }
                        $scope.Diags = DoctorDiags;

                      // console.log($scope.Diseases)
                    },
                    function(err)
                    {
                      console.log(err);
                    }
                  )

                

            }else{
                $scope.noDiags =true;
            }
        },function(err){
            console.log(err);
        });
    }
     $scope.$on('$ionicView.enter', function() {
        RefreshDiagnosisInfo();
    })

    
    $scope.do_refresher = function(){
        RefreshDiagnosisInfo();
        $scope.$broadcast('scroll.refreshComplete');
    }
    

}])

.controller('adviceCtrl', ['$scope','$state','$ionicPopup','$ionicLoading', 'Advice','Storage','$timeout', function ($scope,$state,$ionicPopup,$ionicLoading,Advice,Storage,$timeout) {

    $scope.deliverAdvice = function(advice){
        
        Advice.postAdvice({userId:Storage.get('UID'),role:"patient",content:advice.content}).then(
            function(data){
                if(data.result == "新建成功"){
                    $ionicLoading.show({
                        template: '提交成功',
                        noBackdrop: false,
                        duration: 1000,
                        hideOnStateChange: true
                    });
                    $timeout(function(){$state.go('tab.mine');},900);
                }
            },function(err){
                $ionicLoading.show({
                    template: '提交失败',
                    noBackdrop: false,
                    duration: 1000,
                    hideOnStateChange: true
                });
            })
        
    }
}])