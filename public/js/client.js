var canvas,
    context,
    server,
    snakeId,
    STAGE_HEIGHT = 50,
    STAGE_WIDTH = 50,
    BLOCK_HEIGHT = 10,
    BLOCK_WIDTH = 10;

// fonction de connexion d'un utilisateur
function connect ()
{
    // on se connecte avec l'url du serveur
    server = io.connect('http://localhost:5000/snake');

    // quand le serveur envoie sa réponse après la connexion d'un utilisateur
    server.on('response', function (data)
    {
        // on fait un affichage console dans le navigateur du client
        console.log('Snake Id response : ' + data.snakeId);

        // le snakeId est associé au joueur
        snakeId = data.snakeId;
    });

    // quand un utilisateur se connecte
        server.on('Snake.newSnake', function(client){
            // fonction qui affiche dans la liste des évènements le nouvel utilisateur connecté
            drawConnectEvents(client);
        });

    // quand un utilisateur se déconnecte
    server.on('Snake.disconnect', function (client)
    {
        // fonction qui affiche dans la liste des évènements l'utilisateur déconnecté
        console.log(client);
        drawDisconnectEvents(client);
    });

    // à chaque update du serveur, on appelle les fonctions qui remplissent le canvas et les scores
    server.on('update', function (snakes, bonus)
    {
        drawCanvas(snakes, bonus);
        drawScores(snakes);
    });
}

// fonction d'écoute des touches de directions tapées par l'utilisateur
function listenKeys()
{
    var direction;
    $(document).keydown(function (e)
    {
        var key = e.keyCode;

        switch (key)
        {
            case 37: // left
                    direction = 'left';
            break;

            case 38: // up
                    direction = 'up';
            break;

            case 39: // right
                    direction = 'right';
             break;

            case 40: // down
                    direction = 'down';
            break;

            default:
                  direction = 'right';

            break;
        }
        // on envoie au serveur la direction tapée par l'utilisateur
        server.emit('Snake.requestDirection', {direction : direction});
    });
}

// fonction qui dessine le canvas, les snakes et les bonus
function drawCanvas(snakes, bonus)
{
    // On parcours en x et en y le canvas et on remplis toutes les cases
    context.fillStyle = '#CCC';
    for (var i=0; i<STAGE_WIDTH; i++)
    {
        for (var j=0; j<STAGE_HEIGHT; j++)
        {
            context.fillRect(i * BLOCK_WIDTH, j * BLOCK_HEIGHT, BLOCK_WIDTH - 1, BLOCK_HEIGHT - 1); // borders
        }
    }

    // pour chacun des snakes
    for(i in snakes)
    {
        var snake = snakes[i],
            snakeLength = snake.elements.length;

        // pour chaque snake, on remplit les cases de sa position actuelle
        for (var j=0; j<snakeLength; j++)
        {
            var element = snake.elements[j],
                x = element.x * BLOCK_WIDTH,
                y = element.y * BLOCK_HEIGHT;

            if(snake.playerId == snakeId)
            {
                // l'utilisateur en cours
                context.fillStyle = 'rgba(255, 0, 0, ' + (j*snakeLength/100 +.1) + ')';
            }

            else
            {
                // les autres utilisateurs sont en noirs
                context.fillStyle = 'rgba(0, 0, 0, ' + (j*snakeLength/100 +.1) + ')';
            }
            context.fillRect(x, y, BLOCK_WIDTH - 1, BLOCK_HEIGHT -1);
        }
    }

    // pour chacun des bonus
    for (i in bonus)
    {
        if(bonus[i].special == true)
        {
            // si c'est un bonus spécial
            // on le colorie d'une autre facon
            context.fillStyle = 'yellow';
            // et on affiche un message en haut sur la page
            $('#special-bonus').empty().append('<h2>SPECIAL BONUS !!<h2>').fadeOut().fadeIn();
        }
        else
        {
            // on remplit les cases ou se trouvent les bonus contenu dans le tableau des bonus
            context.fillStyle = '#0000FF';
            // on vide le message 'special bonus' s'il est présent
            $('#special-bonus').empty();
        }
        context.fillRect(bonus[i].x * BLOCK_WIDTH, bonus[i].y * BLOCK_HEIGHT, BLOCK_WIDTH - 1, BLOCK_HEIGHT -1);
    }
}

// Fonction qui affiche un message dans le bloc des évènements lorsqu'un joueur se connecte
function drawConnectEvents (client)
{
    var joueurconnected = '<div class="alert alert-info">' +
                          '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                                'Le joueur '+client+' s\'est connecté !' +
                          '</div>';
    $('#event-list').prepend(joueurconnected);
}

// Même chose lorqu'un joueur se déconnecte
function drawDisconnectEvents (client)
{
    var joueurdisconnected = '<div class="alert alert">' +
                             '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                                 'Le joueur '+client+' s\'est déconnecté !' +
                             '</div>';
    $('#event-list').prepend(joueurdisconnected);
}

// fonction qui met à jour les scores
function drawScores(snakes)
{
    for (i in snakes){
        var snake = snakes[i];
        var thisPlayerId = snake.playerId;

        if(thisPlayerId == snakeId)
        {
            // si c'est le snake du joueur actuel, le titre a un style spécial (classe css this-player)
            var thisPlayerName = "<h3 class='this-player'>Joueur "+thisPlayerId +" (vous)</h3>";
        }
        else
        {
            // pour les autres joueurs (classe css other-player)
            var thisPlayerName ="<h3 class='other-players'>Joueur "+thisPlayerId +"</h3>";
        }

        // variable qui contient  la ligne du joueur
        var thislignePlayer = '<li id="player'+thisPlayerId+'"></li>';

        // variable qui contient les infos du joueur qui vont être rafraichies à chaque update du serveur
        var thisPlayer =    '<span class="score">Kills : <span class="nombre">'+ snake.kills +'</span></span>' +
                            '<span class="score">  Goodies : <span class="nombre">'+ snake.goodies +'</span></span>' +
                            '<span class="score">  Deaths : <span class="nombre">'+ snake.deaths +'</span></span>' +
                            '<span class="score last">  Score : <span class="nombre">'+ snake.score +'</span></span>';

        // on affiche une ligne pour chaque joueur dans la liste des joueurs en train de jouer
        $('#player-list').append(thislignePlayer);

        // on rafraichit les stats du joueur dans la ligne de celui-ci
        $('#player'+thisPlayerId +'').empty().append(thisPlayerName+thisPlayer);
    }
}

// constructeur
$(function ()
{
    // on renseigne l'id du canvas sur lequel va se jouer le jeu
    canvas = $('#stage');
    // on lui renseigne le contexte du canvas (2d ici)
    context = canvas.get(0).getContext('2d');
    // et on appelle les différentes fonctions relatives à l'utilisateur (fonction qui connecte le joueur et fonction qui écoute les évènements claviers)
    connect();
    listenKeys();
});