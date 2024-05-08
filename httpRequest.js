const request = require("request");
const ms = require("ms");

module.exports = (options, time) =>
  new Promise((resolve, reject) => {
    Object.assign(options, {
      timeout: ms(time),
    });

    request(options, (err, response, body) => {
      if (err) {
        reject(err);
      }

      if (response) {
        resolve({
          headers: response.headers || "",
          message: response.statusMessage || "",
          code: response.statusCode || "",
          body: body || null,
        });
        return;
      }

      resolve({
        message: "Something unexpected happend",
        code: 500,
        body: null,
      });
    });
  });
