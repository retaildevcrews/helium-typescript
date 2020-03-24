import { exec } from "child_process";

process.env.KeyVaultName = "cfhe";
process.env.AUTH_TYPE = "CLI";

import { HeliumServer } from "../src/server";

const server = new HeliumServer();

describe("Web Validate", async () => {
    server.initialize();
    // this test requires that you have the helium/webvalidate project in a directory next to helium-typescript
    it("Run webv against the running server", () => {
        const URL = "localhost:4120";
        const FILES = "node.json baseline.json bad.json";

        console.log("executing...");
        exec(`dotnet run  -- --host ${URL} --files ${FILES}`, {
            cwd: "../webvalidate/src/app"
        }, (err, stdout, stderr) => {
            console.log("Finished with webv test run");
            if (err) console.error(`Error running webv: ${err}`);
            console.log(`stdout: ${stdout}`);
            server.stop();
        });
    })
});
