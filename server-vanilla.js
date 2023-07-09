require('dotenv').config();

const http = require("http");
const router = require("./app/router");
const logRequest = require("./app/logRequest");
const redirector = require("./app/redirector");
const apiRoutes = require("./app/api/routes");
const publicRoutes = require("./app/public/routes");
const serverInfo = {
    host: "hostman",
    port: 80
};

router.register(redirector);
router.register(apiRoutes);
router.register(publicRoutes);

const server = http.createServer((req, res) => {
    logRequest(req, res);
    (async function () {
        await router(req, res);
        await router[404](req, res);
    })();
});

let fnArgs = [serverInfo.port];
if(!!serverInfo.host) fnArgs.push(serverInfo.host);
fnArgs.push(() => {
    if(config.env.isDev) console.log(`Browsersync might be listening at http://${serverInfo.host}:${serverInfo.port + 1}`);
    console.log(`Server is listening at http://${serverInfo.host}:${serverInfo.port}`);
})

server.listen.apply(app, fnArgs);