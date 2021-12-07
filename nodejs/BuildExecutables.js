const {
    compile
} = require("nexe");
const os = require("os");




switch (os.platform()) {
    case "win32":
        compile({
            input: "./main.js",
            targets: "windows-x64-16.13.0",
            build: true,
            output: "./build/windows/salt.exe"
        }).then(() => {
            console.log("Windows Success");
        });
        break;

    case "linux":
        compile({
            input: "./main.js",
            targets: "linux-x64-16.13.0",
            build: true,
            output: "./build/linux/salt"
        }).then(() => {
            console.log("Linux Success");
        });
        break;

    case "darwin":
        compile({
            input: "./main.js",
            targets: "mac-x64-16.13.0",
            build: true,
            output: "./build/macos/salt"
        }).then(() => {
            console.log("MacOS Success");
        });
        break;
    default:
        break;
}