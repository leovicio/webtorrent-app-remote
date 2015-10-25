function User () {

}

User.prototype.db = false

/**
 * Check if user token is valid
 */
User.prototype.checkAuthToken = function (token, cb) {
  this.db.find({'token': token}, function (err, user) {
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
  var find_user = this.db.find(user)
  if (find_user) {
    return cb(false, find_user)
  } else {
    return cb(true, false)
  }
}

/**
 * Signup/Update user
 */
User.prototype.signup = function (user, cb) {
  var db = this.db
  this.checkLogin({user: user.user}, function (err) {
    if (!err) {
      // Insert user in database
      db.insert(user)
      cb(false, user)
    } else {
      cb('User Already registered', false)
    }
  })
}

/**
 * Update user
 */
User.prototype.update = function (user, cb) {
  this.db.update(user)
  cb(false, user)
}

/**
 * List All Users
 */
User.prototype.list = function (cb) {
  cb(this.db.find())
}

/**
 * Single user info
 */
User.prototype.info = function (id, cb) {
  cb(this.db.get(id))
}

module.exports = User
