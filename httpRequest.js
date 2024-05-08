const request = require('request')
const ms = require('ms')

module.exports = (options, time) =>
  new Promise((resolve, reject) => {
    Object.assign(options, {
      timeout: ms(time),
    })
    Object.assign(options.headers, {
      'User-Agent':
        'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:56.0) Gecko/20100101 Firefox/56.0',
    })

    request(options, (err, response, body) => {
      if (err) {
        reject(err)
      }

      if (response) {
        resolve({
          headers: response.headers || '',
          message: response.statusMessage || '',
          code: response.statusCode || '',
          body: body || null,
        })
        return
      }

      resolve({
        message: 'Something unexpected happend',
        code: 500,
        body: null,
      })
    })
  })