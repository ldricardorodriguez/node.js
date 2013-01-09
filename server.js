var http = require('http');
var fs = require('fs');
var path = require('path');
var url = require('url');
var server = require("socket.io").listen(5000); //el servicio de sockets escucha por el puerto 5000
var ruta = './img';
var fullpath = '';
var n_files = 0;
 
var httpserver = http.createServer(function (request, response) { 
    console.log('request starting...');
	
	//obtengo solo el pathname... es decir lo que est� antes del query, (antes de ?)
	var filePath = '.'+decodeURI(url.parse(request.url,true).pathname);

	//Si no se especifica una ruta en particular, que sirva el index.
    if (filePath == './' || filePath == '/')
        filePath = './index.html';
    
    //para que interprete los tipos de contenido dependiendo de la extension del archivo que se pide por url
	var extname = path.extname(filePath);
    var contentType = 'text/html';
    switch (extname.toUpperCase()) {
        case '.JPG'.toUpperCase():
            contentType = 'image/jpg';
            break;
        case '.CSS'.toUpperCase():
            contentType = 'text/css';
            break;
		case '.JS'.toUpperCase():
			contentType = 'text/javascript';
			break;
		case '.PNG'.toUpperCase():
			contentType = 'image/png';
			break;
		case '.GIF'.toUpperCase():
			contentType = 'image/gif';
			break;
		case '.JPEG'.toUpperCase():
            contentType = 'image/jpg';
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
			//si no existe env�a un 404.
            response.writeHead(404);
            response.end();
        }
    });
     
}).listen(8125); //escuchando por el puerto 8125

httpserver.on('connection', function(sock) {
  console.log('Client connected from ' + sock.remoteAddress);
  // Client address at time of connection ----^
});
console.log('Servidor corriendo en http://127.0.0.1:8125/');

//cuando levanta el socket
server.sockets.on("connection", function(message)
{
    message.on('clientRunning', function(data) //al recibir el mensaje desde el cliente
    {
		console.log('Inicio el cliente...'+data);
		fullpath = ruta+'/'+data; //construye la ruta a trav�s de la data que llega del url
		try{
			if (!fs.existsSync(fullpath)){
				fullpath = ruta;
			}
			fs.watch(fullpath, function(event,file) { //vigila el directorio en busca de cambios
				var actual_files = 0;
				fs.readdir(ruta, function (err, files) { //comprueba el n�mero de archivos presentes en el directorio
					if (err) throw err;
					//En windows cuando se hace una copia de un archivo, por ejemplo se hacen varios cambios en el directorio, que
					//son detectados (todos) por la funci�n fs.watch, para evitar hacer env�os innecesarios solo hago env�os cuando
					// el numero de archivos cambia, o cuando hay un rename.
					if (n_files != files.length || event=='rename'){ 
						//se env�a la notificaci�n al cliente, aqu� se puede hacer un broadcast a todos
						//pero para efectos de esta prueba solo se hace al socket involucrado, adem�s que se hace dentro del callback
						message.emit('notification', null);
						console.log('Sending notification...');
						n_files = files.length;
					}	
				})});
			} catch (e){
			console.log('Error -> '+e);
		}
    });
	
	//cuando el cliente pide contenido, es decir que previamente recibi� una notificaci�n de que hab�a nuevo contenido.
	message.on('requestContent', function(data){
		try{
		fs.readdir(fullpath, function (err, files) { //buscamos todos los archivos en el directorio...
			//if (err) throw err;				
			var params = new Array();
			
			for (var i in files) {
				var currentFile = fullpath + '/' + files[i];
				
				var gm = require('gm');
				var extname = path.extname(files[i]).toUpperCase();
				if (extname == '.JPG' || extname == '.JPEG' || extname == '.PNG' || extname == '.GIF'){
					gm(currentFile)
					.resize(200)
					.quality(100)
					.write(currentFile, function (err) {
					  if (!err) console.log(' hooray! ');
					  if (err) throw err;
					});
				}
				var stats = fs.statSync(currentFile);
				if (stats.isFile()) { //Se comprueba que sean archivos, as� no se env�a un url en caso de que sea un directorio.
					console.log(currentFile);
					params.push({id: data, url: encodeURI(fullpath.substring(1)+'/'+files[i])});
				}
			}
			message.emit('sendEvent', params); //por �ltimo se env�a el json al cliente con la lista de im�genes.
			params = {}
		})
		} catch (e){
			console.log('Error -> '+e);
		}
	});
});