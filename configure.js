const path = require("path");
const fs = require("fs");
const cp = require("child_process");

if(process.argv.length < 3) {
    printUsage();
    process.exit(1);
    return;
}

const types = ["vanilla", "express"];
const type = process.argv[2];

if(types.includes(type) === false) {
    console.log("Invalid type: " + type);
    printUsage();
    process.exit(2);
    return;
}

const pwd = fs.realpathSync(path.resolve(__dirname, "."));
fs.renameSync(path.join(pwd, `package-${type}.json`), path.join(pwd, "package.json"));
fs.renameSync(path.join(pwd, `app-${type}`), path.join(pwd, "app"));
fs.renameSync(path.join(pwd, `server-${type}.js`), path.join(pwd, "server"));

let rmFiles = [
    "package-#.json",
    "app-#/",
    "server-#.js",
];

types.forEach(t => {
    rmFiles.forEach(f => {
        f = f.replace("#", t);
        try {
            fs.rmSync(path.join(pwd, f), {recursive: true, force: true});
        } catch(e) {
            console.warn(`Failed to remove ${f}. Do this manually.`);
        }
    });
});

cp.spawnSync("npm", ["update", "--save-dev"], {stdio: "inherit"});
cp.spawnSync("npm", ["install", "--save-dev"], {stdio: "inherit"});

console.log("Done.");

function printUsage() {
    console.log(`Usage: node configure.js <${types.join("|")}>`);
}