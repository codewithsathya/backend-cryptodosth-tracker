const axios = require("axios");
const debug = require('debug')("cryptodosth:testing");

axios.interceptors.response.use(null, (error) => {
  const expectedError =
    error.response &&
    error.response.status >= 400 &&
    error.response.status < 500;
	if(!expectedError) {
		debug("An unexpected error occurred");
	}
	return Promise.reject(error);
});

let http = {
	get: axios.get,
	post: axios.post,
	put: axios.put,
	delete: axios.delete
}

module.exports = http;
