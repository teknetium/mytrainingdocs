module.exports = {
  AUTH0_API_AUDIENCE: "http://localhost:8083/api/", // e.g., 'http://localhost:8083/api/'
  AUTH0_DOMAIN: "mytrainingdocs.auth0.com", // e.g., kmaida.auth0.com
  MONGO_URI: process.env.MONGO_URI || "mongodb://dbuser:New8pass@ds163764.mlab.com:63764/mytrainingdocs",
  NAMESPACE: "https://mytrainingdocs.com/home", // e.g.,
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY || "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",
};
