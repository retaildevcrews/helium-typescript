// import { exec } from "child_process";

process.env.KeyVaultName = "cfhe";
process.env.AUTH_TYPE = "CLI";

import { HeliumServer } from "../src/server";

const server = new HeliumServer();

describe("Web Validate", async () => {
    await server.initialize();
    // this test requires that you have the helium/webvalidate project in a directory next to helium-typescript
    // it("Run webv against the running server", () => {
    //     const URL = "localhost:4120";
    //     const FILES = "node.json baseline.json and bad.json";
    //     // assert.isTrue(true);
    //     console.log("executing...");
    //     exec(`dotnet run  -- --host ${URL} --files ${FILES}`, {
    //         cwd: "../webvalidate/src/app"
    //     }, (err, stdout, stderr) => {
    //         if (err) console.error(err);
    //         console.log(`stdout: ${stdout}`);
    //     });
    // })
    server.stop();
});
