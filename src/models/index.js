const knex = require('../database/knex');

module.exports = {

/******************************** USER ************************************/

  User: {

    validate: function(user) {
      let keys = ['first_name', 'last_name', 'email', 'password', 'confirm_password'];
      let flag = true;
      for (let key of keys) {
        if (!user.hasOwnProperty(key)) {
          flag = false;
          break;
        }
      }
      return flag && user.password === user.confirm_password;
    },

    create: function(user) {
      if (this.validate(user)) {
        let newUser = {
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          password: user.password,
          confirm_password: user.confirm_password
        };
        return knex('users')
          .insert(newUser)
          .returning(['id', 'first_name', 'last_name', 'email']);
      }
    },

    remove: function(user) {
      return knex('users').del();
    }
  },

  /****************************** PLAYER ************************************/

  Player: {

    validate: function(player) {
      let keys = ['first_name', 'last_name', 'rating', 'handedness'];
      let flag = true;
      for (let key of keys) {
        if (!player.hasOwnProperty(key)) {
          flag = false;
          break;
        }
      }
      return flag;
    },

    create: function(player) {
      if (this.validate(player)) {
        let newPlayer = {
          first_name: player.first_name,
          last_name: player.last_name,
          rating: player.rating,
          handedness: player.handedness,
          created_by: player.created_by
        };
        return knex('players').returning(['id', 'first_name', 'last_name']).insert(newPlayer);
      }
    },

    remove: function(player) {
      return knex('players').del();
    },

    findById: function(id) {
      return knex('players').where({id: id}).select();
    }
  }
};
