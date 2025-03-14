exports.up = function(knex) {
    return knex.schema.createTable('team_members', function(table) {
        table.increments('id').primary();
        table.integer('team_id').unsigned().references('id').inTable('teams').onDelete('CASCADE');
        table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
        table.string('role', 50).defaultTo('null');
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('team_members');
};