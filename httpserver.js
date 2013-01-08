var http = require('http');
var fs = require('fs');
var path = require('path');
var url = require('url');
 
var server = http.createServer(function (request, response) {
 
    console.log('request starting...');
	
	//obtengo solo el pathname... es decir lo que esté antes del query, (antes de ?)
	var filePath = '.'+decodeURI(url.parse(request.url,true).pathname);

	//Si no se especifica una ruta en particular, que sirva el index.
    if (filePath == './' || filePath == '/')
        filePath = './index.html';
    
    //para que interprete los tipos de contenido dependiendo de la extension del archivo que se pide por url
	var extname = path.extname(filePath);
    var contentType = 'text/html';
    switch (extname.toUpperCase()) {
        case '.jpg'.toUpperCase():
            contentType = 'image/jpg';
            break;
        case '.css'.toUpperCase():
            contentType = 'text/css';
            break;
		case '.js'.toUpperCase():
			contentType = 'text/javascript';
			break;
		case '.png'.toUpperCase():
			contentType = 'image/png';
			break;
    }
     
	//verifica si la ruta existe 
    path.exists(filePath, function(exists) {
     
        if (exists) {
			//si existe lo envia por el 200 si no, por el 500 anunciando error
            fs.readFile(filePath, function(error, content) {
                if (error) {
                    response.writeHead(500);
                    response.end();
                }
                else {
					response.writeHead(200, { 'Content-Type': contentType });
					response.end(content, 'utf-8');
                }
            });
        }
        else {
			//si no existe envía un 404.
            response.writeHead(404);
            response.end();
        }
    });
     
}).listen(8125); //escuchando por el puerto 8125

server.on('connection', function(sock) {
  console.log('Client connected from ' + sock.remoteAddress);
  // Client address at time of connection ----^
});
console.log('Servidor corriendo en http://127.0.0.1:8125/');