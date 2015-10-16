var prettyBytes = require('pretty-bytes')

var os = require('os')
var disk = require('diskusage')

function System () {

}

/**
 * Get Server info
 *
 * @param {function} cb
 */

System.prototype.serverInfo = function (cb) {

  var os_info = {}
  os_info.load_avg = os.loadavg()
  for (var l in os_info.load_avg) {
    os_info.load_avg[l] = Math.round(os_info.load_avg[l] * 100) / 100
  }
  os_info.totalmem = os.totalmem()
  os_info.freemem = os.freemem()
  os_info.mem_used = os_info.totalmem - os_info.freemem
  os_info.prc_mem_used = Math.round((((os_info.mem_used * 100) / os_info.totalmem) * 100) / 100)
  os_info.totalmem = prettyBytes(os_info.totalmem)
  os_info.memused = prettyBytes(os_info.mem_used)

  disk.check('/', function (err, info) {
    if (err) {
      console.log(err)
    }
    os_info.disk_total = info.total
    os_info.disk_free = info.free
    os_info.disk_used = info.total - info.free
    os_info.prc_disk_used = Math.round((((os_info.disk_used * 100) / os_info.disk_total) * 100) / 100)
    os_info.disk_used = prettyBytes(os_info.disk_used)
    os_info.disk_total = prettyBytes(os_info.disk_total)
    cb({
      'os_info': os_info
    })
  })
}

module.exports = System
