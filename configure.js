const path = require("path");
const fs = require("fs");
const cp = require("child_process");
const types = ["vanilla", "express"];
let npm = "npm";

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

if(process.argv.includes("--use-pnpm")) npm = "pnpm";

console.log("Cheers for choosing BWS! - Making server: " + type);
let startTime = performance.now();

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
            process.stderr.write(`\x1b[31mError!\n    ! Failed to remove ${f}. Do this manually.\x1b[0m\n`);
            lineCount += 1; // bc we print on a new line!
        }
        lineCount += 1; // bc we're adding a line anyway
    });
});
process.stdout.write(`\x1b[${lineSize}C\x1b[${lineCount}A`);
process.stdout.write(done());
process.stdout.write(`\x1b[${lineSize+5}D\x1b[${lineCount}B`); // +5 == "Done!".length

Promise.resolve()
    .then(() => new Promise((resolve, reject) => {
        process.stdout.write(`> Installing dependencies...`);
        let proc = cp.spawn(npm, ["install", "--save", "--save-dev"], {
            shell: true,
            windowsHide: true,
        });
        //proc.stdout.on("data", data => console.log(data.toString()));
        //proc.stderr.on("data", data => console.log(data.toString()));
        proc.on("close", code => {
            //console.log("npm finished with code " + code);
            if(code === 0) {
                process.stdout.write(`${done()}\n`);
                resolve();
            } else {
                process.stderr.write(`\x1b[31mError!\n  ! Failed to install dependencies - run '${npm} i' and diagnose.\n  ! Proceeding anyway...\x1b[0m\n`);
                reject(code);
            }
        });
    }))
    .then(() => new Promise((resolve, reject) => {
        process.stdout.write(`> Updating dependencies to the latest versions...`);
        let proc = cp.spawn(npm, ["update", "--save", "--save-dev"], {
            shell: true,
            windowsHide: true,
        });
        //proc.stdout.on("data", data => console.log(data.toString()));
        //proc.stderr.on("data", data => console.log(data.toString()));
        proc.on("close", code => {
            //console.log("npm finished with code " + code);
            if(code === 0) {
                process.stdout.write(`${done()}\n`);
                resolve();
            } else {
                process.stderr.write(`\x1b[31mError!\n  ! Failed to update dependencies - run '${npm} i' and diagnose.\n  ! Proceeding anyway...\x1b[0m\n`);
                reject(code);
            }
        });
    }))
    .then(() => {
        process.stdout.write(`> Deleting configure script...`);
        fs.rmSync(path.join(pwd, "configure.js"), {recursive: true, force: true});
        process.stdout.write(`${done()}\n`);
    })
    .then(() => {
        process.stdout.write(`> Deleting git remote reference...`);
        process.stdout.write(`Coming Soon!\n`);
    })
    .then(() => {
        process.stdout.write(`\x1b[32mAll done!\x1b[0m\n`);
    });

function printUsage() {
    console.log(`Usage: node configure.js <${types.join("|")}>`);
}
function done() {
    return "\x1b[32mDone!\x1b[0m";
}
