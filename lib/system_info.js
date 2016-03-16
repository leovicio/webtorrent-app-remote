var prettyBytes = require('pretty-bytes')

var os = require('os')
var storage = require('storage-device-info')

function System_info () {

}

/**
 * Get Server info
 *
 * @param {function} cb
 */

System_info.prototype.serverInfo = function (cb) {
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

  storage.getPartitionSpace('/', function (err, info) {
    if (err) {
      console.log(err)
    }
    os_info.disk_total = info.totalMegaBytes
    os_info.disk_free = info.freeMegaBytes
    os_info.disk_used = os_info.disk_total - os_info.disk_free
    os_info.prc_disk_used = Math.round((((os_info.disk_used * 100) / os_info.disk_total) * 100) / 100)
    os_info.disk_used = prettyBytes(os_info.disk_used * 1000 * 1000)
    os_info.disk_total = prettyBytes(os_info.disk_total * 1000 * 1000)
    cb({
      'os_info': os_info
    })
  })
}

module.exports = System_info
