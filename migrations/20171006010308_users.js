
exports.up = function(knex, Promise) {
  return knex.schema.createTable('users', (table) => {
    table.increments();
    table.text('first_name').notNullable();
    table.text('last_name').notNullable();
    table.text('email').notNullable().unique();
    table.text('password').notNullable();
    table.text('confirm_password').notNullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('users');

};
