
exports.up = function(knex, Promise) {
  return knex.schema.raw(
    'CREATE TABLE players (id serial primary key,first_name varchar(60) not null unique,last_name varchar(60) not null,rating numeric not null check (rating > 0),handedness varchar(10) check (handedness in (\'right\',\'left\')),created_by varchar(60));'
  );
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('players');
};
