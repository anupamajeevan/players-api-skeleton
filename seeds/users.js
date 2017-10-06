
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('users').del()
    .then(function() {
      const users = [{
        email: 'anu@bobo.com',
        first_name: 'Anu',
        last_name: 'Bobo',
        password: '123foobar',
        confirm_password: '123foobar'
      }, {
        email: 'jim1@bob.com',
        first_name: 'Jim1',
        last_name: 'Bob1',
        password: 'foobar1234',
        confirm_password: 'foobar1234'
      }];

      return knex('users').insert(users);
    });
};
