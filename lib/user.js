function User () {

}

User.prototype.db = false

/**
 * Check if user token is valid
 */
User.prototype.checkAuthToken = function (token, cb) {
  this.db.get('user', {'token': token}, function (err, user) {
    if (err) {
      return cb(true, false)
    } else {
      return cb(null, true)
    }
  })
}

/**
 * Check if user login is valid (user/passowrd)
 */
User.prototype.checkLogin = function (user, cb) {

  this.db.get('user', user, function (err, user) {
    if (err) {
      return cb(true, false)
    } else {
      return cb(null, user)
    }
  })
}

/**
 * Signup a new user
 */
User.prototype.signup = function (user, cb) {
  var db = this.db
  this.checkLogin({user: user.user}, function (err) {
    if (!err) {
      // Insert user in database
      db.put('user', user, function () {
        cb(null, user)
      })
    } else {
      cb('User Already registered', false)
    }
  })
}

module.exports = User
