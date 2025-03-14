exports.up = function(knex) {
    return knex.schema.createTable('teams', function(table) {
        table.increments('id').primary();
        table.string('name', 100).notNullable();
        table.string('code', 100).notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.integer('step').defaultTo(1);
        table.integer('malus').defaultTo(0);
        table.integer('score').defaultTo(0);
        table.string('key_code', 100).defaultTo('null');
        table.timestamp('start_time');
        table.timestamp('end_time');
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('teams');
};