angular.module('ionic-datepicker.service', [])

  .service('IonicDatepickerService', function () {
    this.monthsList = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

    this.getYearsList = function (from, to) {
      console.log(from, to)
      var yearsList = []
      var minYear = 1900
      var maxYear = new Date().getFullYear() + 1

      minYear = from ? new Date(from).getFullYear() : minYear
      maxYear = to ? new Date(to).getFullYear() : maxYear

      for (var i = maxYear; i >= minYear; i--) {
        yearsList.push(i)
      }

      return yearsList
    }
  })

angular.module('kidney.services', ['ionic', 'ngResource'])

// 客户端配置
.constant('CONFIG', {
  appKey: 'fe7b9ba069b80316653274e4',
  crossKey: 'cf32b94444c4eaacef86903e',
  // baseUrl: 'http://121.43.107.106:4050/api/v1/',
  // mediaUrl: 'http://121.43.107.106:8052/',
  // socketUrl: 'http://121.43.107.106:4050/chat',
  // imgThumbUrl: 'http://121.43.107.106:8052/uploads/photos/resize',
  // imgLargeUrl: 'http://121.43.107.106:8052/uploads/photos/',
  baseUrl: 'http://121.196.221.44:4060/api/v1/',
  mediaUrl: 'http://121.196.221.44:8055/',
  socketUrl: 'http://121.196.221.44:4060/chat',
  imgThumbUrl: 'http://121.196.221.44:8055/uploads/photos/resize',
  imgLargeUrl: 'http://121.196.221.44:8055/uploads/photos/',
  cameraOptions: {
    cam: {
      quality: 60,
      destinationType: 1,
      sourceType: 1,
      allowEdit: true,
      encodingType: 0,
      targetWidth: 1000,
      targetHeight: 1000,
      popoverOptions: false,
      saveToPhotoAlbum: false
    },
    gallery: {
      quality: 60,
      destinationType: 1,
      sourceType: 0,
      allowEdit: true,
      encodingType: 0,
      targetWidth: 1000,
      targetHeight: 1000
    }
  }
})

// 本地存储函数
.factory('Storage', ['$window', function ($window) {
  return {
    set: function (key, value) {
      $window.localStorage.setItem(key, value)
    },
    get: function (key) {
      return $window.localStorage.getItem(key)
    },
    rm: function (key) {
      $window.localStorage.removeItem(key)
    },
    clear: function () {
      $window.localStorage.clear()
    }
  }
}])
// media文件操作 XJZ
.factory('fs', ['$q', '$cordovaFile', '$filter', 'checknetwork', function ($q, $cordovaFile, $filter, checknetwork) {
  return {
    mvMedia: function (type, fileName, ext) {
      return $q(function (resolve, reject) {
        if (type === 'voice') var path = cordova.file.externalRootDirectory
        else if (type === 'image') var path = cordova.file.externalCacheDirectory
        else reject('type must be voice or image')
        var time = new Date()
        var newName = $filter('date')(time, 'yyyyMMddHHmmss') + ext
        $cordovaFile.moveFile(path, fileName, cordova.file.dataDirectory, newName).then(function (success) {
                    // console.log(success);
          resolve(success.nativeURL)
        }, function (error) {
                    /// /checknetwork.checknetwork(error);
          console.log(error)
          reject(error)
        })
      })
    }
  }
}])

// voice recorder XJZ
.factory('voice', ['$filter', '$q', '$ionicLoading', '$cordovaFile', 'CONFIG', 'Storage', 'fs', 'checknetwork', function ($filter, $q, $ionicLoading, $cordovaFile, CONFIG, Storage, fs, checknetwork) {
    // funtion audio(){};
  var audio = {}
  audio.src = ''
  audio.media = {}

  audio.record = function (receiver, onSuccess, onError) {
    return $q(function (resolve, reject) {
      if (audio.media.src) audio.media.release()
      var time = new Date()
      audio.src = $filter('date')(time, 'yyyyMMddHHmmss') + '.amr'
      audio.media = new Media(audio.src,
                function () {
                  console.info('recordAudio():Audio Success')
                  console.log(audio.media)
                  $ionicLoading.hide()

                  fs.mvMedia('voice', audio.src, '.amr')
                        .then(function (fileUrl) {
                          console.log(fileUrl)
                          resolve(fileUrl)
                            // window.JMessage.sendSingleVoiceMessage(receiver, fileUrl, CONFIG.appKey,
                            //     function(res) {
                            //         resolve(res);
                            //     },
                            //     function(err) {
                            //         reject(err)
                            //     });
                            // resolve(fileUrl.substr(fileUrl.lastIndexOf('/')+1));
                        }, function (err) {
                            // checknetwork.checknetwork(err);
                          console.log(err)
                          reject(err)
                        })
                },
                function (err) {
                    // checknetwork.checknetwork(err);
                  console.error('recordAudio():Audio Error')
                  console.log(err)
                  reject(err)
                })
      audio.media.startRecord()
      $ionicLoading.show({ template: 'recording' })
    })
  }
  audio.stopRec = function () {
    audio.media.stopRecord()
  }
  audio.open = function (fileUrl) {
    if (audio.media.src)audio.media.release()
    return $q(function (resolve, reject) {
      audio.media = new Media(fileUrl,
                function (success) {
                  resolve(audio.media)
                },
                function (err) {
                    // checknetwork.checknetwork(err);
                  reject(err)
                })
    })
  }
  audio.play = function (src) {
    audio.media.play()
  }
  audio.stop = function () {
    audio.media.stop()
  }
  audio.sendAudio = function (fileUrl, receiver) {
        // return $q(function(resolve, reject) {
    window.JMessage.sendSingleVoiceMessage(receiver, cordova.file.externalRootDirectory + fileUrl, CONFIG.appKey,
            function (response) {
              console.log('audio.send():OK')
              console.log(response)
                // $ionicLoading.show({ template: 'audio.send():[OK] '+response,duration:1500});
                // resolve(response);
            },
            function (err) {
                // $ionicLoading.show({ template: 'audio.send():[failed] '+err,duration:1500});
                // checknetwork.checknetwork(err);
              console.log('audio.send():failed')
              console.log(err)
                // reject(err);
            })
        // });
  }
  return audio
}])
.factory('jmapi', ['$http', 'JM', 'jm', 'checknetwork', function ($http, JM, jm, checknetwork) {
  return {
    registerByPhone: function (phone) {
      return User.getUserId({username: phone})
                .then(function (data) {
                  if (data.UserId) return this.users(data.UserId)
                  return data
                }, function (err) {
                    // checknetwork.checknetwork(err);
                  return err
                })
    },
    users: function (userId) {
      var d = {
        'username': userId,
        'password': JM.pGen(userId),
        'flag': 'patient'
      }
      var arr = [d]
      return jm.users(d)
    },
    groups: function (owner, userArr, Gname, Gdesc) {
      var d = {
        'owner_username': owner,
        'name': Gname,
        'members_username': userArr,
        'desc': Gdesc,
        'flag': 'doctor'
      }
      return jm.groups(d)
    },
    groupsMembers: function (gid, addArr, delArr) {
      var d = {
        'add': addArr,
        'remove': delArr,
        'groupId': gid,
        'flag': 'doctor'
      }
      return jm.groupsMembers(d)
    }
  }
}])
// jmessage XJZ
.factory('JM', ['Storage', '$q', 'Patient', 'checknetwork', function (Storage, $q, Patient, checknetwork) {
  var ConversationList = []
  var messageLIsts = {}
  function pGen (u) {
    return md5(u, 'kidney').substr(4, 10)
  }

  function checkIsLogin () {
    return $q(function (resolve, reject) {
      window.JMessage.getMyInfo(function (response) {
        console.log('user is login' + response)
        var myInfo = JSON.parse(response)
        window.JMessage.username = myInfo.userName
                // window.JMessage.nickname = myInfo.nickname;
                // window.JMessage.gender = myInfo.mGender;
                // usernameForConversation = myInfo.userName;
        resolve(myInfo.userName)
      }, function (response) {
        console.log('User is not login.')
        window.JMessage.username = ''
        window.JMessage.nickname = ''
        window.JMessage.gender = 'unknown'
        reject('not login')
      })
    })
        // console.log("checkIsLogin...");
  }

  function login (user) {
    return $q(function (resolve, reject) {
      if (window.JMessage) {
        Patient.getPatientDetail({ userId: user })
                .then(function (data) {
                  console.log(user)
                  console.log(pGen(user))
                  if (ionic.Platform.platforms[0] != 'browser') {
                    window.JMessage.login(user, pGen(user),
                            function (response) {
                              window.JMessage.updateMyInfo('nickname', data.results.name)
                              window.JMessage.nickname = data.results.name
                              window.JMessage.username = user
                              resolve(user)
                            },
                            function (err) {
                                // checknetwork.checknetwork(err)
                              console.log(err)
                                // reject(err);
                              register(user, data.results.name)
                            })
                  }
                }, function (err) {

                })
      }
    })
  }

  function register (user, nick) {
    return $q(function (resolve, reject) {
      window.JMessage.register(user, pGen(user),
                function (response) {
                  window.JMessage.login(user, pGen(user),
                    function (response) {
                      window.JMessage.updateMyInfo('nickname', nick)
                      window.JMessage.username = user
                      window.JMessage.nickname = nick
                      resolve(user)
                    }, function (err) {
                        // checknetwork.checknetwork(err)
                      console.log(err)
                      reject(err)
                    })
                    // console.log("login callback success" + response);
                    // resolve(user);
                },
                function (response) {
                  console.log('login callback fail' + response)
                  reject(response)
                }
            )
    })
  }

  function onGetRegistrationID (response) {
    console.log('registrationID is ' + response)
    Storage.set('jid', response)
        // $("#registrationId").html(response);
  }

  function getPushRegistrationID () {
    try {
      window.JPush.getRegistrationID(onGetRegistrationID)
      if (device.platform != 'Android') {
        window.JPush.setDebugModeFromIos()
        window.JPush.setApplicationIconBadgeNumber(0)
      } else {
        window.JPush.setDebugMode(true)
      }
    } catch (exception) {
      console.log(exception)
    }
  }

  function onOpenNotification (event) {
    console.log('index onOpenNotification')
    try {
      var alertContent
      if (device.platform == 'Android') {
        alertContent = event.alert
      } else {
        alertContent = event.aps.alert
      }
      alert('open Notification:' + alertContent)
    } catch (exception) {
      console.log('JPushPlugin:onOpenNotification' + exception)
    }
  }

  function onReceiveNotification (event) {
    console.log('index onReceiveNotification')
    try {
      var alertContent
      if (device.platform == 'Android') {
        alertContent = event.alert
      } else {
        alertContent = event.aps.alert
      }
      $('#notificationResult').html(alertContent)
    } catch (exception) {
      console.log(exception)
    }
  }

  function onReceivePushMessage (event) {
    try {
      var message
      if (device.platform == 'Android') {
        message = event.message
      } else {
        message = event.content
      }
      console.log(message)
      $('#messageResult').html(message)
    } catch (exception) {
      console.log('JPushPlugin:onReceivePushMessage-->' + exception)
    }
  }

  function newGroup (name, des, members) {
    return $q(function (resolve, reject) {
      window.JMessage.createGroup('abcde', 'fg',
            // window.JMessage.createGroup(name,des,
                function (data) {
                  console.log(data)
                    // members=$rootScope.newMember;
                  var idStr = []
                  for (var i in members) idStr.push(members[i].userId)
                  idStr.join(',')
                    // window.JMessage.addGroupMembers(groupId,idStr,
                  window.JMessage.addGroupMembers('22818577', 'user004,',
                        function (data) {
                          console.log(data)
                          upload()
                        }, function (err) {
                          $ionicLoading.show({ template: '失败addGroupMembers', duration: 1500 })
                          console.log(err)
                        })
                }, function (err) {
                  $ionicLoading.show({ template: '失败createGroup', duration: 1500 })
                  console.log(err)
                })
    })
  }
  function sendCustom (type, toUser, key, data) {
    console.log(data)

    return $q(function (resolve, reject) {
      if (type = 'single') {
        window.JMessage.sendSingleCustomMessage(toUser, data, key,
                                      function (data) {
                                        resolve(data)
                                      }, function (err) {
                                        reject(err)
                                      })
      } else if (type = 'group') {
        window.JMessage.sendGroupCustomMessage(toUser, data,
                    function (data) {
                      resolve(data)
                    }, function (err) {
                      reject(err)
                    })
      } else {
        reject('wrong type')
      }
    })
  }
  function sendContact (type, toUser, data) {
    return $q(function (resolve, reject) {
      if (type = 'single') {
        window.JMessage.sendSingleCustomMessage(toUser, data, key,
                    function (data) {
                      resolve(data)
                    }, function (err) {
                      reject(err)
                    })
      } else if (type = 'group') {
        window.JMessage.sendGroupCustomMessage(toUser, data, key,
                    function (data) {
                      resolve(data)
                    }, function (err) {
                      reject(err)
                    })
      } else {
        reject('wrong type')
      }
    })
  }
  function sendEndl (type, toUser, data) {
    return $q(function (resolve, reject) {
      if (type = 'single') {
        window.JMessage.sendSingleCustomMessage(toUser, data, key,
                    function (data) {
                      resolve(data)
                    }, function (err) {
                      reject(err)
                    })
      } else if (type = 'group') {
        window.JMessage.sendGroupCustomMessage(toUser, data, key,
                    function (data) {
                      resolve(data)
                    }, function (err) {
                      reject(err)
                    })
      } else {
        reject('wrong type')
      }
    })
  }
  return {
    init: function () {
      window.JPush.init()
            // checkIsLogin()
            // .then(function(data){

            // },function(err){
            //     if(Storage.get('UID')) login(Storage.get('UID'));
            // })
      getPushRegistrationID()
            // document.addEventListener("jmessage.onReceiveMessage", onReceiveMessage, false);
            // document.addEventListener("deviceready", onDeviceReady, false);
            // document.addEventListener("jpush.setTagsWithAlias",
            //     onSetTagsWithAlias, false);
            // document.addEventListener("jpush.openNotification",
            //     onOpenNotification, false);
            // document.addEventListener("jpush.receiveNotification",
            //     onReceiveNotification, false);
            // document.addEventListener("jpush.receiveMessage",
            //     onReceivePushMessage, false);
    },
    pGen: pGen,
    sendCustom: sendCustom,
    login: login,
    register: register,
    checkIsLogin: checkIsLogin,
    getPushRegistrationID: getPushRegistrationID
  }
}])
// 获取图片，拍照or相册，见CONFIG.cameraOptions。return promise。xjz
.factory('Camera', ['$q', '$cordovaCamera', '$cordovaFileTransfer', 'CONFIG', 'fs', 'Upload', function ($q, $cordovaCamera, $cordovaFileTransfer, CONFIG, fs, Upload) {
  return {
    getPicture: function (type) {
      console.log(type)
      return $q(function (resolve, reject) {
        $cordovaCamera.getPicture(CONFIG.cameraOptions[type]).then(function (imageUrl) {
          console.log(imageUrl)
              // file manipulation
          var tail = imageUrl.lastIndexOf('?')
          if (tail != -1) var fileName = imageUrl.slice(imageUrl.lastIndexOf('/') + 1, tail)
          else var fileName = imageUrl.slice(imageUrl.lastIndexOf('/') + 1)
          fs.mvMedia('image', fileName, '.jpg')
              .then(function (res) {
                console.log(res)
                // res: file URL
                resolve(res)
              }, function (err) {
                console.log(err)
                reject(err)
              })
        }, function (err) {
          console.log(err)
          reject('fail to get image')
        })
      })
    },
    getPictureFromPhotos: function (type) {
      console.log(type)
      return $q(function (resolve, reject) {
        $cordovaCamera.getPicture(CONFIG.cameraOptions[type]).then(function (imageUrl) {
          console.log(imageUrl)
              // file manipulation
          var tail = imageUrl.lastIndexOf('?')
          if (tail != -1) var fileName = imageUrl.slice(imageUrl.lastIndexOf('/') + 1, tail)
          else var fileName = imageUrl.slice(imageUrl.lastIndexOf('/') + 1)
          fs.mvMedia('image', fileName, '.jpg')
              .then(function (res) {
                console.log(res)
                // res: file URL
                resolve(res)
              }, function (err) {
                console.log(err)
                reject(err)
              })
        }, function (err) {
          console.log(err)
          reject('fail to get image')
        })
      })
    },
    uploadPicture: function (imgURI, temp_photoaddress) {
      return $q(function (resolve, reject) {
        var uri = encodeURI('http://121.43.107.106:4050/upload')
            // var photoname = Storage.get("UID"); // 取出病人的UID作为照片的名字
        var options = {
          fileKey: 'file',
          fileName: temp_photoaddress,
          chunkedMode: true,
          mimeType: 'image/jpeg'
        }
            // var q = $q.defer();
            // console.log("jinlaile");
            // $cordovaFileTransfer.upload(uri,imgURI,options)
            //   .then( function(r){
            //     console.log("Code = " + r.responseCode);
            //     console.log("Response = " + r.response);
            //     console.log("Sent = " + r.bytesSent);
            //     // var result = "上传成功";
            //     resolve(r.response);
            //   }, function(error){
            //     console.log(error);
            //     alert("An error has occurred: Code = " + error.code);
            //     console.log("upload error source " + error.source);
            //     console.log("upload error target " + error.target);
            //     reject(error);
            //   }, function (progress) {
            //     console.log(progress);
            //   })
        Upload.upload({
          url: uri,
          data: {file: imgURI, options: options}
        }).then(function (resp) {
          console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data)
        }, function (resp) {
          console.log('Error status: ' + resp.status)
        }, function (evt) {
          var progressPercentage = parseInt(100.0 * evt.loaded / evt.total)
          console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name)
        })
      })
    }
  }
}])

// 数据模型
.factory('Data', ['$resource', '$q', '$interval', 'CONFIG', function ($resource, $q, $interval, CONFIG) {
  var serve = {}
  var abort = $q.defer()

  var Dict = function () {
    return $resource(CONFIG.baseUrl + ':path/:route', {path: 'dict'}, {
      getDiseaseType: {method: 'GET', params: {route: 'typeTWO'}, timeout: 100000},
      getDistrict: {method: 'GET', params: {route: 'district'}, timeout: 100000},
      getHospital: {method: 'GET', params: {route: 'hospital'}, timeout: 100000},
      getHeathLabelInfo: {method: 'GET', params: {route: 'typeOne'}, timeout: 100000},
      typeOne: {method: 'GET', params: {route: 'typeOne'}, timeout: 100000}
    })
  }

    // var Task1 = function(){
    //     return $resource(CONFIG.baseUrl + ':path',{path:'tasks'},{
    //         getTask:{method:'GET', params:{}, timeout: 100000}
    //     });
    // };

  var Task = function () {
    return $resource(CONFIG.baseUrl + ':path/:route', {path: 'tasks'}, {
      changeTaskstatus: {method: 'POST', params: {route: 'status'}, timeout: 100000},
      changeTasktime: {method: 'POST', params: {route: 'time'}, timeout: 100000},
      insertTask: {method: 'POST', params: {route: 'taskModel'}, timeout: 100000},
      getUserTask: {method: 'GET', params: {route: 'task'}, timeout: 100000},
      updateUserTask: {method: 'POST', params: {route: 'task'}, timeout: 100000}
    })
  }

  var Compliance = function () {
    return $resource(CONFIG.baseUrl + ':path', {path: 'compliance'}, {
      getcompliance: {method: 'GET', params: {}, timeout: 100000},
      postcompliance: {method: 'POST', params: {}, timeout: 100000}
    })
  }

  var Counsels = function () {
    return $resource(CONFIG.baseUrl + ':path/:route', {path: 'counsel'}, {
      getCounsel: {method: 'GET', params: {route: 'counsels'}, timeout: 100000},
      questionaire: {method: 'POST', params: {route: 'questionaire'}, timeout: 100000},
      getStatus: {method: 'GET', params: {route: 'status'}, timeout: 100000},
      changeStatus: {method: 'POST', params: {route: 'status'}, timeout: 100000},
      changeType: {method: 'POST', params: {route: 'type'}, timeout: 100000},
      insertCommentScore: {method: 'POST', params: {route: 'score'}, timeout: 100000}
    })
  }

  var Patient = function () {
    return $resource(CONFIG.baseUrl + ':path/:route', {path: 'patient'}, {
      getPatientDetail: {method: 'GET', params: {route: 'detail'}, timeout: 100000},
      getMyDoctors: {method: 'GET', params: {route: 'myDoctors'}, timeout: 10000},
      getDoctorLists: {method: 'GET', params: {route: 'doctors'}, timeout: 10000},
      getCounselRecords: {method: 'GET', params: {route: 'counselRecords'}, timeout: 10000},
            // insertDiagnosis:{method:'POST',params:{route:'diagnosis'},timeout:10000},
            // newPatientDetail:{method:'POST',params:{route:'detail'},timeout:10000},
      editPatientDetail: {method: 'POST', params: {route: 'editDetail'}, timeout: 10000},
      bindingMyDoctor: {method: 'POST', params: {route: 'bindingMyDoctor'}, timeout: 10000},
      replacePhoto: {method: 'POST', params: {route: 'wechatPhotoUrl', patientId: '@patientId', wechatPhotoUrl: '@wechatPhotoUrl'}, timeout: 10000}
    })
  }

  var Doctor = function () {
    return $resource(CONFIG.baseUrl + ':path/:route', {path: 'doctor'}, {
            // createDoc:{method:'POST', params:{route: 'postDocBasic'}, timeout: 100000},
            // getPatientList:{method:'GET', params:{route: 'getPatientList'}, timeout: 100000},
      getDoctorInfo: {method: 'GET', params: {route: 'detail'}, timeout: 100000}
            // getMyGroupList:{method:'GET', params:{route: 'getMyGroupList'}, timeout: 100000},
            // getGroupPatientList:{method:'GET', params:{route: 'getGroupPatientList'}, timeout: 100000}
    })
  }

  var User = function () {
    return $resource(CONFIG.baseUrl + ':path/:route', {path: 'user'}, {
      register: {method: 'POST', skipAuthorization: true, params: {route: 'register', phoneNo: '@phoneNo', password: '@password', role: '@role'}, timeout: 100000},
      changePassword: {method: 'POST', skipAuthorization: true, params: {route: 'reset', phoneNo: '@phoneNo', password: '@password'}, timeout: 100000},
      logIn: {method: 'POST', skipAuthorization: true, params: {route: 'login'}, timeout: 10000},
      logOut: {method: 'POST', params: {route: 'logout', userId: '@userId'}, timeout: 100000},
      getUserId: {method: 'GET', params: {route: 'userID', username: '@username'}, timeout: 100000},
      sendSMS: {method: 'POST', skipAuthorization: true, params: {route: 'sms', mobile: '@mobile', smsType: '@smsType'}, timeout: 100000}, // 第一次验证码发送成功返回结果为”User doesn't exist“，如果再次发送才返回”验证码成功发送“
      verifySMS: {method: 'GET', skipAuthorization: true, params: {route: 'sms', mobile: '@mobile', smsType: '@smsType', smsCode: '@smsCode'}, timeout: 100000},
      getAgree: {method: 'GET', params: {route: 'agreement', userId: '@userId'}, timeout: 100000},
      updateAgree: {method: 'POST', params: {route: 'agreement'}, timeout: 100000},
            // getUserIDbyOpenId:{method:'GET', skipAuthorization: true, params:{route: 'getUserIDbyOpenId'}, timeout: 100000}, //20170619 后端删除该方法，与getUserID方法合并
      setOpenId: {method: 'POST', skipAuthorization: true, params: {route: 'unionid'}, timeout: 100000},
      getMessageOpenId: {method: 'GET', skipAuthorization: true, params: {route: 'openid'}, timeout: 100000},
      setMessageOpenId: {method: 'POST', skipAuthorization: true, params: {route: 'openid'}, timeout: 100000}
    })
  }

  var Health = function () {
    return $resource(CONFIG.baseUrl + ':path/:route', {path: 'healthInfo'}, {
      createHealth: {method: 'POST', params: {route: 'healthInfo', userId: '@userId', type: '@type', time: '@time', url: '@url', label: '@label', description: '@description', comments: '@comments'}, timeout: 100000},
      modifyHealth: {method: 'POST', params: {route: 'healthDetail', userId: '@userId', type: '@type', time: '@time', url: '@url', label: '@label', description: '@description', comments: '@comments', insertTime: '@insertTime'}, timeout: 100000},
      getHealthDetail: {method: 'GET', params: {route: 'healthDetail', userId: '@userId', insertTime: '@insertTime'}, timeout: 100000},
      getAllHealths: {method: 'GET', params: {route: 'healthInfos', userId: '@userId'}, timeout: 100000},
      deleteHealth: {method: 'POST', params: {route: 'deleteHealthDetail', userId: '@userId', insertTime: '@insertTime'}, timeout: 100000}

    })
  }

  var Comment = function () {
    return $resource(CONFIG.baseUrl + ':path/:route', {path: 'comment'}, {
      getComments: {method: 'GET', params: {route: 'getComments'}, timeout: 100000},
      getCommentsByC: {method: 'GET', params: {route: 'getCommentsByC'}, timeout: 100000}
    })
  }

  var VitalSign = function () {
    return $resource(CONFIG.baseUrl + ':path/:route', {path: 'vitalSign'}, {
      getVitalSigns: {method: 'GET', params: {route: 'vitalSigns'}, timeout: 100000},
      insertVitalSign: {method: 'POST', params: {route: 'vitalSign'}, timeout: 100000}
    })
  }

  var Account = function () {
    return $resource(CONFIG.baseUrl + ':path/:route', {path: 'account'}, {
      getAccountInfo: {method: 'GET', params: {route: 'getAccountInfo'}, timeout: 100000},
      getCounts: {method: 'GET', params: {route: 'counts'}, timeout: 100000},
      modifyCounts: {method: 'POST', params: {route: 'counts'}, timeout: 100000},
            // rechargeDoctor:{method:'POST', params:{route: 'rechargeDoctor'}, timeout: 100000},
      updateFreeTime: {method: 'POST', params: {route: 'updateFreeTime'}, timeout: 100000},
      getCountsRespective: {method: 'GET', params: {route: 'getCountsRespective'}, timeout: 100000}
    })
  }

  var Message = function () {
    return $resource(CONFIG.baseUrl + ':path/:route', {path: 'message'}, {
      getMessages: {method: 'GET', params: {route: 'messages'}, timeout: 100000}
    })
  }

  var Advice = function () {
    return $resource(CONFIG.baseUrl + ':path/:route', {path: 'advice'}, {
      postAdvice: {method: 'POST', params: {route: 'postAdvice'}, timeout: 100000}
    })
  }

  var News = function () {
    return $resource(CONFIG.baseUrl + ':path/:route', {path: 'new'}, {
      getNews: {method: 'GET', params: {route: 'news'}, timeout: 100000},
      insertNews: {method: 'POST', params: {route: 'news'}, timeout: 100000},
      getNewsByReadOrNot: {method: 'GET', skipAuthorization: true, params: {route: 'newsByReadOrNot'}, timeout: 100000}
    })
  }

  var Communication = function () {
    return $resource(CONFIG.baseUrl + ':path/:route', {path: 'communication'}, {
      getCommunication: {method: 'GET', params: {route: 'communication'}, timeout: 100000},
      getCounselReport: {method: 'GET', params: {route: 'counselReport'}, timeout: 100000}
            // getTeam:{method:'GET', params:{route: 'getTeam'}, timeout: 100000},
            // insertMember:{method:'POST', params:{route: 'insertMember'}, timeout: 100000},
            // newConsultation:{method:'POST', params:{route: 'newConsultation'}, timeout: 100000},
            // removeMember:{method:'POST', params:{route: 'removeMember'}, timeout: 100000}

    })
  }

  var wechat = function () {
    return $resource(CONFIG.baseUrl + ':path/:route', {path: 'wechat'}, {
      settingConfig: {method: 'GET', skipAuthorization: true, params: {route: 'settingConfig'}, timeout: 100000},
      getUserInfo: {method: 'GET', skipAuthorization: true, params: {route: 'getUserInfo'}, timeout: 10000},
      download: {method: 'GET', params: {route: 'download'}, timeout: 100000},
      addOrder: {method: 'POST', params: {route: 'addOrder'}, timeout: 100000},
      messageTemplate: {method: 'POST', params: {route: 'messageTemplate'}, timeout: 100000}
    })
  }

  var jm = function () {
    return $resource(CONFIG.baseUrl + ':path/:route', {path: 'jm'}, {
      users: {method: 'POST', params: {route: 'users'}, timeout: 100000},
      groups: {method: 'POST', params: {route: 'groups'}, timeout: 100000},
      groupsMembers: {method: 'POST', params: {route: 'groups/members'}, timeout: 100000}
    })
  }

  var order = function () {
    return $resource(CONFIG.baseUrl + ':path/:route', {path: 'order'}, {
            // insertOrder:{method:'POST', params:{route: 'order'}, timeout: 100000},
      updateOrder: {method: 'POST', params: {route: 'order'}, timeout: 100000},
      getOrder: {method: 'GET', params: {route: 'order'}, timeout: 100000}
    })
  }

  var insurance = function () {
    return $resource(CONFIG.baseUrl + ':path/:route', {path: 'insurance'}, {
      setPrefer: {method: 'POST', params: {route: 'prefer'}, timeout: 100000},
      getPrefer: {method: 'GET', params: {route: 'prefer'}, timeout: 100000}
    })
  }

  var Expense = function () {
    return $resource(CONFIG.baseUrl + ':path/:route', {path: 'expense'}, {
      rechargeDoctor: {method: 'POST', params: {route: 'rechargeDoctor'}, timeout: 100000}
    })
  }
  serve.abort = function ($scope) {
    abort.resolve()
    $interval(function () {
      abort = $q.defer()
      serve.Dict = Dict()
            // serve.Task1 = Task1();
      serve.Task = Task()
      serve.Compliance = Compliance()
      serve.Counsels = Counsels()
      serve.Patient = Patient()
      serve.Doctor = Doctor()
      serve.Health = Health()
      serve.User = User()
      serve.Comment = Comment()
      serve.VitalSign = VitalSign()
      serve.Account = Account()
      serve.Message = Message()
      serve.Advice = Advice()
      serve.News = News()
      serve.Communication = Communication()
      serve.wechat = wechat()
      serve.jm = jm()
      serve.order = order()
      serve.insurance = insurance()
      serve.Expense = Expense()
    }, 0, 1)
  }
  serve.Dict = Dict()
    // serve.Task1 = Task1();
  serve.Task = Task()
  serve.Compliance = Compliance()
  serve.Counsels = Counsels()
  serve.Patient = Patient()
  serve.Doctor = Doctor()
  serve.Health = Health()
  serve.User = User()
  serve.Comment = Comment()
  serve.VitalSign = VitalSign()
  serve.Account = Account()
  serve.Message = Message()
  serve.Advice = Advice()
  serve.News = News()
  serve.Communication = Communication()
  serve.wechat = wechat()
  serve.jm = jm()
  serve.order = order()
  serve.insurance = insurance()
  serve.Expense = Expense()
  return serve
}])

.factory('Dict', ['$q', 'Data', 'checknetwork', function ($q, Data, checknetwork) {
  var self = this
    // params->{
            //  category:'patient_class'
           // }
  self.getDiseaseType = function (params) {
    var deferred = $q.defer()
    Data.Dict.getDiseaseType(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
                // checknetwork.checknetwork(err);
              deferred.reject(err)
            })
    return deferred.promise
  }
    // params->{
            //  level:'3',//1获取省份，2获取城市，3获取区县
            //  province:"33", //定位到某个具体省份时需要输入
            //  city:'01',  //定位到某个具体城市时需要输入
            //  district:'02' //定位到某个具体区县时需要输入
           // }
  self.getDistrict = function (params) {
    var deferred = $q.defer()
    Data.Dict.getDistrict(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
                // checknetwork.checknetwork(err);
              deferred.reject(err)
            })
    return deferred.promise
  }
    // params->{
            //  locationCode:'330103',//输入全部为空时获取全部医院信息，需要定位到某个具体地区时需要输入locationCode，定位到某个具体医院时需要输入hospitalCode
            //  hostipalCode:"001"
           // }
  self.getHospital = function (params) {
    var deferred = $q.defer()
    Data.Dict.getHospital(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
                // checknetwork.checknetwork(err);
              deferred.reject(err)
            })
    return deferred.promise
  }
    // params->{
            //  category:'healthInfoType'
           // }
  self.getHeathLabelInfo = function (params) {
    var deferred = $q.defer()
    Data.Dict.getHeathLabelInfo(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
                // checknetwork.checknetwork(err);
              deferred.reject(err)
            })
    return deferred.promise
  }
    // params->{
    //    category:'MessageType'
    // }
  self.typeOne = function (params) {
    var deferred = $q.defer()
    Data.Dict.typeOne(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
                // checknetwork.checknetwork(err);
              deferred.reject(err)
            })
    return deferred.promise
  }
  return self
}])

.factory('Task', ['$q', 'Data', 'checknetwork', function ($q, Data, checknetwork) {
  var self = this
    // params->{
            //  userId:'U201704050002',//usderId="Admin"，sortNo为空时获取系统全部任务模板，sortNo="1"时获取指定任务模板，userId为用户ID时获取指定用户的任务信息
            //  sortNo:'1'
           // }
    // self.getTask = function(params){
    //     var deferred = $q.defer();
    //     Data.Task.getTask(
    //         params,
    //         function(data, headers){
    //             deferred.resolve(data);
    //         },
    //         function(err){
    //             //checknetwork.checknetwork(err);
    //             deferred.reject(err);
    //     });
    //     return deferred.promise;
    // };
    // params->{
            //  userId:'U201704050002',//unique
            //  sortNo:1,
            //  type:'Measure',
            //  code:'BloodPressure',
            //  status:'0'
           // }
  self.changeTaskstatus = function (params) {
    var deferred = $q.defer()
    Data.Task.changeTaskstatus(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
                // checknetwork.checknetwork(err);
              deferred.reject(err)
            })
    return deferred.promise
  }
    // params->{
            //  userId:'U201704050002',//unique
            //  sortNo:1,
            //  type:'Measure',
            //  code:'BloodPressure',
            //  startTime:'2017-12-12'
           // }
  self.changeTasktime = function (params) {
    var deferred = $q.defer()
    Data.Task.changeTasktime(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
                // checknetwork.checknetwork(err);
              deferred.reject(err)
            })
    return deferred.promise
  }
    // params->{
            //  userId:'U201704050002',//unique
            //  sortNo:1,
           // }
  self.insertTask = function (params) {
    var deferred = $q.defer()
    Data.Task.insertTask(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
                // checknetwork.checknetwork(err);
              deferred.reject(err)
            })
    return deferred.promise
  }

  self.getUserTask = function (params) {
    var deferred = $q.defer()
    Data.Task.getUserTask(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
                // checknetwork.checknetwork(err);
              deferred.reject(err)
            })
    return deferred.promise
  }

  self.updateUserTask = function (params) {
    var deferred = $q.defer()
    Data.Task.updateUserTask(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
                // checknetwork.checknetwork(err);
              deferred.reject(err)
            })
    return deferred.promise
  }

  return self
}])

.factory('Compliance', ['$q', 'Data', 'checknetwork', function ($q, Data, checknetwork) {
  var self = this
    // params->{
            // "userId": "U201704050002",
            // "type": "Measure",
            // "code": "Weight",
            // "date": "2017-12-13",
            // "status": 0,
            // "description": ""
           // }
  self.postcompliance = function (params) {
    var deferred = $q.defer()
    Data.Compliance.postcompliance(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
                // checknetwork.checknetwork(err);
              deferred.reject(err)
            })
    return deferred.promise
  }
    // params->{
            //  userId:'U201704050002',//date为空时获取指定用户的全部任务执行记录，date不为空时获取指定用户某一天的任务执行记录
            //  date:'2017-12-13'
           // }
  self.getcompliance = function (params) {
    var deferred = $q.defer()
    Data.Compliance.getcompliance(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
                // checknetwork.checknetwork(err);
              deferred.reject(err)
            })
    return deferred.promise
  }
  return self
}])

.factory('otherTask', ['Task', 'Compliance', 'Storage', function (Task, Compliance, Storage) {
  var self = this
    // 其他任务后处理
    // 日期延后计算
  var UserId = Storage.get('UID')
  var DateCalc = function (LastDate, Type, Addition) {
    var Date1 = new Date(LastDate)
    var Date2
    if (Type == '周') // 周
      {
      Date2 = new Date(Date1.setDate(Date1.getDate() + Addition))
    } else if (Type == '月') {
      Date2 = new Date(Date1.setMonth(Date1.getMonth() + Addition))
    } else // 年
      {
      Date2 = new Date(Date1.setYear(Date1.getFullYear() + Addition))
    }
    return Date2
  }
    // 比较时间天数
  var GetDifDays = function (date1Str, date2Str) {
    res = 0
    var date1 = new Date(date1Str)
    var date2 = new Date(date2Str)
    if ((date1 instanceof Date) && (date2 instanceof Date)) {
      days = date1.getTime() - date2.getTime()
      res = parseInt(days / (1000 * 60 * 60 * 24))
    }
    return res
  }
    // 修改日期格式Date → yyyy-mm-dd
  var ChangeTimeForm = function (date) {
    var nowDay = ''
    if (date instanceof Date) {
      var mon = date.getMonth() + 1
      var day = date.getDate()
      nowDay = date.getFullYear() + '-' + (mon < 10 ? '0' + mon : mon) + '-' + (day < 10 ? '0' + day : day)
    }
    return nowDay
  }
  var dateNowStr = ChangeTimeForm(new Date())

   // 任务完成后设定下次任务执行时间
  var SetNextTime = function (LastDate, FreqTimes, Unit, Times) {
    var NextTime
    if ((Unit == '年') && (Times == 2))// 一年2次
        {
      Unit = '月'
      FreqTimes = 6
    }
    var tbl = {'周': 7, '月': 30, '年': 365}
    var someDays = tbl[Unit] * FreqTimes
    var days = GetDifDays(LastDate, dateNowStr)
    if (days > someDays) {
      NextTime = new Date(LastDate)
    } else {
      var add = FreqTimes
      if (Unit == '周') {
        add = FreqTimes * 7
      }
      NextTime = DateCalc(LastDate, Unit, add)
    }
        // console.log(NextTime);
    return NextTime
  }

    // 更新用户任务模板
  var UpdateUserTask = function (task) {
    var promise = Task.updateUserTask(task)
    promise.then(function (data) {
         // console.log(data);
      if (data.results) {
          // console.log(data.results);
      };
    }, function () {
    })
  }
    // 血透任务执行后处理
  var HemoTaskDone = function (task, flag) {
       // console.log(task);
    var dateStr = task.DateStr
    var StartArry = dateStr.split('+')[0].split(',')
    var Mediean = dateStr.split('+')[1]
    var EndArry = []
    var content
    if (dateStr.split('+')[2]) {
      EndArry = dateStr.split('+')[2].split(',')
    }
    var instructionArry = task.instruction.split('，')
    if (instructionArry.length > EndArry.length) // 判断是添加还是修改，修改不加次数
       {
      var newEnd = dateNowStr
      EndArry.push(newEnd)
      task.Progress = (Math.round(EndArry.length / task.times * 10000) / 100).toFixed(2) + '%' // 更新进度条
    }

    if (EndArry.length == task.times) {
      task.Flag = true
    }
    content = GetHemoStr(StartArry, Mediean, EndArry)

        // 更新任务完成时间

    task.endTime = EndArry.join(',')
    task.DateStr = GetHemoStr(StartArry, Mediean, EndArry)

        // 更新任务模板
    item = {
      'userId': UserId,
      'type': task.type,
      'code': task.code,
      'instruction': task.instruction,
      'content': task.DateStr,
      'startTime': '2050-11-02T07:58:51.718Z',
      'endTime': '2050-11-02T07:58:51.718Z',
      'times': task.times,
      'timesUnits': task.timesUnits,
      'frequencyTimes': task.frequencyTimes,
      'frequencyUnits': task.frequencyUnits
    }
    console.log(item)
    UpdateUserTask(item)
  }

  var OtherTaskDone = function (task, Description) {
    var NextTime = ''
    var item
        // var instructionStr = task.instruction;//避免修改模板 暂时就让它修改吧
    task.instruction = Description // 用于页面显示
    console.log('attention')
        // console.log(task);
    console.log(task.endTime)
    task.Flag = true
    task.endTime = task.endTime.substr(0, 10)
        // console.log(task.endTime);

    if (task.endTime != '2050-11-02T07:58:51.718Z') // 说明任务已经执行过
        {
      task.DoneFlag = true
    } else {
      task.DoneFlag = false
    }
    NextTime = ChangeTimeForm(SetNextTime(task.startTime, task.frequencyTimes, task.frequencyUnits, task.times))
    task.startTime = NextTime// 更改页面显示
        // console.log(dateNowStr);
    task.endTime = dateNowStr
        // console.log(task.endTime);

    item = {
      'userId': UserId,
      'type': task.type,
      'code': task.code,
      'instruction': task.instruction,
      'content': task.content,
      'startTime': NextTime,
      'endTime': task.endTime,
      'times': task.times,
      'timesUnits': task.timesUnits,
      'frequencyTimes': task.frequencyTimes,
      'frequencyUnits': task.frequencyUnits
    }
        // console.log(item);
    UpdateUserTask(item)  // 更改任务下次执行时间
  }
    // 插入任务执行情况
  this.Postcompliance_UpdateTaskStatus = function (task, otherTasks, healthID) {
         // console.log(otherTasks);
    var item = {
      'userId': UserId,
      'type': task.type,
      'code': task.code,
      'date': dateNowStr,
      'status': 0,
      'description': healthID
    }
        // console.log(item);
    var promise = Compliance.postcompliance(item)
    promise.then(function (data) {
            // console.log(data);
      if (data.results) {
        console.log(data.results)
        var Code = data.results.code
        var Description = data.results.description
        for (var i = 0; i < otherTasks.length; i++) {
          var task = otherTasks[i]
          if (task.code == Code) {
                        // console.log(task);
                        // console.log(otherTasks[i]);
            OtherTaskDone(task, Description)
            break
          }
        }
              // OtherTaskDone(data.results, data.results.description);
      }
    }, function () {
    })
  }
  return self
}])

.factory('User', ['$q', 'Data', 'checknetwork', function ($q, Data, checknetwork) {
  var self = this
    // params->{
        // phoneNo:"18768113669",
        // password:"123456",
        // role:"patient"
        // }
        // 000
  self.register = function (params) {
    var deferred = $q.defer()
    Data.User.register(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
                // checknetwork.checknetwork(err);
              deferred.reject(err)
            })
    return deferred.promise
  }
    // params->{
        // phoneNo:"18768113669",
        // password:"123",
        // }
        // 001
  self.changePassword = function (params) {
    var deferred = $q.defer()
    Data.User.changePassword(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
                // checknetwork.checknetwork(err);
              deferred.reject(err)
            })
    return deferred.promise
  }

    // params->{
        // username:"18768113669",
        // password:"123456",
        // role:"patient"
        // }
        // 002
  self.logIn = function (params) {
    var deferred = $q.defer()
    Data.User.logIn(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
                // checknetwork.checknetwork(err);
              deferred.reject(err)
            })
    return deferred.promise
  }

    // params->{userId:"U201704010002"}
    // 003
  self.logOut = function (params) {
    var deferred = $q.defer()
    Data.User.logOut(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
                // checknetwork.checknetwork(err);
              deferred.reject(err)
            })
    return deferred.promise
  }

    // params->{phoneNo:"18768113668"}
    // 004
  self.getUserId = function (params) {
    var deferred = $q.defer()
    Data.User.getUserId(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
                // checknetwork.checknetwork(err);
              deferred.reject(err)
            })
    return deferred.promise
  }

    // params->{
        // mobile:"18768113660",
        // smsType:1}
    // 005
  self.sendSMS = function (params) {
    var deferred = $q.defer()
    Data.User.sendSMS(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
                // checknetwork.checknetwork(err);
              deferred.reject(err)
            })
    return deferred.promise
  }

    // params->{
        // mobile:"18868186038",
        // smsType:1
        // smsCode:234523}
    // 006
  self.verifySMS = function (params) {
    var deferred = $q.defer()
    Data.User.verifySMS(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
                // checknetwork.checknetwork(err);
              deferred.reject(err)
            })
    return deferred.promise
  }
    // params->{userId:"U201703310032"}
    // 036
  self.getAgree = function (params) {
    var deferred = $q.defer()
    Data.User.getAgree(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
                // checknetwork.checknetwork(err);
              deferred.reject(err)
            })
    return deferred.promise
  }

    // params->{userId:"U201703310032",agreement:"0"}
    // 037
  self.updateAgree = function (params) {
    var deferred = $q.defer()
    Data.User.updateAgree(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
                // checknetwork.checknetwork(err);
              deferred.reject(err)
            })
    return deferred.promise
  }

    // params->{openId:"U201703310032"} //20170619 后端删除该方法，与getUserID方法合并
    // self.getUserIDbyOpenId = function(params){
    //     var deferred = $q.defer();
    //     Data.User.getUserIDbyOpenId(
    //         params,
    //         function(data, headers){
    //             deferred.resolve(data);
    //         },
    //         function(err){
    //             //checknetwork.checknetwork(err);
    //             deferred.reject(err);
    //     });
    //     return deferred.promise;
    // }

    // params->{phoneNo:"",openId:"U201703310032"}
  self.setOpenId = function (params) {
    var deferred = $q.defer()
    Data.User.setOpenId(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
                // checknetwork.checknetwork(err);
              deferred.reject(err)
            })
    return deferred.promise
  }

    // params->{type:"",userId:"U201703310032"}type:(1:doctorwechat,2:patientwechat,3:doctorapp,4:patientapp,5:test)
  self.getMessageOpenId = function (params) {
    var deferred = $q.defer()
    Data.User.getMessageOpenId(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
                // checknetwork.checknetwork(err);
              deferred.reject(err)
            })
    return deferred.promise
  }

    // params->{type:"",openId:"",userId:""}type:(1:doctorwechat,2:patientwechat,3:doctorapp,4:patientapp,5:test)
  self.setMessageOpenId = function (params) {
    var deferred = $q.defer()
    Data.User.setMessageOpenId(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
                // checknetwork.checknetwork(err);
              deferred.reject(err)
            })
    return deferred.promise
  }

  return self
}])

.factory('Health', ['$q', 'Data', 'checknetwork', function ($q, Data, checknetwork) {
  var self = this
    // params->{
        // userId:"U201704010003",
        // }
        // 011
  self.getAllHealths = function (params) {
    var deferred = $q.defer()
    Data.Health.getAllHealths(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
                // checknetwork.checknetwork(err);
              deferred.reject(err)
            })
    return deferred.promise
  }
    // params->{
        // userId:"U201704010003",
        // insertTime:"2017-04-11T05:43:36.965Z",
        // }
        // 012
  self.getHealthDetail = function (params) {
    var deferred = $q.defer()
    Data.Health.getHealthDetail(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
                // checknetwork.checknetwork(err);
              deferred.reject(err)
            })
    return deferred.promise
  }
    // params->{
        // userId:"U201704010003",
        // type:2,
        // time:"2014/02/22",
        // url:"c:/wf/img.jpg",
        // description:"晕厥入院，在医院住了3天，双侧颈动脉无异常搏动，双侧颈静脉怒张，肝颈静脉回流征阳性，气管居中，甲状腺不肿大，未触及结节无压痛、震颤，上下均为闻及血管杂音。",
        // }
        // 013
  self.createHealth = function (params) {
    var deferred = $q.defer()
    Data.Health.createHealth(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
                // checknetwork.checknetwork(err);
              deferred.reject(err)
            })
    return deferred.promise
  }
    // params->{
        // userId:"U201704010003",
        // insertTime:"2017-04-11T05:43:36.965Z",
        // type:3,
        // time:"2014/02/22",
        // url:"c:/wf/img.jpg",
        // description:"修改晕厥入院，在医院住了3天，双侧颈动脉无异常搏动，双侧颈静脉怒张，肝颈静脉回流征阳性，气管居中，甲状腺不肿大，未触及结节无压痛、震颤，上下均为闻及血管杂音。",
        // }
        // 014
  self.modifyHealth = function (params) {
    var deferred = $q.defer()
    Data.Health.modifyHealth(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
                // checknetwork.checknetwork(err);
              deferred.reject(err)
            })
    return deferred.promise
  }

    // params->{
        // userId:"U201704010003",
        // insertTime:"2017-04-11T05:43:36.965Z",
        // }
        // 015
  self.deleteHealth = function (params) {
    var deferred = $q.defer()
    Data.Health.deleteHealth(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
                // checknetwork.checknetwork(err);
              deferred.reject(err)
            })
    return deferred.promise
  }

  return self
}])

.factory('Patient', ['$q', 'Data', 'checknetwork', function ($q, Data, checknetwork) {
  var self = this
    // params->0:{userId:'p01'}
  self.getPatientDetail = function (params) {
    var deferred = $q.defer()
    Data.Patient.getPatientDetail(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
                // checknetwork.checknetwork(err);
              deferred.reject(err)
            })
    return deferred.promise
  }

    // params->0:{userId:'p01'}
  self.getMyDoctors = function (params) {
    var deferred = $q.defer()
    Data.Patient.getMyDoctors(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
                // checknetwork.checknetwork(err);
              deferred.reject(err)
            })
    return deferred.promise
  }

    // params->0:{workUnit:'浙江省人民医院'}
    //        1:{workUnit:'浙江省人民医院',name:'医生01'}
  self.getDoctorLists = function (params) {
    var deferred = $q.defer()
    Data.Patient.getDoctorLists(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
                // checknetwork.checknetwork(err);
              deferred.reject(err)
            })
    return deferred.promise
  }

    // params->0:{userId:'p01'}
  self.getCounselRecords = function (params) {
    var deferred = $q.defer()
    Data.Patient.getCounselRecords(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
                // checknetwork.checknetwork(err);
              deferred.reject(err)
            })
    return deferred.promise
  }

    // params->0:{
            //     patientId:'ppost01',
            //     doctorId:'doc01',
            //     diagname:'慢性肾炎',
            //     diagtime:'2017-04-06',
            //     diagprogress:'吃药',
            //     diagcontent:'blabla啥啥啥的'
            // }
    // self.insertDiagnosis = function(params){
    //     var deferred = $q.defer();
    //     Data.Patient.insertDiagnosis(
    //         params,
    //         function(data, headers){
    //             deferred.resolve(data);
    //         },
    //         function(err){
    //             //checknetwork.checknetwork(err);
    //             deferred.reject(err);
    //     });
    //     return deferred.promise;
    // };

    // params->0:{
            //     userId:'ppost01',
            //     name:'患者xx',
            //     birthday:'1987-03-25',
            //     gender:2,
            //     IDNo:123456123456781234,
            //     height:183,
            //     weight:70,
            //     bloodType:2,
            //     class:'class1',
            //     class_info:'info_1',
            //     operationTime:'2017-04-05',
            //     hypertension:1,
            //     photoUrl:'http://photo/ppost01.jpg'
            // }
    // self.newPatientDetail = function(params){
    //     var deferred = $q.defer();
    //     Data.Patient.newPatientDetail(
    //         params,
    //         function(data, headers){
    //             deferred.resolve(data);
    //         },
    //         function(err){
    //             //checknetwork.checknetwork(err);
    //             deferred.reject(err);
    //     });
    //     return deferred.promise;
    // };

    // params->0:{
                // userId:'ppost01',
                // name:'新名字2',
                // birthday:1987-03-03,
                // gender:1,
                // IDNo:123456123456781234,
                // height:183,
                // weight:70,
                // bloodType:2,
                // class:'class1',
                // class_info:'info3',
                // hypertension:1,
                // photoUrl:'http://photo/ppost01.jpg'
            // }
  self.editPatientDetail = function (params) {
    var deferred = $q.defer()
    Data.Patient.editPatientDetail(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
                // checknetwork.checknetwork(err);
              deferred.reject(err)
            })
    return deferred.promise
  }
  self.bindingMyDoctor = function (params) {
    var deferred = $q.defer()
    Data.Patient.bindingMyDoctor(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
                // checknetwork.checknetwork(err);
              deferred.reject(err)
            })
    return deferred.promise
  }

    // params->{
                // userId:'ppost01',
                // wechatPhotoUrl:'http://photo/ppost12.jpg',
            // }
  self.replacePhoto = function (params) {
    var deferred = $q.defer()
    Data.Patient.replacePhoto(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }

  return self
}])

.factory('Doctor', ['$q', 'Data', 'checknetwork', function ($q, Data, checknetwork) {
  var self = this
    // params->0:{
           //   userId:'docpostTest',//unique
           //   name:'姓名',
           //   birthday:'1956-05-22',
           //   gender:1,
           //   workUnit:'浙江省人民医院',
           //   department:'肾内科',
           //   title:'副主任医师',
           //   major:'慢性肾炎',
           //   description:'经验丰富',
           //   photoUrl:'http://photo/docpost3.jpg',
           //   charge1:150,
           //   charge2:50
           // }
    // self.postDocBasic = function(params){
    //     var deferred = $q.defer();
    //     Data.Doctor.postDocBasic(
    //         params,
    //         function(data, headers){
    //             deferred.resolve(data);
    //         },
    //         function(err){
    //             //checknetwork.checknetwork(err);
    //             deferred.reject(err);
    //     });
    //     return deferred.promise;
    // };
    // params->0:{
           //   userId:'doc01'
           // }
    // self.getPatientList = function(params){
    //     var deferred = $q.defer();
    //     Data.Doctor.getPatientList(
    //         params,
    //         function(data, headers){
    //             deferred.resolve(data);
    //         },
    //         function(err){
    //             //checknetwork.checknetwork(err);
    //             deferred.reject(err);
    //     });
    //     return deferred.promise;
    // };
    // params->0:{
           //   userId:'doc01'
           // }
  self.getDoctorInfo = function (params) {
    var deferred = $q.defer()
    Data.Doctor.getDoctorInfo(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
                // checknetwork.checknetwork(err);
              deferred.reject(err)
            })
    return deferred.promise
  }
    // params->0:{
           //   userId:'doc01'
           // }
    // self.getMyGroupList = function(params){
    //     var deferred = $q.defer();
    //     Data.Doctor.getMyGroupList(
    //         params,
    //         function(data, headers){
    //             deferred.resolve(data);
    //         },
    //         function(err){
    //             //checknetwork.checknetwork(err);
    //             deferred.reject(err);
    //     });
    //     return deferred.promise;
    // };
    // params->0:{
           //   teamId:'team1',
           //   status:1
           // }
    // self.getGroupPatientList = function(params){
    //     var deferred = $q.defer();
    //     Data.Doctor.getGroupPatientList(
    //         params,
    //         function(data, headers){
    //             deferred.resolve(data);
    //         },
    //         function(err){
    //             //checknetwork.checknetwork(err);
    //             deferred.reject(err);
    //     });
    //     return deferred.promise;
    // };
  return self
}])

.factory('Counsels', ['$q', 'Data', 'checknetwork', function ($q, Data, checknetwork) {
  var self = this
    // params->0:{userId:'doc01',status:1}
    //        1:{userId:'doc01'}
    //        1:{userId:'doc01',type:1}
    //        1:{userId:'doc01',status:1,type:1}
  self.getCounsels = function (params) {
    var deferred = $q.defer()
    Data.Counsels.getCounsel(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
                // checknetwork.checknetwork(err);
              deferred.reject(err)
            })
    return deferred.promise
  }
    // params->0:{
    //              counselId:'counselpost02',
    //              patientId:'p01',
    //              doctorId:'doc01',
    //              sickTime:'3天',
    //              symptom:'腹痛',
    //              symptomPhotoUrl:'http://photo/symptom1',
    //              help:'帮助'
    //          }
  self.questionaire = function (params) {
    var deferred = $q.defer()
    Data.Counsels.questionaire(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
                // checknetwork.checknetwork(err);
              deferred.reject(err)
            })
    return deferred.promise
  }
    // params->0:{
    //              patientId:'p01',
    //              doctorId:'doc01',
    //              type:1//1->咨询 2->问诊
    //          }
  self.getStatus = function (params) {
    var deferred = $q.defer()
    Data.Counsels.getStatus(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
                // checknetwork.checknetwork(err);
              deferred.reject(err)
            })
    return deferred.promise
  }
    // params->0:{
    //              patientId:'p01',
    //              doctorId:'doc01',
    //              type:1//1->咨询 2->问诊
    //          }
  self.changeStatus = function (params) {
    var deferred = $q.defer()
    Data.Counsels.changeStatus(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
                // checknetwork.checknetwork(err);
              deferred.reject(err)
            })
    return deferred.promise
  }
    // params->0:{
    //              patientId:'p01',
    //              doctorId:'doc01',
    //              type:1//1->咨询 2->问诊,3->咨询转问诊
    //          }
  self.changeType = function (params) {
    var deferred = $q.defer()
    Data.Counsels.changeType(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
                // checknetwork.checknetwork(err);
              deferred.reject(err)
            })
    return deferred.promise
  }
    // insertCommentScore
  self.insertCommentScore = function (params) {
    var deferred = $q.defer()
    Data.Counsels.insertCommentScore(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
                // checknetwork.checknetwork(err);
              deferred.reject(err)
            })
    return deferred.promise
  }
  return self
}])

.factory('Communication', ['$q', 'Data', 'checknetwork', function ($q, Data, checknetwork) {
  var self = this
    // params->0:{counselId:'counsel01'}
  self.getCounselReport = function (params) {
    var deferred = $q.defer()
    Data.Communication.getCounselReport(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
                // checknetwork.checknetwork(err);
              deferred.reject(err)
            })
    return deferred.promise
  }

    // params->0:{teamId:'team1'}
    // self.getTeam = function(params){
    //     var deferred = $q.defer();
    //     Data.Communication.getTeam(
    //         params,
    //         function(data, headers){
    //             deferred.resolve(data);
    //         },
    //         function(err){
    //             //checknetwork.checknetwork(err);
    //             deferred.reject(err);
    //     });
    //     return deferred.promise;
    // };

    // params-> messageType=2&id2=teamOrConsultation&limit=1&skip=0
    //         messageType=1&id1=doc&id2=pat&limit=1&skip=0
  self.getCommunication = function (params) {
    var deferred = $q.defer()
    Data.Communication.getCommunication(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
                // checknetwork.checknetwork(err);
              deferred.reject(err)
            })
    return deferred.promise
  }

    // params->0:{
            //      teamId:'teampost2',
            //      membersuserId:'id1',
            //      membersname:'name2'
            //  }
    // self.insertMember = function(params){
    //     var deferred = $q.defer();
    //     Data.Communication.insertMember(
    //         params,
    //         function(data, headers){
    //             deferred.resolve(data);
    //         },
    //         function(err){
    //             //checknetwork.checknetwork(err);
    //             deferred.reject(err);
    //     });
    //     return deferred.promise;
    // };
    // {
    //     teamId,
    //     counselId,
    //     sponsorId,
    //     patientId,
    //     consultationId,
    //     status:'1'-进行中,'0'-已结束
    // }
    // self.newConsultation = function(params){
    //     var deferred = $q.defer();
    //     Data.Communication.newConsultation(
    //         params,
    //         function(data, headers){
    //             deferred.resolve(data);
    //         },
    //         function(err){
    //             //checknetwork.checknetwork(err);
    //             deferred.reject(err);
    //     });
    //     return deferred.promise;
    // };

    // params->0:{
            //      teamId:'teampost2',
            //      membersuserId:'id2'
            //  }
    // self.removeMember = function(params){
    //     var deferred = $q.defer();
    //     Data.Communication.removeMember(
    //         params,
    //         function(data, headers){
    //             deferred.resolve(data);
    //         },
    //         function(err){
    //             //checknetwork.checknetwork(err);
    //             deferred.reject(err);
    //     });
    //     return deferred.promise;
    // };

  return self
}])
.factory('Message', ['$q', 'Data', 'checknetwork', function ($q, Data, checknetwork) {
  var self = this
    // params->0:{type:1}
  self.getMessages = function (params) {
    var deferred = $q.defer()
    Data.Message.getMessages(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
                // checknetwork.checknetwork(err);
              deferred.reject(err)
            })
    return deferred.promise
  }
  return self
}])
.factory('News', ['$q', 'Data', 'checknetwork', function ($q, Data, checknetwork) {
  var self = this
    // params->0:{type:1}
  self.getNews = function (params) {
    var deferred = $q.defer()
    Data.News.getNews(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
                // checknetwork.checknetwork(err);
              deferred.reject(err)
            })
    return deferred.promise
  }

  self.insertNews = function (params) {
    var deferred = $q.defer()
    Data.News.insertNews(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
                // checknetwork.checknetwork(err);
              deferred.reject(err)
            })
    return deferred.promise
  }
  self.getNewsByReadOrNot = function (params) {
    var deferred = $q.defer()
    Data.News.getNewsByReadOrNot(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
                // checknetwork.checknetwork(err);
              deferred.reject(err)
            })
    return deferred.promise
  }

  return self
}])
.factory('Account', ['$q', 'Data', 'checknetwork', function ($q, Data, checknetwork) {
  var self = this
    // params->0:{userId:'p01'}
  self.getAccountInfo = function (params) {
    var deferred = $q.defer()
    Data.Account.getAccountInfo(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
                // checknetwork.checknetwork(err);
              deferred.reject(err)
            })
    return deferred.promise
  }
    // params->0:{
    //    patientId:'p01',
    //    doctorId:"doc01"
    // }
  self.getCounts = function (params) {
    var deferred = $q.defer()
    Data.Account.getCounts(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
                // checknetwork.checknetwork(err);
              deferred.reject(err)
            })
    return deferred.promise
  }
    // params->0:{
    //    patientId:'p01',
    //    doctorId:"doc02",
    //    modify:-1
    // }
  self.modifyCounts = function (params) {
    var deferred = $q.defer()
    Data.Account.modifyCounts(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
                // checknetwork.checknetwork(err);
              deferred.reject(err)
            })
    return deferred.promise
  }
    //
    // self.rechargeDoctor = function(params){
    //     var deferred = $q.defer();
    //     Data.Account.rechargeDoctor(
    //         params,
    //         function(data, headers){
    //             deferred.resolve(data);
    //         },
    //         function(err){
    //             //checknetwork.checknetwork(err);
    //             deferred.reject(err);
    //     });
    //     return deferred.promise;
    // };
    //
  self.updateFreeTime = function (params) {
    var deferred = $q.defer()
    Data.Account.updateFreeTime(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
                // checknetwork.checknetwork(err);
              deferred.reject(err)
            })
    return deferred.promise
  }
    //
  self.getCountsRespective = function (params) {
    var deferred = $q.defer()
    Data.Account.getCountsRespective(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
                // checknetwork.checknetwork(err);
              deferred.reject(err)
            })
    return deferred.promise
  }
  return self
}])
.factory('VitalSign', ['$q', 'Data', 'checknetwork', function ($q, Data, checknetwork) {
  var self = this
    // params->0:{userId:'p01',type:'type1'}
  self.getVitalSigns = function (params) {
    var deferred = $q.defer()
    Data.VitalSign.getVitalSigns(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
                // checknetwork.checknetwork(err);
              deferred.reject(err)
            })
    return deferred.promise
  }
  self.insertVitalSign = function (params) {
    var deferred = $q.defer()
    Data.VitalSign.insertVitalSign(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
                // checknetwork.checknetwork(err);
              deferred.reject(err)
            })
    return deferred.promise
  }
  return self
}])
.factory('Comment', ['$q', 'Data', 'checknetwork', function ($q, Data, checknetwork) {
  var self = this
    // params->0:{userId:'doc01'}
  self.getComments = function (params) {
    var deferred = $q.defer()
    Data.Comment.getComments(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
                // checknetwork.checknetwork(err);
              deferred.reject(err)
            })
    return deferred.promise
  }
    // 根据counselid取comment zxf
  self.getCommentsByC = function (params) {
    var deferred = $q.defer()
    Data.Comment.getCommentsByC(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
                // checknetwork.checknetwork(err);
              deferred.reject(err)
            })
    return deferred.promise
  }
  return self
}])

.factory('Expense', ['$q', 'Data', 'checknetwork', function ($q, Data, checknetwork) {
  var self = this
    // params->0:{userId:'p01'}
  self.rechargeDoctor = function (params) {
    var deferred = $q.defer()
    Data.Expense.rechargeDoctor(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
                // checknetwork.checknetwork(err);
              deferred.reject(err)
            })
    return deferred.promise
  }

  return self
}])

.factory('wechat', ['$q', 'Data', 'checknetwork', function ($q, Data, checknetwork) {
  var self = this
    // params->{
            //  url:'patient_class'
           // }
  self.settingConfig = function (params) {
    params.role = 'patient'
    var deferred = $q.defer()
    Data.wechat.settingConfig(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
                // checknetwork.checknetwork(err);
              deferred.reject(err)
            })
    return deferred.promise
  }
    // params->{
            //  code:'3'
            // }
  self.getUserInfo = function (params) {
    params.role = 'patient'
    var deferred = $q.defer()
    Data.wechat.getUserInfo(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
                // checknetwork.checknetwork(err);
              deferred.reject(err)
            })
    return deferred.promise
  }
    // params->{
            //  serverId:
            //  name:
            // }
  self.download = function (params) {
    params.role = 'patient'
    var deferred = $q.defer()
    Data.wechat.download(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
                // checknetwork.checknetwork(err);
              deferred.reject(err)
            })
    return deferred.promise
  }
    // params->{
            //  code:微信授权得到的code
            //  orderno:通过insertOrder得到的订单号
            // }
  self.addOrder = function (params) {
    params.role = 'patient'
    var deferred = $q.defer()
    Data.wechat.addOrder(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
                // checknetwork.checknetwork(err);
              deferred.reject(err)
            })
    return deferred.promise
  }
    // params->{
            //  serverId:
            //  name:
            // }
  self.messageTemplate = function (params) {
    var deferred = $q.defer()
    Data.wechat.messageTemplate(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
                // checknetwork.checknetwork(err);
              deferred.reject(err)
            })
    return deferred.promise
  }

  return self
}])

.factory('order', ['$q', 'Data', 'checknetwork', function ($q, Data, checknetwork) {
  var self = this
    // params->0:{
                //   userId:'doc01',
                //   money:100,
                //   goodsInfo:{
                //     class:'01',
                //     name:'咨询',
                //     notes:'测试'
                //   },
                //   paystatus:0
                // }
    // self.insertOrder = function(params){
    //     var deferred = $q.defer();
    //     Data.order.insertOrder(
    //         params,
    //         function(data, headers){
    //             deferred.resolve(data);
    //         },
    //         function(err){
    //             //checknetwork.checknetwork(err);
    //             deferred.reject(err);
    //     });
    //     return deferred.promise;
    // };
    // params->
  self.updateOrder = function (params) {
    var deferred = $q.defer()
    Data.order.updateOrder(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
                // checknetwork.checknetwork(err);
              deferred.reject(err)
            })
    return deferred.promise
  }
    // params->
  self.getOrder = function (params) {
    var deferred = $q.defer()
    Data.order.getOrder(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
                // checknetwork.checknetwork(err);
              deferred.reject(err)
            })
    return deferred.promise
  }
  return self
}])

.factory('arrTool', function () {
  return {
    indexOf: function (arr, key, val, binary) {
      if (binary) {
                // 已排序，二分,用于消息
                // var first=0,last=arr.length,mid=(first+last)/2;
                // while(arr[mid][key]!=val){
                //     if(arr[mid])
                // }
      } else {
        for (var i = 0, len = arr.length; i < len; i++) {
          if (arr[i][key] == val) return i
        }
        return -1
      }
    }
  }
})
.factory('jm', ['$q', 'Data', 'checknetwork', function ($q, Data, checknetwork) {
  var self = this
    // params->{
            //  url:'patient_class'
           // }
  self.users = function (params) {
    var deferred = $q.defer()
    Data.jm.users(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
                // checknetwork.checknetwork(err);
              deferred.reject(err)
            })
    return deferred.promise
  }
    // params->{
            //  code:'3'
            // }
  self.groups = function (params) {
    var deferred = $q.defer()
    Data.jm.groups(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
                // checknetwork.checknetwork(err);
              deferred.reject(err)
            })
    return deferred.promise
  }
    // params->{
            //  serverId:
            //  name:
            // }
  self.groupsMembers = function (params) {
    var deferred = $q.defer()
    Data.jm.groupsMembers(
      params,
      function (data, headers) {
        deferred.resolve(data)
      },
      function (err) {
          // checknetwork.checknetwork(err);
        deferred.reject(err)
      })
    return deferred.promise
  }

  return self
}])

.factory('payment', ['$q', 'wechat', 'Storage', '$http', 'order', '$location', '$ionicLoading', 'checknetwork', function ($q, wechat, Storage, $http, order, $location, $ionicLoading, checknetwork) {
  return {
    payment: function (neworder) {
      $ionicLoading.show({
        template: '请稍候',
        duration: 10000
      })
      // res = {
      //   "errMsg":"chooseWXPay:ok",
      //   "money":0
      // }
      // var defer = $q.defer()
      // defer.resolve(res);

      var defer = $q.defer()
      var config = ''
      var path = $location.absUrl().split('#')[0]

      /**
       * [获取注册微信jssdk所需的参数]
       * @Author   TongDanyang
       * @DateTime 2017-07-07
       * @param    {[string]}    url [当前url的路径，#之前的]
       * @return   {[object]}    data.results  [注册微信jssdk用到的签名等信息]
       */
      wechat.settingConfig({url: path}).then(function (data) {
        // alert(data.results.timestamp)
        config = data.results
        config.jsApiList = ['chooseWXPay']
        // alert(config.jsApiList)
        // alert(config.debug)
        console.log(angular.toJson(config))
        /*
        注册微信jssdk
         */
        wx.config({
          debug: false,
          appId: config.appId,
          timestamp: config.timestamp,
          nonceStr: config.nonceStr,
          signature: config.signature,
          jsApiList: config.jsApiList
        })
        /*
        注册成功后确认支付接口是否成功注册
         */
        wx.ready(function () {
          wx.checkJsApi({
            jsApiList: ['chooseWXPay'],
            success: function (res) {
                  // var neworder = {
                  //   userId:'doc01',
                  //   money:1,
                  //   goodsInfo:{
                  //     class:'01',
                  //     name:'咨询',
                  //     notes:'测试'
                  //   },
                  //   paystatus:0,
                  //   paytime:"2017-05-02"
                  // }
                  // order.insertOrder(neworder).then(function(data){
                        // var json = 'http://ipv4.myexternalip.com/json';
                        // $http.get(json).then(function(result) {
                        // console.log(result.data.ip)
                        // if (result.data.ip == null || result.data.ip == undefined || result.data.ip == "")
                        // {
                        //   result.data.ip = "121.43.107.106"
                        // }
                        // neworder.ip = result.data.ip
              /**
               * [生成订单并获取微信支付信息]
               * @Author   TongDanyang
               * @DateTime 2017-07-07
               * @param    {[object]}    neworder  [支付的相关信息]
               * @return {object}  data.results [订单及支付情况，data.results.status为0时处于免费状态，为1时则表示支付金额为0，其他情况下调用微信支付接口]
               */
              wechat.addOrder(neworder).then(function (data) {
                $ionicLoading.hide()
                if (data.results && (data.results.status === 0 || data.results.status === 1)) {
                  res = {
                    'errMsg': 'chooseWXPay:ok',
                    'money': neworder.money / 100
                  }
                  $ionicLoading.show({
                    template: data.results.msg,
                    duration: 3000
                  })
                  defer.resolve(res)
                  return defer.promise
                } else {
                  wx.chooseWXPay({
                    timestamp: data.results.timestamp,
                    nonceStr: data.results.nonceStr,
                    package: data.results.package,
                    signType: data.results.signType,
                    paySign: data.results.paySign,
                    success: function (res) {
                      res.money = neworder.money / 100
                      defer.resolve(res)
                    }
                  })
                }
              }, function (err) {
                            // checknetwork.checknetwork(err);
                defer.reject(err)
              })

                  // },function(err){
                  //   defer.reject(err);
                  // })
            }
          })
        })
        wx.error(function (res) {
            // checknetwork.checknetwork(res);
          defer.reject(res)
        })
      }, function (err) {
        // checknetwork.checknetwork(err);
        defer.reject(err)
      })
      return defer.promise
    }
  }
}])

.factory('insurance', ['$q', 'Data', 'checknetwork', function ($q, Data, checknetwork) {
  var self = this
    // params->{
            //  url:'patient_class'
           // }
  self.setPrefer = function (params) {
    var deferred = $q.defer()
    Data.insurance.setPrefer(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
                // checknetwork.checknetwork(err);
              deferred.reject(err)
            })
    return deferred.promise
  }
    // params->{
            //  code:'3'
            // }
  self.getPrefer = function (params) {
    var deferred = $q.defer()
    Data.insurance.getPrefer(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
                // checknetwork.checknetwork(err);
              deferred.reject(err)
            })
    return deferred.promise
  }

  return self
}])

.factory('Advice', ['$q', 'Data', 'checknetwork', function ($q, Data, checknetwork) {
  var self = this
    // params->0:{type:1}
  self.postAdvice = function (params) {
    var deferred = $q.defer()
    Data.Advice.postAdvice(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
                // checknetwork.checknetwork(err);
              deferred.reject(err)
            })
    return deferred.promise
  }
  return self
}])

.factory('checknetwork', ['$q', '$ionicLoading', '$rootScope', function ($q, $ionicLoading, $rootScope) {
  return {
    checknetwork: function (err) {
      $rootScope.$watch('online', function () {
        if (err.status != 401) {
          if (navigator.onLine) {
            $ionicLoading.show({
              template: "<p ng-click='stoploading()'>请确认您连接的网络有效！</p>",
              duration: 3000,
              scope: $rootScope
            })
          } else {
            $ionicLoading.show({
              template: "<p ng-click='stoploading()'>请确认您的手机是否连接网络！</p>",
              duration: 3000,
              scope: $rootScope
            })
          }
        }
      })
      $rootScope.stoploading = function () {
        $ionicLoading.hide()
      }
    }

  }
}])
