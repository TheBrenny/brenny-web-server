const path = require("path");
const fs = require("fs");
const cp = require("child_process");
const types = ["vanilla", "express"];
const times = [];

if(process.argv.length < 3) {
    printUsage();
    process.exit(1);
}

const type = process.argv[2];

if(types.includes(type) === false) {
    console.log("Invalid type: " + type);
    printUsage();
    process.exit(2);
}

let npm = "npm";
if(process.argv.includes("--use-pnpm")) npm = "pnpm";

console.log("Cheers for choosing BWS! - Making server: " + type);
time(); // Start the timer

process.stdout.write("> Renaming files and folders...");
const pwd = fs.realpathSync(path.resolve(__dirname, "."));
fs.renameSync(path.join(pwd, `package-${type}.json`), path.join(pwd, "package.json"));
fs.renameSync(path.join(pwd, `app-${type}`), path.join(pwd, "app"));
fs.renameSync(path.join(pwd, `server-${type}.js`), path.join(pwd, "server.js"));
process.stdout.write(done() + "\n");

let lineSize = "> Removing redundant files and folders...".length;
process.stdout.write("> Removing redundant files and folders...\n");
let rmFiles = [
    "package-#.json",
    "app-#/",
    "server-#.js",
];
let lineCount = 1;
types.forEach(t => {
    rmFiles.forEach(f => {
        f = f.replace("#", t);
        try {
            process.stdout.write(`  > Removing ${f}...`);
            fs.rmSync(path.join(pwd, f), {recursive: true, force: true});
            process.stdout.write(`${done()}\n`);
        } catch(e) {
            process.stderr.write(error(`Failed to remove ${f}. Do this manually.`, false));
            lineCount += 1; // bc we print a message on a new line!
        }
        lineCount += 1; // bc we're adding a line anyway
    });
});
// Move back to the end of the first line
process.stdout.write(`\x1b[${lineSize}C\x1b[${lineCount}A`);
let d = done(rmFiles.length * types.length)
process.stdout.write(d);
process.stdout.write(`\x1b[${lineSize + d.length}D\x1b[${lineCount}B`); // +5 == "Done!".length

Promise.resolve()
    .then(() => new Promise((resolve, reject) => {
        process.stdout.write(`> Installing dependencies...`);
        let proc = cp.spawn(npm, ["install", "-P", "-D"], {
            shell: true,
            windowsHide: true,
        });
        proc.on("close", code => {
            if(code === 0) {
                process.stdout.write(`${done()}\n`);
                resolve();
            } else {
                process.stderr.write(error(`Failed to install dependencies - run '${npm} i' and diagnose.`, true));
                reject(code);
            }
        });
    }))
    .then(() => new Promise((resolve, reject) => {
        process.stdout.write(`> Updating dependencies to the latest versions...`);
        let proc = cp.spawn(npm, ["update", "-P", "-D"], {
            shell: true,
            windowsHide: true,
        });
        proc.on("close", code => {
            if(code === 0) {
                process.stdout.write(`${done()}\n`);
                resolve();
            } else {
                process.stderr.write(error(`Failed to update dependencies - run '${npm} update' and diagnose.`, true));
                reject(code);
            }
        });
    }))
    .then(() => {
        process.stdout.write(`> Deleting configure script...`);
        fs.rmSync(path.join(pwd, "configure.js"), {recursive: true, force: true});
        process.stdout.write(`${done()}\n`);
    })
    .then(() => new Promise((resolve, reject) => {
        process.stdout.write(`> Deleting git remote reference...`);
        let proc = cp.spawn("git", ["remote", "remove", "origin"], {
            shell: true,
            windowsHide: true,
        });
        proc.on("close", code => {
            if(code === 0) {
                process.stdout.write(`${done()}\n`);
                resolve();
            } else {
                process.stderr.write(error(`Failed to delete remote reference - run 'git remote remove origin' and diagnose.`));
                resolve();
            }
        });
    }))
    .then(() => new Promise((resolve, reject) => {
        process.stdout.write(`> Initialising git submodules...`);
        let proc = cp.spawn("git submodule update --init --recurse", {
            shell: true,
            windowsHide: true,
        });
        proc.on("close", code => {
            if(code === 0) {
                process.stdout.write(`${done()}\n`);
                resolve();
            } else {
                process.stderr.write(error(`Failed to initialise submodules - run 'git submodule init && git submodule update' and diagnose.`));
                resolve();
            }
        });
    }))
    .then(() => {
        let total = prettyTime(time(-1));
        process.stdout.write(`\x1b[32mAll done in ${total}!\x1b[0m\n`);
    });

function printUsage() {
    console.log(`Usage: node configure.js <${types.join("|")}> [--use-pnpm]`);
}

function prettyTime(time) {
    let ms = time % 1000;
    time = (time - ms) / 1000;
    let s = time % 60;
    time = (time - s) / 60;
    let m = time % 60;
    time = (time - m) / 60;
    let h = time;

    let builder = "";
    if(h > 0) builder += `${h}h `;
    if(m > 0) builder += `${m}m `;
    if(s > 0) builder += `${s}s `;
    if(ms > 0) builder += `${Math.round(ms)}ms`;

    return builder.trim();
}
function time(furtherBack = 0) {
    let now = performance.now();
    times.push(now);
    let diff = now - times[0];
    if(furtherBack !== -1) diff = times.length >= 2 + furtherBack ? now - times[times.length - (2 + furtherBack)] : 0;
    return diff;
}
function done(furtherBack) {
    let timeTaken = prettyTime(time(furtherBack));
    return `  \x1b[32mDone in ${timeTaken}!\x1b[0m`;
}
function error(message, breaking) {
    let timeTaken = prettyTime(time());
    return `  \x1b[31mError in ${timeTaken}!\n  ! ${message}${!!breaking ? "\n  ! Breaking..." : ""}\x1b[0m\n`;
}
