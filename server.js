const net = require('net');
const fs = require('fs');
const url = require('url');
var path = require('path');

var myIndex = '/index.html';
var my404 = '/404.html';
var socketList = [];
var contentType = 'Content-Type: text/html; charset=utf-8';
var staticStatus = 'HTTP/1.1 200 OK';
var serverString = 'Server: gnarlyserver.net';
var connectionString = 'Connection: keep-alive';



const server = net.createServer((theSocket) => {
  console.log('socket connection made');
  var addr = theSocket.remoteAddress;
  socketList.push(theSocket);

  theSocket.on('data', (data) => {
    var theData = data.toString();
    console.log('theData: ', theData);
    var requestInfo = parseRequest(theData);
    var reqType = requestInfo.type;
    var uri = requestInfo.uri;
    console.log('request:', reqType, ', uri: ', uri);
    if(uri.indexOf('localhost:8080') > -1 || uri == '/') {
      console.log('requested uri is: ', uri);
      uri = myIndex;
      console.log('revised uri is: ', uri);
    }
    // strip off leading '/' from uri, if there is one
    if(uri.indexOf('/') === 0) {
      uri = uri.slice(1);
      console.log('leading forward slash stripped from uri');
      console.log('new uri is: ', uri);
    }
    fs.readFile(uri, function (err, fsData) {
      if(err){
        console.log('err: ', err);
        //404 stuff
      } else {
        var theHeaderString = makeHeader(fsData);
        theSocket.write(theHeaderString);
        theSocket.write(fsData);
      }
    });
  });

  theSocket.on('end', () => {
    console.log('client disconnected');
  });

});

function makeHeader(theContent){
  var contentLength = '\n';
  if(arguments.length == 1) {
    contentLength = getContentLength(theContent) + '\n\n' ;
  }
  return staticStatus + '\n' +
  serverString + '\n' +
  connectionString + '\n' +
  gmtDate() + '\n' +
  contentType + '\nStatus: 200 OK\n' +
  contentLength;
}


function parseRequest(theRequest){
  console.log('request received: \n', theRequest);
  var requestParts = theRequest.split('\n');
  var requestLine = requestParts[0].split(' ');
  var requestType = String(requestLine[0]);
  var requestURI = String(requestLine[1]);
  return {type: requestType, uri: requestURI};
}


function gmtDate(){
  var now = new Date();
  return 'Date: ' + now.toGMTString();
}

function getContentLength(theContent){
  return 'Content-Length: ' + theContent.length;
}

// function loadFile(theFile){
//   fs.readFile(theFile, 'utf8', (err, data) => {
//     if (err) {
//       console.log(err);
//       return null;
//     }
//   return data;
//   });
// }

server.listen('8080');