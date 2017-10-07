// TODO
const express = require('express');
const pg = require('pg');
const bodyParser = require('body-parser');
//const connectionString = 'anupama://localhost:5432/test';
const app = express();
const jwt = require('jsonwebtoken');

const { User, Player } = require('./models');
const port = 3000;
let token;

const router = express.Router();


const knex = require('../src/database/knex');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));
app.get('/', (req, res) => {
  res.send('Hello world');
});

router.get('/users', function(req, res, next) {
  knex('users')
    .select()
    .then(function(users) {
      res.status(201).json({
        success: true,
        users: users
      });
    })
    .catch(function(err) {
      err = new Error('false');
      res.status(409).json({
        success: err.message
      });
    });
});

router.post('/user', function(req, res, next) {
  if (User.validate(req.body)) {
    const user = {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      password: req.body.password,
      confirm_password: req.body.confirm_password
    };
    knex('users')
      .insert(user)
      .returning(['id', 'first_name', 'last_name', 'email', 'password'])
      .then(function(data) {
        const user = data[0];
        token = jwt.sign({user}, 'secret_key');
        res.status(201).json({
          success: true,
          user: user,
          token: token
        });
      })
      .catch(function(err) {
        err = new Error('false');
        res.status(409).json({
          success: err.message
        });
      });
  } else {
    let err = new Error('false');
    res.status(409).json({
      success: err.message
    });
  }
});

router.post('/login', function(req, res, next) {
  knex('users')
    .where({'email': req.body.email})
    .select(['id', 'first_name', 'last_name', 'email', 'password'])
    .then(function(data) {
      if (data[0].password === req.body.password) {
        const user = data[0];
        token = jwt.sign({user}, 'secret_key');
        res.status(200).json({
          success: true,
          user: data[0],
          token: token
        });
      } else {
        let err = new Error('false');
        res.status(401).json({
          success: err.message
        });
      }
    })
    .catch(function(err) {
      err = new Error('false');
      res.status(401).json({
        success: err.message
      });
    });
});

router.post('/players', ensureToken, function(req, res, next) {
  jwt.verify(req.token, 'secret_key', function(err, data) {
    if (err) {
      err = new Error('false');
      res.status(403).json({
        success: err.message
      });
    } else {
      let userId = data.user.id;
      if (Player.validate(req.body)) {
        const player = {
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          rating: req.body.rating,
          handedness: req.body.handedness,
          created_by: userId
        };
        knex('players')
          .insert(player)
          .returning(['id', 'first_name', 'last_name', 'rating', 'handedness'])
          .then(function(returnedPlayer) {
            res.status(201).json({
              success: true,
              player: returnedPlayer[0]
            });
          })
          .catch(function(err) {
            err = new Error('false');
            res.status(409).json({
              success: err.message
            });
          });
      } else {
        err = new Error('false');
        res.status(409).json({
          success: err.message
        });
      }
    }
  });
});

function ensureToken(req, res, next) {
  const bearerHeader = req.headers['authorization'];
  if (typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];
    req.token = bearerToken;
    next();
  } else {
    let err = new Error('false');
    res.status(403).json({
      success: err.message
    });
  }
}

router.get('/players', ensureToken, function(req, res, next) {
  jwt.verify(req.token, 'secret_key', function(err, data) {
    if (err) {
      err = new Error('false');
      res.status(403).json({
        success: err.message
      });
    } else {
      let userId = data.user.id;
      knex('players')
        .where({'created_by': userId})
        .select()
        .then(function(data) {
          res.status(200).json({
            success: true,
            players: data
          });
        })
        .catch(function(err) {
          err = new Error('false');
          res.status(409).json({
            success: err.message
          });
        });
    }
  });
});

router.delete('/players/:id', ensureToken, function(req, res, next) {
  jwt.verify(req.token, 'secret_key', function(err, data) {
    if (err) {
      err = new Error('false');
      res.status(403).json({
        success: err.message
      });
    } else {
      let userId = data.user.id;
      let id = req.params.id;
      knex('players')
        .where({id: id, created_by: userId})
        .del()
        .then(function(data) {
          if (data === 0) {
            err = new Error('false');
            throw err;
          }
          res.status(200).json({
            success: true
          });
        })
        .catch(function(err) {
          err = new Error('false');
          res.status(404).json({
            success: err.message
          });
        });
    }
  });
});

Player.create({first_name: 'Anu', last_name: 'Jee', rating: 1, handedness: 'left', created_by: 76});
//console.log(t);
app.listen(port, () => {
  console.log('Server started http://localhost:%s', port);
});

app.use('/api', router);
module.exports = app;
