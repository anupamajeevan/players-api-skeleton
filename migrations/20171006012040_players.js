
exports.up = function(knex, Promise) {
  return knex.schema.raw(
    'CREATE TABLE players(id serial primary key,first_name varchar(60) not null,last_name varchar(60) not null,rating numeric not null check (rating > 0),handedness varchar(10) check (handedness in (\'right\',\'left\')),created_by integer, unique (first_name,last_name));'
  );
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('players');
};
