var Server = require('./server.js').Server;
var Snake = require('./snake.js').Snake;
var Bonus = require('./bonus.js').Bonus;

// Instancie le serveur
var s = new Server();
s.init(5000);

// compteur qu'on va incrémenter à chaque bonus généré
var newBonus = 0;

var snakes = {};
var bonus = {};

// Gestion des Evenements

// création d'un nouveau Snake lorsqu'un utilisateur se connecte
s.em.addListener('Server.newSnake', function(playerId)
{
    var snake = new Snake();
    snake.init(playerId);
    snakes[playerId] = snake;
});

// Lorsqu'un utilisateur se deconnecte (quitte la page)
s.em.addListener('Snake.disconnect', function(playerId)
{
    console.log('Client disconnected');
    delete snakes[playerId];
});

// Lorsque l'utilisateur appuie sur les boutons de directions de son clavier
s.em.addListener('Snake.changeDirection', function(data)
{
    // on enregistre la direction émis par l'utilisateur avec la méthode setDirection (définie dans snake.js)
    snakes[data.id].setDirection(data.direction);
});

// On stocke dans une variable la fonction
var updateSate = function ()
{
    // pour chaque index dans le tableau qui contient les snakes (chaque snake)
    for (var i in snakes)
    {
        // on deplace leur position
        snakes[i].doStep();
    }

    // on check les collisions
    checkColisions();

    // on met à jour les position des snakes et des bonus en appelant la fonction 'update' qui sera receptionnée par le serveur
    s.update(snakes, bonus);
};

// fonction qui check les colisions sur le plateau
function checkColisions()
{
    // colision entre les snakes et les bonus
    for (var i in snakes)
    {
        // var snake qui contient le snake en cours
        var snake = snakes[i];


        for (var j in bonus)
        {
            if(snake.hasColision(bonus[j]))
            {
                // on supprime le bonus et on incrémente la taille du snake avec la fonction addLength();
                snake.addLength();

                // on appelle la fonction eatBonus qui incrémente le score du snake
                // (regarde si c'est un simple bonus ou un bonus spécial pour savoir quel score lui attribuer)
                snake.eatBonus(bonus[j]);

                delete bonus[j];

                // on incrémente la varibale qui contient le nombre de bonus générés
                newBonus++;
                // tous les 3 bonus mangés, on génère un bonus spécial
                if (newBonus % 3 === 0)
                {
                    // on ajoute aléatoirement sur le plateau le bonus spécial
                    addSpecialBonus();
                }
                else
                {
                    // sinon on génère un bonus normal
                    addBonus();
                }
                // on break pour la performance
                break;
            }
        }
    }

    // Tableau qui va contenir tous les snakes à réinitialiser
    var resetSnakes = [];

    // Collision entre les snakes
    for (i in snakes)
    {
        // var snake qui contient le snake en cours
        var snake = snakes[i];

        for (var l in snakes)
        {
            for (var k in snakes[l].elements)
            {
                // si le snake se mange lui-même et que c'est sa tête
                if (snakes[l].playerId == snake.playerId &&
                    k == snakes[l].elements.length - 1)
                {
                    // pour sauter l'itération suivante (le if suivant)
                    continue;
                }
                if (snake.hasColision(snakes[l].elements[k]))
                {
                    // on met dans le tableau des snakes à réinitialiser le snake qui a eu une colision
                    resetSnakes.push(snake);

                    // si le snake est entré en colision avec un autre snake (pas avec lui-même), cela lui donne un kill
                    if (snakes[l].playerId != snake.playerId)
                    {
                        snakes[l].kill();
                    }
                }
            }
        }
    }

    // Mort du snake
    for (var m in resetSnakes)
    {
        resetSnakes[m].die();
    }
}

// Fonction qui ajoute les bonus au plateau du jeu
function addBonus()
{
    for (var i=0; i<1; i++)
    {
        bonus[i] = new Bonus();
        bonus[i].init();
    }
}

// Fonction qui ajoute un bonus spécial
function addSpecialBonus()
{
    for (var i=0; i<1; i++)
    {
        bonus[i] = new Bonus();
        bonus[i].init();
        // on fait appel à la méthode supplémentaire "specialBonus"
        bonus[i].specialBonus();
    }
}

// On rafraichit la variable updateSnake toutes les 100ms
var tick = setInterval(updateSate, 100);

// on ajoute les bonus
addBonus();
