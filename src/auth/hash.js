const crypto = require('crypto')

module.exports = raw => {
  let hash = raw
  for (let i = 0; i < 5; i++) {
    hash = crypto.createHash('sha256')
      .update(hash)
      .digest()
  }
  return hash.toString('base64')
}
