const path = require("path");
const fs = require("fs");
const cp = require("child_process");
const types = ["vanilla", "express"];

if(process.argv.length < 3) {
    printUsage();
    process.exit(1);
    return;
}

const type = process.argv[2];

if(types.includes(type) === false) {
    console.log("Invalid type: " + type);
    printUsage();
    process.exit(2);
    return;
}

console.log("Cheers for choosing BWS! - Making server: " + type);
let startTime = performance.now();

process.stdout.write("> Renaming files and folders...");
const pwd = fs.realpathSync(path.resolve(__dirname, "."));
fs.renameSync(path.join(pwd, `package-${type}.json`), path.join(pwd, "package.json"));
fs.renameSync(path.join(pwd, `app-${type}`), path.join(pwd, "app"));
fs.renameSync(path.join(pwd, `server-${type}.js`), path.join(pwd, "server.js"));
process.stdout.write("Done!\n");

process.stdout.write("> Removing redundant files and folders...\0337\n");
let rmFiles = [
    "package-#.json",
    "app-#/",
    "server-#.js",
];
let lineCount = 0;
types.forEach(t => {
    rmFiles.forEach(f => {
        f = f.replace("#", t);
        try {
            process.stdout.write(`  > Removing ${f}... `);
            fs.rmSync(path.join(pwd, f), {recursive: true, force: true});
            process.stdout.write(`Done!\n`);
        } catch(e) {
            process.stderr.write(`\033[31mError!\n    ! Failed to remove ${f}. Do this manually.\033[0m\n`);
            lineCount += 1; // bc we print on a new line!
        }
        lineCount += 1; // bc we're adding a line anyway
    });
});
process.stdout.write(`\0338\033[${lineCount}ADone!\033[${lineCount}B\033[0G`);

Promise.resolve()
    .then(() => new Promise((resolve, reject) => {
        process.stdout.write(`> Installing dependencies... `);
        let proc = cp.spawn("npm", ["install", "--save", "--save-dev"], {
            shell: true,
            windowsHide: true,
        });
        //proc.stdout.on("data", data => console.log(data.toString()));
        //proc.stderr.on("data", data => console.log(data.toString()));
        proc.on("close", code => {
            //console.log("npm finished with code " + code);
            if(code === 0) {
                process.stdout.write(`Done!\n`);
                resolve();
            } else {
                process.stderr.write(`\033[31mError!\n  ! Failed to install dependencies - run 'npm i' and diagnose.\n  ! Proceeding anyway...\033[0m\n`);
                reject(code);
            }
        });
    }))
    .then(() => new Promise((resolve, reject) => {
        process.stdout.write(`> Updating dependencies to the latest versions... `);
        let proc = cp.spawn("npm", ["update", "--save", "--save-dev"], {
            shell: true,
            windowsHide: true,
        });
        //proc.stdout.on("data", data => console.log(data.toString()));
        //proc.stderr.on("data", data => console.log(data.toString()));
        proc.on("close", code => {
            //console.log("npm finished with code " + code);
            if(code === 0) {
                process.stdout.write(`Done!\n`);
                resolve();
            } else {
                process.stderr.write(`\033[31mError!\n  ! Failed to update dependencies - run 'npm i' and diagnose.\n  ! Proceeding anyway...\033[0m\n`);
                reject(code);
            }
        });
    }))
    .then(() => {
        process.stdout.write(`> Deleting configure script...`);
        fs.rmSync(path.join(pwd, "configure.js"), {recursive: true, force: true});
        process.stdout.write(`Done!\n`);
    })
    .then(() => {
        process.stdout.write(`> Deleting git remote reference...`);
        process.stdout.write(`Coming Soon!\n`);
    })
    .then(() => {
        process.stdout.write(`All done!\n`);
    });

function printUsage() {
    console.log(`Usage: node configure.js <${types.join("|")}>`);
}
