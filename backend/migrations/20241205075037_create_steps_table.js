exports.up = function (knex) {
    return knex.schema.createTable('steps', (table) => {
        table.increments('id').primary(); // Clé primaire auto-incrémentée
        table.string('title', 100).notNullable(); // Nom de l'étape
        table.text('description').notNullable(); // Description de l'étape
        table.string('incdice1', 255).notNullable(); // Indice 1
        table.string('incdice2', 255).notNullable(); // Indice 2
        table.string('incdice3', 255).notNullable(); // Indice 3
        table.string('role', 50).defaultTo('null'); // Rôle associé
        table.string('response', 255).notNullable(); // Réponse pour valider l'étape
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('steps');
};