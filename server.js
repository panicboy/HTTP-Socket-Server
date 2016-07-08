const net = require('net');
const fs = require('fs');
const url = require('url');
var path = require('path');

var myIndex = '/index.html';
var my404 = '/404.html';
var socketList = [];
var contentType = String;
var staticStatus = 'HTTP/1.1 200 OK';
var serverString = 'Server: gnarlyserver.net';
var connectionString = 'Connection: keep-alive';



const server = net.createServer((theSocket) => {
  console.log('socket connection made');
  var addr = theSocket.remoteAddress;
  socketList.push(theSocket);

  theSocket.on('data', (data) => {
    var theData = data.toString();
    // console.log('theData: ', theData);
    var requestInfo = parseRequest(theData);
    var reqType = requestInfo.type;
    var uri = requestInfo.uri;
    // console.log('request:', reqType, ', uri: ', uri);
    if(uri.indexOf('localhost:8080') > -1 || uri == '/') {
      // console.log('requested uri is: ', uri);
      uri = myIndex;
      // console.log('revised uri is: ', uri);
    }
    var extension = path.extname(uri);
    //determine content type
    contentType = getContentType(extension);
    fs.readFile('.' + uri, function (err, fsData) {
      if(err){
        console.log('err: ', err);
        send404(theSocket);
      } else {
        fsData = fsData.toString();
        console.log('fsData: ', fsData);
        var theHeaderString = makeHeader(fsData);
        theSocket.write(theHeaderString);
        theSocket.write(fsData);
        theSocket.end();
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
  'Status: 200 OK\n' +
  // contentType + '\nStatus: 200 OK\n' +
  contentLength;
}


function parseRequest(theRequest){
  // console.log('request received: \n', theRequest);
  var requestParts = theRequest.split('\n');
  var requestLine = requestParts[0].split(' ');
  var requestType = String(requestLine[0]);
  console.log('requestType: ', requestType);
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

function send404(mySocket){
  fs.readFile('.' + my404, (err, errPageData) => {
    if (err) {
      console.log('Error sending 404 page: ', err);
    }
    errPageData = errPageData.toString();
    let theHeaderString = makeHeader(errPageData);
    mySocket.write(theHeaderString);
    mySocket.write(errPageData);
    mySocket.end();
  });
}

server.listen('8080');

function getContentType(extension) {
  if(extension.indexOf('.') === 0) {
    extension = extension.slice(1);
  }
var commonMimeTypes = {aac: 'audio/x-aac', ai: 'application/postscript', aif: 'audio/x-aiff', air: 'application/vnd.adobe.air-application-installer-package+zip', application: 'application/x-ms-application', asf: 'video/x-ms-asf', atom: 'application/atom+xml', atomcat: 'application/atomcat+xml', atomsvc: 'application/atomsvc+xml', au: 'audio/basic', avi: 'video/x-msvideo', azw: 'application/vnd.amazon.ebook', bin: 'application/octet-stream', bmp: 'image/bmp', bz: 'application/x-bzip', bz2: 'application/x-bzip2', cab: 'application/vnd.ms-cab-compressed', chat: 'application/x-chat', chm: 'application/vnd.ms-htmlhelp', crd: 'application/x-mscardfile', css: 'text/css', csv: 'text/csv', curl: 'text/vnd.curl', davmount: 'application/davmount+xml', doc: 'application/msword', docx: 'application/msword', dtd: 'application/xml-dtd', dvi: 'application/x-dvi', epub: 'application/epub+zip', exe: 'application/x-msdownload', flv: 'video/x-flv', gif: 'image/gif', gtar: 'application/x-gtar', h261: 'video/h261', h263: 'video/h263', h264: 'video/h264', hqx: 'application/mac-binhex40', html: 'text/html', icc: 'application/vnd.iccprofile', ics: 'text/calendar', jar: 'application/java-archive', java: 'text/x-java-source,java', jpeg: 'image/jpeg', jpg: 'image/jpeg', js: 'application/javascript', json: 'application/json', m3u: 'audio/x-mpegurl', m4v: 'video/x-m4v', mid: 'audio/midi', movie: 'video/x-sgi-movie', mp4: 'video/mp4', mp4a: 'audio/mp4', mpeg: 'video/mpeg', mpga: 'audio/mpeg', mpkg: 'application/vnd.apple.installer+xml', oga: 'audio/ogg', ogv: 'video/ogg', onetoc: 'application/onenote', otf: 'application/x-font-otf', pcx: 'image/x-pcx', pdf: 'application/pdf', pgm: 'image/x-portable-graymap', pgp: 'application/pgp-encrypted', pic: 'image/x-pict', png: 'image/png', ppm: 'image/x-portable-pixmap', ppsx: 'application/vnd.openxmlformats-officedocument.presentationml.slideshow', qt: 'video/quicktime', rar: 'application/x-rar-compressed', rgb: 'image/x-rgb', rm: 'application/vnd.rn-realmedia', rtf: 'application/rtf', rtx: 'text/richtext', sh: 'application/x-sh', sit: 'application/x-stuffit', sitx: 'application/x-stuffitx', smi: 'application/smil+xml', src: 'application/x-wais-source', svg: 'image/svg+xml', swf: 'application/x-shockwave-flash', tar: 'application/x-tar', tiff: 'image/tiff', torrent: 'application/x-bittorrent', txt: 'text/plain', uri: 'text/uri-list', uu: 'text/x-uuencode', vcf: 'text/x-vcard', vcs: 'text/x-vcalendar', vsd: 'application/vnd.visio', wav: 'audio/x-wav', wm: 'video/x-ms-wm', wma: 'audio/x-ms-wma', wmv: 'video/x-ms-wmv', xhtml: 'application/xhtml+xml', xls: 'application/vnd.ms-excel', xlsx: 'application/vnd.ms-excel', xml: 'application/xml', xps: 'application/vnd.ms-xpsdocument', xslt: 'application/xslt+xml', xspf: 'application/xspf+xml', xul: 'application/vnd.mozilla.xul+xml', zip: 'application/zip'};
  return 'Content-Type: ' + commonMimeTypes[extension];
}