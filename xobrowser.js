
/*****************************************************************************************************
* This is the main in-browser interface to the Xo library
* use it by calling require('xob') in the browser code.
*****************************************************************************************************/
"use strict";

/* jshint laxcomma: true, browser: true, browserify: true, node: true */ 

var xos = require('./lib/util/xostorage')
        ,Xo = require('./lib/xo.js')
        ,async = require('async')
        ,easylog = require('./lib/util/easylog')
        ,xocrypt = require('./lib/util/xocrypt')
        ,xoberr = require('./lib/util/easyerror')('xobrowser');




var DBFOLDER = null;


var xorepl = {}, xo;
var dbfilename = { box: '.xoBox.token',
                   dropbox: '.xoDbox.token',
                   google: '.xoGoog.token',
                   amazon: '.xoAmazon.token',
                   microsoft: '.xoMicro.token'
                 };

// for debugging... attach any objects you need to reference from the browser console
xorepl.xos = xos;
xorepl.Buffer = Buffer;
//cb = function(e,r) { err = e; res = r;};
function newerr(msg, code){
  var e = new Error(msg);
  e.code = code;
  return e;
}

/*****************************************************************************************************
* Add any global env settings that the Xo library needs
*****************************************************************************************************/
if (window.CHROMEAPP) {
    xos.setEnv('ORIGIN', XOOUISERVER);
} else {
    xos.setEnv('ORIGIN', window.location.origin || (window.location.protocol + '//' + window.location.host) || '');
}


// returns the URL for reauthenticating a user with a SP
xorepl.getConfigFile = function(sp) {
  return dbfilename[sp] || xoberr("Auth URL for " + sp + " not found", 'notFound');
}; 

/**
 * xorepl.gc - garbage collector
 * @param   {Function} [cb=function(){}] Optional callback function to be called when garbage collection is complete
 */
xorepl.gc = function(cb) {
  cb = cb || function(){};
  return xo && xo.initialized && xo.gc(cb);
};


/**
 * xorepl.ls - get a list of files in the XOOUi virtual file system
 * @param   {String}   filepath Full prefix of the file to be searched
 * @param   {Number}   depth    The number of folder levels deep to search
 * @param   {Function} callback Callback function
 */
xorepl.ls = function(filepath, depth, callback){
    depth = depth? depth : 0;
    filepath = filepath? filepath: '/';
    xo.list(filepath, depth, function(err, res){
        if (err) {
          err.code = 500;
          return callback(err);
        }
        if (!res || res.length === 0) {
          return callback(null, []);
        }
        // res contains an array of filedocs found
        res.sort(function(a,b) {
            if (a.name < b.name) return -1;
            return 1;
        });
        return callback(null, res);
    });
};

/**
 * xorepl.fi - get file metadata information
 * @param   {String}   filePath Complete file name with path
 * @param   {Number}   version  File version 
 * @param   {Function} callback Callback function
 */
xorepl.fi = function(filePath, version, callback) {
    // get all the gory details about the file, version is null for latest rev, 0 for all
    // version is currently ignored
    if (!(xo  && xo.initialized)) {
        return callback (new Error('Not logged in to Xooui'));
    }
    xo.xoDb.findFile(filePath, function(err, docFound){
        if (err) {
          return callback(err);
        }
        if (!docFound) {
          return callback(null, null);
        }    
      return callback(null, docFound);
    });
};

/**
 * xorepl.dl - download a file
 * @param   {String}   filepath Complete file name
 * @param   {Number}   version  Version
 * @param   {Function} callback Callback function
 */
xorepl.dl = function(filepath, version, callback) {

    xo.getFile(filepath, version, function(err, res) {
        if (err) return callback(err);
        if (!res) return callback(null, null);
        console.log('back in xorepl.dl');
        return callback(null, res);
    });
};

/**
 * xorepl.dlDecrypt - decrypt a downloaded file with password 
 * @param   {Object}   fileBuf  Buffer holdign the encrypted file
 * @param   {String}   pw       File password
 * @param   {Function} callback Callback function
 */
xorepl.dlDecrypt = function (fileBuf, pw, callback) {
  return xocrypt.decryptFile(fileBuf, pw, callback);  
};

/**
 * xorepl.ul - upload a file 
 * @param   {String}   filepath Complete remote file name
 * @param   {Object}   filestat object containing file size and version 
 * @param   {Object}   buff     Buffer object holdign the file
 * @param   {String}   pw       Optional password (set to null if no password)
 * @param   {Function} callback Callback function
 */
xorepl.ul = function(filepath, filestat, buff, pw, callback) {
    var newbuff = new Buffer( new Uint8Array(buff) );
    xo.createFile(filepath, filestat, newbuff, pw, function(err, result){
      if (err)
        return callback(err);
      console.log('file uploaded');
      return callback(null);
    });
};

/**
 * xorepl.ud - update an existing file 
 * @param   {String}   filepath Complete remote file name
 * @param   {Object}   filestat object containing file size and version 
 * @param   {Object}   buff     Buffer object holdign the file
 * @param   {String}   pw       Optional password (set to null if no password)
 * @param   {Function} callback Callback function
 */
xorepl.ud = function(filepath, filestat, buff, pw, callback) {
    var newbuff = new Buffer( new Uint8Array(buff) );
    xo.updateFile(filepath, filestat, newbuff, pw, function(err, result){
      if (err)
        return callback(err);
      console.log('file updated');
      return callback(null);
    });
};

/**
 * xorepl.rm delete a file
 * @param   {String}   filepath Complete filename
 * @param   {Function} callback Callback function
 */
xorepl.rm = function(filepath, callback) {
    xo.deleteFile(filepath, function(err, res){
        if (err) return callback(err);
        return callback(null);
    });
}; 

/**
 * xorepl.hashpassword Generate a hash of a user password
 * @param   {String} username    username
 * @param   {String} clearPasswd password in clear text
 * @returns {String} Hashed value of the password
 */
xorepl.hashPassword = function(username, clearPasswd) {
  //return btoa(username + ":" + Xo.hashPassword(username, clearPasswd));
    return  Xo.hashPassword(username, clearPasswd);
};

/**
 * xorepl.saveToken Save XOOUi login credentials to SessionStorage
 * @param {String} username Username
 * @param {String} password Password    
 */
xorepl.saveToken = function(username, password) {
var xotoken = null;
  
  if (username) {
    xotoken = {
        "xoDbServer": xos.getEnv('ORIGIN'),
        "xoDbToken": null,
        "xoUserId": username,
        "xoPwHash": btoa(username + ":" + Xo.hashPassword(username, password)),
        "xoLocalRoot": ""
    };
  }
  sessionStorage.setItem('.xo.token', JSON.stringify(xotoken));
};

/**
 * xorepl.login - Log in to XOOUi server, get cloud drive configuration and connect to all of them
 * @param   {String}   username username
 * @param   {String}   password Password
 * @param   {Function} callback Callback function
 */
xorepl.login = function(username, password, callback) {
  var xotoken = null;
  if (typeof username == 'function') {
    callback = username;
    username = password = null;
  }
  
  if (username) {
    xotoken = {
        "xoDbServer": xos.getEnv('ORIGIN'),
        "xoDbToken": null,
        "xoUserId": username,
        "xoPwHash": btoa(username + ":" + Xo.hashPassword(username, password)),
        "xoLocalRoot": ""
    };
  }
  
  xos.init();
  if (xotoken) xos.write('.xo.token', JSON.stringify(xotoken));
  xotoken = xos.safeJSONParse(xos.read('.xo.token'));
  if (!(xotoken && xotoken.xoUserId)) {
      return callback(new Error('Invalid user id'));
  } else {
      xos.init(xotoken.xoUserId);
  }
    
  if (!xo) xo = new Xo();
  xorepl.xo = xo;
  xo.init(function(err, res) {
    if (err) {
      return callback(err);
    }
    
    // set user id correctly in case user has logged in with email
    xotoken.xoUserId = xo.config.userid;
    xos.init(xotoken.xoUserId);
    
    return callback(null,
                    {
      authToken: JSON.parse(xos.read('.xo.token')).xoPwHash,
      authScheme: 'Basic',
      name: xo.config.name,
      userid: xo.config.userid,
      email: xo.config.email,
      features: xo.config.features,
      message: xo.config.message,
      configuredSp: xo.config.sps.map(function(s) {return s.sp;}),
      supportedSp: xo.supportedSp.map(function(s) { return s.sp;}),
      spsNotConnected: (function() {
        var notConn = [];
        xo.config.sps.map(function(s) {
          if (!xo.chunksDb[s.sp].initialized)
            notConn.push(s.sp);
        });
        return notConn;
      })() 
    });
  });
};

/**
 * Logout of XOOUi server
 */
xorepl.logout = function() {
    xo.initialized = false;
    xos.write('.xo.token', '');
};

xorepl.isLoggedIn = function() {
  return (xo && xo.initialized);
};

/**
 * xorepl.getConfiguredSp
 * @returns {Array} Returns an array of cloud drives that are configured for this user
 */
xorepl.getConfiguredSp = function() {
  return (xo && xo.initialized) ? xo.config.sps.map(function(s) {return s.sp;}) : null;
};

/**
 * xorepl.getSupportedSp
 * @returns {Array} Array of cloud drives supported by XOOUi    
 */
xorepl.getSupportedSp = function() {
  return (xo && xo.initialized) ? xo.supportedSp.map(function(s) {return s.sp;}) : null;
};

xorepl.isSpConnected = function(sp) {
  return xo && xo.initialized && xo.chunksDb[sp] && xo.chunksDb[sp].initialized;
};

/**
 * xorepl.connect
 * @param   {String}   type     'xo' or name of cloud drive
 * @param   {Object}   tokens   Object containing the authentication credentials
 * @param   {Function} callback Callback function
 */
xorepl.connect = function(type, tokens, callback) {
    var sp = null, key;
  
    switch (type) {
        case 'xo':
          xos.init(tokens?tokens.xoUserId:null);
          if (tokens) xos.write('.xo.token', JSON.stringify(tokens));
          xo = new Xo();
          xo.initDb(function(err) {
            if (err) 
              return callback(err, type);
            else {
              console.log('xo connected.');
              return callback(null, type);
            }
          });
          xorepl.xo = xo;
          break;
        default:
          if (!xo.initialized) {
            return xoberr('Not logged in to Xooui', 'xoNoAuth', type);
          }
          for (key in xo.config.sps) {
            if (type == xo.config.sps[key].sp)
              sp = xo.config.sps[key];
          }
          if (!sp) {
            return callback(xoberr(type+' is not in the user profile for user ' + xo.config.userid+'.', 'notFound'), type);
          }
          if (tokens) xos.write(dbfilename[type], JSON.stringify(tokens));
          xo.initSpDb(sp, function(err){
            if (err) 
              return callback(err, type);
            else {
              console.log('connected to %s', type);
              return callback(null, type);
            }
          });          
    }
};






/**
 * xorepl.renewAuth - renew oAuth credentials for a cloud drive
 * @param   {String}   sp       Cloud drive
 * @param   {Function} callback Callback function
 */
xorepl.renewAuth = function(sp, callback) {
  var index = xorepl.getConfigFile(sp);
  var spDb = xo.chunksDb[sp];
  if (!spDb)
    return process.nextTick(function() {callback(xoberr('Storage provider not found - ' + sp, 'notFound', {sps:[sp]}));} );
  
  async.series(
  [
    function (_cb) {
      xorepl._getSpTokens(spDb, _cb);
    },
    function connectToSp(_cb) {
      xorepl.connect(spDb.spDoc.sp, null, _cb);
    }
  ],
    function (err, result) {
      return callback(err, result);
    }
  );
};

    
/**
 * xorepl.addSp - authenticate via Oauth, the user to a new sp that does not already exist in the user's profile,
 * add the sp to the user's profile on Xo server and create the db folder on the SP
 * @param   {String}   sp       Cloud Drive
 * @param   {Function} callback Callback function
 */
xorepl.addSp = function(sp, callback){
  var spDoc;

  for (var key in xo.supportedSp) {
    if (xo.supportedSp[key].sp == sp) {
      spDoc = xorepl.xo.supportedSp[key];
      break;
    }
  }
  if (!spDoc)
    return process.nextTick(function() {callback(xoberr('Storage provider not found - '+ sp, 'notFound', {sps: [sp]}));} );
  
  var hostname = require('url').parse(xo.xoDb.tokens.xoDbServer).hostname;
  // maintain backward compatibility for users that created accounts using only xooui.com
  if ((hostname == 'app.xooui.com') || (hostname == 'www.xooui.com'))
      hostname = 'xooui.com';
  spDoc.rootUri = '__'+hostname+'.'+xo.config.userid+'.db';
  var spDb = xo.loadNewSpDb(spDoc);
  if (!spDb) return null;
  async.series([
    function(_cb) {
      xorepl._getSpTokens(spDb, _cb);
    },
    function(_cb) {
      xorepl._addSptoDb(spDb, _cb);
    },
    function(_cb) {
      xorepl.connect(sp, null, _cb);
    }
  ], function(err, res) {
    return callback(err, res);
  });
};

/**
 * xorepl.removeSp - remove a cloud drive from a user's configuration
 * @param {String}   sp       Cloud Drive
 * @param {Function} callback Callback function
 */
xorepl.removeSp = function(sp, callback) {
  xo.removeSp(sp, callback);
};

exports.xorepl = xorepl;
exports.xos = xos;



/**********************************************************
 * Private functions
**********************************************************/
 
var SPTOKEN_TIMEOUT = 120; // seconds
/**
 * xorepl._getSpTokens - Internal function to retrieve oAuth Tokens from a cloud drive
 */
var _getSpTokensBrowser = function(spDb, callback) {
  var index = spDb.configFile;
  var sp = spDb.spDoc.sp;

  xos.removeItem(index);
  xos.removeItem(sp+'.code');
  // seta  cookie to indicate that the authentication is happening in the browser
  document.cookie = 'xoBrowserAuth=true; path=/; max-age=120';
  async.series(
  [
      function launchSpAuthWindow (_cb) {
          var url = spDb.authUrl();
          if (!url)
              return _cb(xoberr('Failed to authenticate with '+sp, 'spNoAuth', {sps:[sp]}));
          else {
              window.open(url);
              // This is needed because IE11 localStorage is broken
              window.addEventListener('storage', function _storageListener(e) {
                  if (e.key != sp+'.code')
                      return;
                  window.removeEventListener('storage', _storageListener, false);
                  if (!xos.getItem(e.key))
                  {
                      xos.setItem(e.key, e.newValue);
                  }
              }, false);
              return _cb(null, null);
          }
      },
      function checkLocalStorageForAuthCode(_cb) {
          var tries = SPTOKEN_TIMEOUT;
          function checkLocalStorageWait() {
              var item = xos.getItem(sp+'.code');
              if ( !item && tries-- > 0) {
                  setTimeout(checkLocalStorageWait, 1000);
                  return;
              }
              if (item) {
                  if (item == 'ABORT') {
                      xos.removeItem(sp+'.code');
                    return _cb(new Error('User cancelled SP authorization for ' + sp));  
                  }
                  return _cb(null, null);
              }
              else
                  return _cb(xoberr('Timeout while authenticating with ' + sp, 'spTimeOut', {sps:[sp]}));
          }
        checkLocalStorageWait();
      },
      function getAccessToken(_cb) {
          var item = xos.getItem(sp+'.code');
          if ( item ) {
              var tempCode = item;
              xos.removeItem(sp+'.code');
              spDb.getTokens(tempCode, function (err) {
                  if (err === null) {
                      return _cb(null, null);
                  }
                  else
                      return _cb(err, null);
              });
          }  
          else 
              return _cb(xoberr('Unable to get authentication tokens from '+sp, 'spNoAuth', {sps:[sp]}));          
      }
  ], function(err, res) {
    document.cookie = 'xoBrowserAuth=false; path=/; max-age=20';
    return callback(err, res);
  });

};

var _getSpTokensChrome = function(spDb, callback) {
  var index = spDb.configFile;
  var sp = spDb.spDoc.sp;
  var redirectUri = chrome.identity.getRedirectURL(sp);
  
  spDb.setRedirectUri(redirectUri);
  xos.removeItem(index);
  xos.removeItem(sp+'.code');
    
    function parseRedirectFragment(fragment) {
      var pairs = fragment.split(/&/);
      var values = {};

      pairs.forEach(function(pair) {
        var nameval = pair.split(/=/);
        values[nameval[0]] = nameval[1];
      });

      return values;
    }

    
  async.series(
  [
      function launchSpAuthWindow (_cb) {
          var url = spDb.authUrl();
          var redirectRe = new RegExp(redirectUri + '[#\?](.*)');
          if (!url)
              return _cb(xoberr('Failed to authenticate with '+sp, 'spNoAuth', {sps:[sp]}));
          else {
            //url = url.replace(/redirect_uri.*$/, "redirect_uri="+redirectUri)
            var options = {
              'interactive': true,
              'url': url
            }
            chrome.identity.launchWebAuthFlow(options, function(returnedUri) {
              console.log('launchWebAuthFlow completed', chrome.runtime.lastError,
                  returnedUri);

              if (chrome.runtime.lastError) {
                _cb(new Error(chrome.runtime.lastError));
                return;
              }

              // Upon success the response is appended to redirectUri, e.g.
              // https://{app_id}.chromiumapp.org/provider_cb#access_token={value}
              //     &refresh_token={value}
              // or:
              // https://{app_id}.chromiumapp.org/provider_cb#code={value}
              var matches = returnedUri.match(redirectRe);
              if (matches && matches.length > 1) {
                var retVals = parseRedirectFragment(matches[1]);
                if (retVals.hasOwnProperty('code')) {
                    xos.setItem(sp+'.code', retVals.code);
                    return _cb(null, null);
                }
              }

              return _cb(new Error('Invalid redirect URI'));
            });
          }
      },
      function getAccessToken(_cb) {
          var item = xos.getItem(sp+'.code');
          if ( item ) {
              var tempCode = item;
              xos.removeItem(sp+'.code');
              spDb.getTokens(tempCode, function (err) {
                  if (err === null) {
                      return _cb(null, null);
                  }
                  else
                      return _cb(err, null);
              });
          }  
          else 
              return _cb(xoberr('Unable to get authentication tokens from '+sp, 'spNoAuth', {sps:[sp]}));          
      }
  ], function(err, res) {
    return callback(err, res);
  });

};
    

if (window.chrome && chrome.runtime && chrome.runtime.id) {
    xorepl._getSpTokens = _getSpTokensChrome;
} else {
    xorepl._getSpTokens = _getSpTokensBrowser;
}

xorepl._addSptoDb = function(spDb, callback) {

  async.series([
    function (_cb) {
      spDb.spDbCreateDb(_cb);
    },
    function (_cb) {
      xo.addSp(spDb, _cb);
    }
  ], function(err, res){
    return callback(err, res);
  });
};









