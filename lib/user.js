var bcrypt = require('bcrypt')
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
  var find_user = this.db.find({user: user.user})
  if(find_user.length){
    bcrypt.compare(user.pass, find_user[0].pass, function(err, res) {
      if (res === true && !err) {
        return cb(false, find_user)
      } else {
        return cb(true, false)
      }
    })
  } else {
    return cb(true, false)
  }
}

/**
 * Check if user name is already taken
 */
User.prototype.checkUser = function (user, cb) {
  var find_user = this.db.find(user)
  if (!find_user.length) {
    return cb(false, find_user)
  } else {
    return cb(true, false)
  }
}
/**
 * Hash user password
 */
User.prototype.hashPassword = function (pwd) {
  return bcrypt.hashSync(pwd, 10);
}
/**
 * Signup/Update user
 */
User.prototype.signup = function (user, cb) {
  var self = this
  this.checkUser({user: user.user}, function (err) {
    if (!err) {
      // Insert user in database
      user.pass = self.hashPassword(user.pass)
      self.db.insert(user)
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
  var old_user = this.db.get(user.$loki)
  if (this.hashPassword(user.pass) != old_user.pass) {
    user.pass = this.hashPassword(user.pass)
  }
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

/**
 * Remove User from db
 */
User.prototype.remove = function (id, cb) {
  cb(this.db.remove(id))
}

module.exports = User
