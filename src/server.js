// TODO
const express = require('express');
const pg = require('pg');
const bodyParser = require('body-parser');
//const connectionString = 'anupama://localhost:5432/test';
const app = express();
const jwt = require('jsonwebtoken');

const { User } = require('./models');
const port = 3000;
let token;
var config = {
  user: 'anupama',
  database: 'test',
  max: 10,
  idleTimeoutMillis: 3000
};

var pool = new pg.Pool(config);

const router = express.Router();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));
app.get('/', (req, res) => {
  res.send('Hello world');
});

router.get('/users', function(req, res, next) {
  pool.connect(function(err, client, done) {
    if (err) return next(err);
    var myClient = client;
    var selectAll = 'SELECT * FROM users';
    myClient.query(selectAll)
      .then(function(data) {
        res.status(201).json({
          success: true,
          users: data.rows
        });
      })
      .catch(function(err) {
        err = new Error('false');
        res.status(409).json({
          success: err.message
        });
      });
  });
  //pool.end();
});

router.post('/user', function(req, res, next) {
  pool.connect(function(err, client, done) {
    if (err) return next(err);
    let keys = ['first_name', 'last_name', 'email', 'password', 'confirm_password'];
    let flag = true;
    for (let key of keys) {
      if (!req.body.hasOwnProperty(key)) {
        flag = false;
        break;
      }
    }
    if (flag && req.body.password === req.body.confirm_password) {
      var myClient = client;
      var selectAll =
        `INSERT INTO users (first_name, last_name, email, password, confirm_password) VALUES('${req.body.first_name}','${req.body.last_name}','${req.body.email}','${req.body.password}','${req.body.confirm_password}')`;
      myClient.query(selectAll)
        .then(function() {
          User.create(req.body)
            .then(function(user) {
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
  });
});

router.post('/login', function(req, res, next) {
  pool.connect(function(err, client, done) {
    if (err) next(err);
    var myClient = client;
    var password = `SELECT * FROM users WHERE email = '${req.body.email}'`;
    myClient.query(password)
      .then(function(data) {
        if (data.rows[0].password === req.body.password) {
          const user = data.rows[0];
          token = jwt.sign({user}, 'secret_key');
          res.status(200).json({
            success: true,
            user: user,
            token: token
          });
        } else {
          err = new Error('false');
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
  //pool.end();
});

router.post('/players', ensureToken, function(req, res, next) {
  jwt.verify(req.token, 'secret_key', function(err, data) {
    if (err) {
      err = new Error('false');
      res.status(403).json({
        success: err.message
      });
    } else {
      let userEmail = data.user.email;
      pool.connect(function(err, client, done) {
        if (err) return next(err);
        let keys = ['first_name', 'last_name', 'rating', 'handedness'];
        let flag = true;
        for (let key of keys) {
          if (!req.body.hasOwnProperty(key)) {
            flag = false;
            break;
          }
        }
        if (flag) {
          var myClient = client;
          var insert = `INSERT INTO players (first_name, last_name, rating, handedness, created_by) VALUES('${req.body.first_name}','${req.body.last_name}','${req.body.rating}','${req.body.handedness}','${userEmail}')`;
          myClient.query(insert)
            .then(function() {
              res.status(201).json({
                success: true,
                player: req.body
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
      });
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
      let userEmail = data.user.email;
      pool.connect(function(err, client, done) {
        if (err) return next(err);
        var myClient = client;
        var select = `SELECT * FROM players WHERE CREATED_BY='${userEmail}'`;
        myClient.query(select)
          .then(function(data) {
            res.status(200).json({
              success: true,
              players: data.rows
            });
          })
          .catch(function(err) {
            err = new Error('false');
            res.status(409).json({
              success: err.message
            });
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
      let userEmail = data.user.email;
      let id = req.params.id;
      pool.connect(function(err, client, done) {
        if (err) return next(err);
        var myClient = client;
        var select = `DELETE FROM players WHERE ID=${id} AND CREATED_BY='${userEmail}'`;
        myClient.query(select)
          .then(function(data) {
            if (data.rowCount === 0) {
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
      });
    }
  });
});

app.listen(port, () => {
  console.log('Server started http://localhost:%s', port);
});

app.use('/api', router);
module.exports = app;
