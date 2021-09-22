const router = require("express").Router();
const checks = require("./tools/checks");
const session = require("./tools/session");
const api = require("./api/public");

// Put the session's account into the response object 
router.use((req, res, next) => {
    // Don't abort if something breaks!
    try {
        let s = session(req);
        res.locals.user = s.getAccount();
    } catch(err) {}

    next();
});

// This is the home route
router.get(["/", "/home"], (req, res) => {
    const time = api.getTime();
    res.format({
        html: () => {
            res.render("home", {
                time: time,
            });
        },
        json: () => {
            res.json({
                success: true,
                message: "Home route. The time is " + time
            });
        }
    });
});

module.exports = router;