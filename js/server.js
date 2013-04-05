// Fait appel aux  différents services
var express = require("express"),
    http = require('http'),
    events = require("events"),
    io = require('socket.io'),
    app = express();

// Constructeur passé en public, disponible dans les autres fichiers
exports.Server = Server = function ()
{
    this.clientId = 1;
};


// Fonction d'initialisation du serveur avec les différents paramètres
Server.prototype.init = function (port)
{
    // Creation du serveur
    this.server = http.createServer(app);

    // Définition du chemin vers le dossier de l'application "client"
    app.use(express.static(__dirname + '/../public'));

    // Ecoute du port passé en paramètre de la fonction
    this.server.listen(port);

    // Inisialisation des sockets
    this.startSockets();

    // Instanciation des evenements
    this.em = new events.EventEmitter();
    console.log('Listening port : ' + port);
};

// Fonction qui démarre les sockets
Server.prototype.startSockets = function ()
{
    // On écoute le serveur
    this.socket = io.listen(this.server);

    // On configure les sockets
    this.socket.configure( function()
    {
        this.socket.set('log level', 1);
    }.bind(this)); // bind pour faire référence à l'objet serveur

    // actions à la connexion d'un user
    this.socket.of('/snake').on('connection', function(client)
    {
        client.snakeId = this.clientId;
        this.clientId++;

        // envoie d'une réponse au client
        client.emit('response', {snakeId: client.snakeId});

        // envoie d'une notification à tous les autres utilisateurs qu'un utilisateur s'est connecté
        this.socket.of('/snake').emit('Snake.newSnake',client.snakeId);
        this.em.emit('Server.newSnake', client.snakeId);

        // reception lorsque le client appuie sur un bouton de direction
        client.on('Snake.requestDirection', function (data)
        {
            // on récupère en paramètre l'id de l'utilisateur et la direction tapée
            this.em.emit('Snake.changeDirection',
            {
                id: client.snakeId,
                direction: data.direction
            });
        }.bind(this));

        // lors de la deconnexion d'un utilisateur
        client.on('disconnect', function(){
            this.socket.of('/snake').emit('Snake.disconnect',client.snakeId);

            // emet un message d'information avec l'id de l'utilisateur déconnecté
            this.em.emit('Snake.disconnect', client.snakeId);
        }.bind(this));

    }.bind(this));


};

// Fonction qui envoie les mises à jour des snakes(position, taille, etc) et des bonus (position) vers le client
Server.prototype.update = function (snakes, bonus)
{
    this.socket.of('/snake').emit('update', snakes, bonus);
};

// Fonction qui envoie les notifications d'évènements aux clients
Server.prototype.updateEvents = function ()
{
    this.socket.of('/snake').emit('updateEvents', events);
}

