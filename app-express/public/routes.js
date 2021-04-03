
const express = require('express');
const router = express.Router();
const nodeFetch = require("node-fetch");

function fetchAPI(req, path) {
    let target = req.protocol + "://" + req.hostname + "/api" + path;
    return nodeFetch(target, {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }).then(r => r.json());
}

function getPageData(req, _) {
    let part = req.url.substring(1);
    let nextSlash = part.indexOf("/");
    if (nextSlash >= 0) part = part.substring(0, nextSlash);

    return {
        page: part
    };
}

// ====== HOME ======

router.get(['/', '/home'], (req, res) => {
    res.render('home', {
        ...getPageData(req, res),
    });
});


module.exports = router;