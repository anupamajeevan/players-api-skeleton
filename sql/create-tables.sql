CREATE TABLE users (
  id serial primary key,
  first_name varchar(60) not null,
  last_name varchar(60) not null,
  email varchar(60) not null unique,
  password varchar(60),
  confirm_password varchar(60)
);

CREATE TABLE players (
  id serial primary key,
  first_name varchar(60) not null,
  last_name varchar(60) not null,
  rating numeric not null check (rating > 0),
  handedness varchar(10) check (handedness in ('right','left')),
  created_by integer,
  unique (first_name,last_name)
);
