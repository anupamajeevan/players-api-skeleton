const pg = require('pg');

var config = {
  user: 'anupama',
  database: 'test',
  max: 10,
  idleTimeoutMillis: 3000
};

var pool = new pg.Pool(config);

module.exports = {

/******************************** USER ************************************/

  User: {

    create: function(user) {
      let newUser = {
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email
      };

      return new Promise(function(resolve, reject) {
        resolve(newUser);
      });
    },

    remove: function() {
      let newUser = {};
      return new Promise(function(resolve, reject) {
        resolve(newUser);
      });
    }

  },

  /****************************** PLAYER ************************************/

  Player: {
    create: function(player) {
      let newPlayer = {
        first_name: player.first_name,
        last_name: player.last_name,
        rating: player.rating,
        handedness: player.handedness,
        created_by: player.created_by
      };

      return new Promise(function(resolve, reject) {
        pool.connect(function(err, client, done) {
          var myClient = client;
          var insert = `INSERT INTO players (first_name, last_name, rating, handedness, created_by) VALUES('${newPlayer.first_name}','${newPlayer.last_name}','${newPlayer.rating}','${newPlayer.handedness}','${newPlayer.created_by}')`;
          myClient.query(insert)
            .then(function() {
              resolve(newPlayer);
            })
            .catch(function(err) {
              err = new Error('false');
              reject(err);
            });
        });
      });
    },

    remove: function() {
      let newPlayer = {};
      return new Promise(function(resolve, reject) {
        resolve(newPlayer);
      });
    },

    findById: function(id) {
      pool.connect(function(err, client, done) {
        var myClient = client;
        var select = `SELECT * FROM players WHERE ID=${id}`;
        return myClient.query(select);
      });
    }
  }
};
