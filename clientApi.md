
[![XOOUi](https://github.com/yegodz/xooui-client/blob/master/ui/images/XOOUI_v2_sm.png)](https://www.xooui.com)
# XOOUi Client
The XOOUi client is available in three flavors 

  - as an angular single page application that is served up by the XOOUi server
  - as a packaged Chrome app, downloadable from the Chrome app store (soon to be added)
  - as a command line application that runs on the desktop as a node/javascript program.
  

> Note: The XOOUi library is currently in beta and documentation is being added. The code has been open sourced because we believe that any code that runs in a user's browser should be open-source for transparency and security. We will be releasing a chrome packaged app soon along with the source code.

> License: All rights reserved by XOOUi. XOOUi source code may only be downloaded and used for private, non-commercial use. 

>For commercial licensing, please send email to support@cerient.com

## XOOUi web application 

Built using `gulp` in the `xo/client` folder

## XOOUi Chrome app

Built using `gulp` in the `xo/client/chrome-app` folder

## Command Line client - xorepl
The XOOUi client is implemented as a CLI tool using a REPL interface in the `xorpel.js` file

From the `xorepl` prompt, you can access the basic file commands

- `config`
- `configsp`
- `ls`
- `ul`
- `dl`
- `rm`
- `help`
- `auth`

Type `help` at the prompt to see the list of `xorepl` commands.
Any command not recognized as a `xorepl` command is passed through to the node runtime to be `eval`'d. This allows you to poke around at variables, objects values, call functiosn etc at runtime for debugging etc.


### xorepl.js
`node xorepl.js [-c <config_folder>]` 

The `<config_folder>` (defaults to `$HOME/.xo`) is a folder that stores persistent information about the login credentials for XOOUi as well as for the different cloud drives.

### Xo server support
The XOOUi server runs on https://www.xooui.com. A userid and password needs to be obtained first by signing up on www.xooui.com

### Cloud Drives Support
Currently supported drives are

> [amazon cloud drive](https://www.amazon.com/clouddrive/home)

> [box.com](https://www.box.com)

> [dropbox.com](https://www.dropbox.com)

> [google drive](https://www.google.com/drive/)

> [Microsoft OneDrive](https://onedrive.live.com/)

### Configuration
`xorepl` expects you to have the the following in place:

- an account on `www.xooui.com`
- Two or more cloud drives linked to the account. This can only be done from https://www.xooui.com/ui/settings

`xorepl` will create the following files in the `<config_folder>`

> `.xo.token`: This contains the persistent login credentials for logging into the XOOUi server

> `.xoAmazon.token`, `.xoAmazon.endpoint`: Encrypted files containing Amazon Cloud Drive login credentials

> `.xoBox.token`: Encrypted file containing Box login credentials

> `.xodBox.token`: Encrypted file containing Dropbox login credentials

> `.xoGoog.token`: Encrypted file containing Google Drive login credentials

> `.xoMicro.token`: Encrypted file containing Microsoft OneDrive login credentials

> `.xoerror.log`: Log file containing output from `xorepl`

     
### Authenticating with a storage service provider
`xorepl> $ auth <cloud_drive>` 

From the `xorepl` prompt, type `auth <cloud_drive>` where `<cloud_drive>` is one of the following
  
  * `amazon`
  * `box`
  * `dropbox`
  * `google`
  * `microsoft`
  
This opens up an `oAuth` authentication windown in your default browser and will save the auth credential in the assocuited file in the `<config_folder>`

## Browser based client - xobundle.js
The full functionality of the XOOUi library can also be accessed by a javascript single page app by linking to the 
browserified version of the file with `xobrowser.js` as the entry point.

### Build
`gulp` will browserify and minify the XOOUi library, producing `xobundle.js` and `xobundle.min.js`, whch can be used in a browser javascript app.


### xobrowser library

Include the `xobundle.js` or `xobundle.min.js` script in your HTML file:
```html
    <script src="xobundle.min.js"></script>
    <script>
        var xooui = require(`xob`);
        ...
    </script>
```
The `xooui.xorepl` object exposes the following methods:
* `xorepl.ls` - get a file listing
* `xorepl.fi` - get detailed file metadata
* `xorepl.dl` - download a file
* `xorepl.ul` - upload a file
* `xorepl.ud` - update an existing file
* `xorepl.rm` - remove a file
* `xorepl.hashPassword` - generate a SHA hash of the password
* `xorepl.login` - login to the XOOUi server
* `xorepl.getConfiguredSp` - get a list of cloud drives configured to the user account
* `xorepl.getSupportedSp` - get a list of the cloud drives supported by XOOUi`
* `xorepl.connect` - connect to a cloud drive
* `xorepl.addSp` - configure a new cloud drive




