// Constructeur du Snake
exports.Snake = Snake =function()
{
	this.SNAKE_LENGTH = 8;
    this.STAGE_WIDTH = 50 - 1;
    this.STAGE_HEIGHT = 50 - 1;
};

//  Fonction d'initialisation du snake avec comme paramètre l'id du client
Snake.prototype.init = function (playerId)
{
    this.currentlength = this.SNAKE_LENGTH;
    this.deaths = 0;
    this.playerId = playerId;
    this.kills = 0;
    this.score = 0;
    this.goodies = 0;

    // tableau qui va contenir le corps du snake sous forme d'un tableau de carré
    this.elements = [];

    // Direction par défaut du snake
    this.direction = 'right';

    var rand = Math.floor(Math.random() * this.STAGE_HEIGHT);

    // construction du snake avec la boucle for qui décréménente (on part de la queue pour aller à la tête
    for (var i=this.SNAKE_LENGTH; i>0; i--){
        this.elements.push({x: -i, y: rand});
    }
};

// Fonction qui réinitialise la taille du snake et qui incrémente le nombre de ses kills
Snake.prototype.reset = function ()
{
    this.currentlength = this.SNAKE_LENGTH;
    this.elements = [];

    // On remets en place les éléments du snake (comme dans la fonction init)
    var rand = Math.floor(Math.random() * this.STAGE_HEIGHT);
    for (var i=this.currentlength; i>0; i--){
        this.elements.push({x: -i, y: rand});
    }
};

// Fonction qui splite les différents blocs du corps du snake
Snake.prototype.doStep = function ()
{
    var length = this.elements.length - 1;
    for (var i=0; i<length; i++){
        this.moveBlock(i);
    }
    this.moveHead();
};

// Fonction qui déplace le corps du snake
Snake.prototype.moveBlock = function(i)
{
    // chaque bloc prend pour position la position du bloc suivant (effet chenille)
    this.elements[i].x = this.elements[i + 1].x;
    this.elements[i].y = this.elements[i + 1].y;
};

// fonction qui déplace la tête du snake
Snake.prototype.moveHead = function(i, direction)
{
    var length = this.elements.length;
    var head = this.elements[length -1];

    // déplacement de la position de la tête en fonction des directions
    // PS : le point 0,0 est situé en haut à gauche du plateau de jeu
    switch (this.direction)
    {
        case 'left':
                head.x--;
        break;

        case 'right':
                head.x++;
        break;

        case 'down':
                head.y++;
        break;

        case 'up':
                head.y--;
        break;

    }

    // Gestion des hors positions sur le plateur de jeu
    if (head.x > this.STAGE_WIDTH)
    {
        head.x = 0;
    }
    else if (head.x < 0)
    {
        head.x = this.STAGE_WIDTH;
    }

    if (head.y > this.STAGE_HEIGHT)
    {
        head.y = 0;
    }
    else if(head.y < 0)
    {
        head.y = this.STAGE_HEIGHT;
    }
};

// Fonction qui enregistre la direction enregistrée par l'utilisateur et qui vérifie si celle-ci n'est pas contradictoire
// (si il ne recule pas son snake)
Snake.prototype.setDirection = function(direction)
{
    if (direction == 'right' && this.direction !='left' ||
        direction == 'left' && this.direction !='right' ||
        direction == 'down' && this.direction !='up'    ||
        direction == 'up' && this.direction !='down')
    {
        this.direction = direction;
    }

};

// Fonction qui check si il y a une colision entre un snake et un élèment passé en paramètre
Snake.prototype.hasColision = function (item)
{
    var head = this.elements[this.elements.length - 1];
    if (head.x == item.x && head.y == item.y)
    {
        return true;
    }
    return false;
};

// Fonction qui ajoute une case au snake (quand il mange un bonus) au niveau de sa queue
// si le bonus mangé est un bonus spécial, on ajoute plus de cases au snake
Snake.prototype.addLength = function ()
{
    var snakeQueue = this.elements[0];
    this.currentlength = this.currentlength + 30;
    this.elements.unshift ({x: snakeQueue.x, y: snakeQueue.y});
};

// Fonction qui incrémente le score du nake lorsqu'il a mangé un bonus
Snake.prototype.eatBonus = function (bonus)
{
    // vérification si le bonus est un bonus spécial
    if(bonus.special === true)
    {
        this.score = this.score + 30;
    }
    else
    {
        this.score = this.score + 10;
    }
    this.goodies++;
};

// Fonction qui incrémente le nombre de kills du snake et son score
Snake.prototype.kill = function ()
{
    this.score = this.score + 50;
};

// Fonction qui tue le snake, incrémente son nombre de morts, décrémente son score et appel la fonction reset()
Snake.prototype.die = function ()
{
    this.deaths++;
    this.score = this.score - 50;
    this.reset();
};