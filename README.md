
[![XOOUi](https://github.com/yegodz/xooui-client/blob/master/ui/images/XOOUI_v2_sm.png)](https://www.xooui.com)
# Introduction
The XO repository implements XOOUi - an encrypted,  virtual, distributed file system with automated key management. XOOUi works by storing user file metadata on a central server, called the XOOUi server 
(hosted on https://www.xooui.com) and encrypting and shredding user files into multiple chunks and spreading them across
two or more cloud drives. The XOOUi server exposes a REST API that provides a CRUD interface to this distributed file system.
The REST API documentation is in the works, but if you are going to delevelop using this library meanwhile, let us know
and we will give you access to the `swagger` interface to the REST API.

> Note: The XOOUi library is currently in beta and documentation is being added. The code has been open sourced because we believe that any code that runs in a user's browser should be open-source for transparency and security. We will be releasing a chrome packaged app soon along with the source code.

> License: All rights reserved by XOOUi. XOOUi source code may only be downloaded and used for private, non-commercial use. 

>For commercial licensing, please send email to support@cerient.com

The entire code for XOOUi is packaged into one repository (this one). The structure of the repo is as follows:

```
|--client/  // client side code
|--server/  // server side code
|--doc/     // useful housekeeping documentation
|--design/  // logo and design files
|--provider // code for an in-house cloud drive
```
## Building XOOUi - client
XOOUi has three types of client side interfaces 

  - a web application that runs as a single page app and is served up by the XOOUi server
  - a packaged chrome app that can be downloaded from the Chrome app store
  - a command line application 
  
The `client` folder provides `gulp` files to build these clients. See the README file in the `client` folder


## Building XOOUi - server
The XOOUi server is a node app and currenlty runs on ports 8080 and 8443. Linux port redirection is used to listen on ports 80/443.
see the README file in the `server` folder for instructions on building and deploying the XOOUi server

## Signup and use XOOUi
A XOOUi server runs on [www.xooui.com](https://www.xooui.com), which is hosted on an AWS EC2 instance. The server is in beta and free to use.
Signing up on XOOUi involves creating a userid and password and linking 2 or more cloud drives to the user account. The XOOUi application uses
oAuth to access the user's cloud drives and store his/her data on the linked cloud drives.


## Cloud Drives Support
Currently supported drives are

> [amazon cloud drive](https://www.amazon.com/clouddrive/home)

> [box.com](https://www.box.com)

> [dropbox.com](https://www.dropbox.com)

> [google drive](https://www.google.com/drive/)

> [Microsoft OneDrive](https://onedrive.live.com/)



## Screenshots

### Main screen

[![XOOUi](https://github.com/yegodz/xo/blob/master/server/public/www/images/xoou-screen2.png)](https://www.xooui.com)

### Password application
[![XOOUi](https://github.com/yegodz/xo/blob/master/server/public/www/images/xoou-pass2.png)](https://www.xooui.com)

### Secure Notes Application

[![XOOUi](https://github.com/yegodz/xo/blob/master/server/public/www/images/xoou-notes2.png)](https://www.xooui.com)



