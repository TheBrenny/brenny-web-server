require("dotenv").config();
const forceDev = false;

module.exports = {};

module.exports.db = {
    url: tryNew(URL, process.env.MYSQL_URL) || ""
};

module.exports.session = {
    secret: process.env.SESSION_SECRET || "secret",
    cookieName: process.env.SESSION_COOKIE || "session",
};

module.exports.env = {
    node: process.env.NODE_ENV || "production",
    isDev: forceDev
};
module.exports.env.isDev = module.exports.env.node.startsWith("dev") || forceDev;

module.exports.helmet = {
    contentSecurityPolicy: {
        useDefaults: true,
        directives: {
            defaultSrc: ["'self'", "http:"],
            scriptSrc: [
                "'self'",
                // add any extra sources here!
                module.exports.env.isDev ? `'nonce-browsersync'` : "",
                (req, res) => `'nonce-${res.locals.nonce}'`,
            ],
            workerSrc: ["'self'", "blob:"],
            upgradeInsecureRequests: null
        }
    }
};

module.exports.morgan = {
    stream: process.stdout
};

module.exports.serverInfo = {
    host: process.env.HOST,
    port: parseInt(process.env.PORT || 80)
};

function tryDo(fn, param, thisArg) {
    try {
        if(!!param) return fn.call(thisArg, param);
    } catch(e) {}
    return false;
}

function tryNew(clazz, param) {
    try {
        if(!!param) return new clazz(param);
    } catch(e) {}
    return false;
}

function tryRequire(module) {
    try {
        return require(module);
    } catch(e) {}
    return {};
}