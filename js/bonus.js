// Constructeur du bonus
exports.Bonus = Bonus =function()
{
    this.STAGE_HEIGHT = 50 - 1;
    this.STAGE_WIDTH = 50 - 1;
    this.special = false;
};

//  Fonction d'initialisation du bonus
Bonus.prototype.init = function()
{
    // création des valeurs aléatoire comprise entre 0 et 50
    this.y = Math.floor(Math.random() * this.STAGE_HEIGHT);
    this.x = Math.floor(Math.random() * this.STAGE_WIDTH);
    this.special = false;
};

// Fonction qui ajoute au bonus un paramètre spécial
Bonus.prototype.specialBonus = function()
{
    this.special = true;
};
