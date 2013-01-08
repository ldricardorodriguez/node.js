var server = require("socket.io").listen(5000); //el servicio de sockets escucha por el puerto 5000
var fs = require('fs');
var http = require('http');
var ruta = require('path');
var path = './img';
var fullpath = '';
var n_files = 0;

//cuando levanta el socket
server.sockets.on("connection", function(message)
{
    message.on('clientRunning', function(data) //al recibir el mensaje desde el cliente
    {
		console.log('Inicio el cliente...'+data);
		fullpath = path+'/'+data; //construye la ruta a través de la data que llega del url
		try{
			if (!fs.existsSync(fullpath)){
				fullpath = path;
			}
			fs.watch(fullpath, function(event,file) { //vigila el directorio en busca de cambios
				var actual_files = 0;
				fs.readdir(path, function (err, files) { //comprueba el número de archivos presentes en el directorio
					if (err) throw err;
					//En windows cuando se hace una copia de un archivo, por ejemplo se hacen varios cambios en el directorio, que
					//son detectados (todos) por la función fs.watch, para evitar hacer envíos innecesarios solo hago envíos cuando
					// el numero de archivos cambia, o cuando hay un rename.
					if (n_files != files.length || event=='rename'){ 
						//se envía la notificación al cliente, aquí se puede hacer un broadcast a todos
						//pero para efectos de esta prueba solo se hace al socket involucrado, además que se hace dentro del callback
						message.emit('notification', null);
						console.log('Sending notification...');
						n_files = files.length;
					}	
				})});
			} catch (e){
			console.log('Error -> '+e);
		}
    });
	
	//cuando el cliente pide contenido, es decir que previamente recibió una notificación de que había nuevo contenido.
	message.on('requestContent', function(data){
		try{
		fs.readdir(fullpath, function (err, files) { //buscamos todos los archivos en el directorio...
			if (err) throw err;				
			var params = new Array();
			
			for (var i in files) {
				var currentFile = fullpath + '/' + files[i];
				
				var gm = require('gm');
				gm(currentFile)
				.resize(200, 110)
				.write(currentFile, function (err) {
				  if (!err) console.log(' hooray! ');
				  if (err) throw err;
				});
				
				var stats = fs.statSync(currentFile);
				if (stats.isFile()) { //Se comprueba que sean archivos, así no se envía un url en caso de que sea un directorio.
					console.log(currentFile);
					params.push({id: data, url: encodeURI(fullpath.substring(1)+'/'+files[i])});
				}
			}
			message.emit('sendEvent', params); //por último se envía el json al cliente con la lista de imágenes.
			params = {}
		})
		} catch (e){
			console.log('Error -> '+e);
		}
	});
});