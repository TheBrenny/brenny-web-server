require("./util_and_polyfill"); // only needs to be called once for the app!
require('dotenv').config();

const config = require("./config");
const serverInfo = config.serverInfo;

// Express related stuff
const path = require('path');
const express = require('express');
const scetch = require('scetch')();
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');

// Make the app
let app = express();
app.use(morgan('common', config.morgan));
app.use(helmet(config.helmet));
app.use(cors());
app.use(express.json());

let public = path.join(__dirname, "app", "public");

app.set('views', path.join(public, 'views'));
app.engine('sce', scetch.engine);
app.set('view engine', 'sce');

app.use("/assets", express.static(path.join(public, "assets")));
// app.use('/api', require('./app/api/routes'));
app.use(require('./app-vanilla/public/routes'));
app.use(require('./app-vanilla/errorRouter'));
app.use(require('./app-vanilla/errorRouter').handler);

app.listen(serverInfo.port, serverInfo.host, () => {
    if (process.env.NODE_ENV === 'dev' && process.env.GUPLING == 'true') serverInfo.port = 81;
    console.log(`Server is listening at http://${serverInfo.host}:${serverInfo.port}...`);
});