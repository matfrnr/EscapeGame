exports.up = function (knex) {
    return knex.schema.createTable('team_timers', (table) => {
        table.increments('id').primary();
        table
            .integer('team_id')
            .unsigned()
            .references('id')
            .inTable('teams')
            .onDelete('CASCADE'); // Référence à la table teams
        table.integer('elapsed_score').defaultTo(0);
        table.timestamp('last_updated').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('team_timers');
};