node.js
=======

Pruebas de concepto de Node.JS


Contiene un servidor http, un servidor de websockets y un html que en envía al cliente y renderiza el carrusel.

Cómo ejecutar:

1. Descargar e instalar node.js (http://nodejs.org/).
2. Desde Node.js command prompt, ubicarse en el directorio donde se encuentre el proyecto.
3. Instalar socket.io: 
	npm install socket.io
4. Ejecutar el servidor http:
	node httpserver.js (alternativamente node httpserver).
5. En una nueva ventana de Node.js command prompt, ejecutar el servidor de websocket:
	node webserversocket.js (alternativamente node webserversocket).
6. Abrir el navegador web y apuntar a la dirección: http://[direccion ip del servidor http]:8125
6a. Dentro de /img pueden crearse tantos directorios como se quieran y que estos contengan imágenes, las cuales se verán en el carrusel, siempre que
	en el query del url el parámetro 'id' corresponda con el nombre del subdirectorio.
	p.e. /img/prueba -> http://[direccion ip del servidor http]:8125/?id=prueba.