# Managed Identity and Key Vault with Node.js and Restify

> Build a Node.js and Restify Web API application using Managed Identity, Key Vault, and Cosmos DB that is designed to be deployed to Azure App Service or AKS as a Docker container.

![License](https://img.shields.io/badge/license-MIT-green.svg)
![Docker Image Build](https://github.com/retaildevcrews/helium-typescript/workflows/Docker%20Image%20Build/badge.svg)

This is a Node.js and Restify Web API reference application designed to "fork and code" with the following features:

- Securely build, deploy and run an App Service (Web App for Containers) application
- Use Managed Identity to securely access resources
- Securely store secrets in Key Vault
- Securely build and deploy the Docker container from Container Registry
- Connect to and query CosmosDB
- Automatically send telemetry and logs to Azure Monitor

> Instructions for setting up Key Vault, ACR, Azure Monitor and Cosmos DB are in the Helium [readme](https://github.com/retaildevcrews/helium)

## Prerequisites

- Bash shell (tested on Mac, Ubuntu, Windows with WSL2)
  - Will not work with WSL1
  - Will not work in Cloud Shell unless you have a remote dockerd
- Azure CLI ([download](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest))
- Docker CLI ([download](https://docs.docker.com/install/))
- Node.js 12.14.1+ ([download](https://nodejs.org/en/download/))
- npm 6.14.4+ (comes with Node.js)
- Visual Studio Code (optional) ([download](https://code.visualstudio.com/download))

## Package Status

### Dependency Vulnerability
Currently, helium-typescript has a dependency on:

- **inversify-restify-utils** which has a high severity [vulnerability](https://www.npmjs.com/advisories/1171) (Regular Expression Denial of Service) due to a dependency on an older version of restify. This is being tracked in the appropriate github repo with [this issue](https://github.com/inversify/InversifyJS/issues/1158). This vulnerability, which can be resolved by forking the module, is [documented below](#dependency-fix).

- **yargs-parser** which has a low severity [vulnerability](https://www.npmjs.com/advisories/1500) (Prototype Pollution) due to a dependency on the current version of gulp. The npm owner of gulp, the package that introduces the dependency, determined "This 'vulnerability' does not have any attack vector in our software". More on this issue can be [found here](https://github.com/gulpjs/gulp/issues/2438).

## Setup

- Fork this repo and clone to your local machine
  - All instructions assume starting from the root of the repo

### Build the container using Docker

- The unit tests run as part of the Docker build process. You can also run the unit tests manually using `npm test`, with watch using `npm run test:watch`, and with test coverage using `npm run test:coverage`.

- For instructions on building the container with ACR, please see the Helium [readme](https://github.com/retaildevcrews/helium)

```bash

# make sure you are in the root of the repo
# build the image

docker build . -t helium-typescript -f Dockerfile

# note: you may see output like the following, this is expected and safe to ignore
# npm WARN optional SKIPPING OPTIONAL DEPENDENCY: fsevents@2.1.3 (node_modules/chokidar/node_modules/fsevents):
# npm WARN notsup SKIPPING OPTIONAL DEPENDENCY: Unsupported platform for fsevents@2.1.3: wanted {"os":"darwin","arch":"any"} (current: {"os":"linux","arch":"x64"})
# npm WARN optional SKIPPING OPTIONAL DEPENDENCY: fsevents@1.2.13 (node_modules/fsevents):
# npm WARN notsup SKIPPING OPTIONAL DEPENDENCY: Unsupported platform for fsevents@1.2.13: wanted {"os":"darwin","arch":"any"} (current: {"os":"linux","arch":"x64"})


# Tag and push the image to your Docker repo

```

### Run the application locally

- The application requires Key Vault and Cosmos DB to be setup per the Helium [readme](https://github.com/retaildevcrews/helium)
  - You can run the application locally by using Azure CLI cached credentials
    - You must run az login before this will work

```bash

# make sure you are in the root of the repo

# log in with azure credentials (if not done already)

az login

# install modules in package.json file
# note: you may see output like the following, this is expected and safe to ignore
# npm WARN optional SKIPPING OPTIONAL DEPENDENCY: fsevents@2.1.3 (node_modules/chokidar/node_modules/fsevents):
# npm WARN notsup SKIPPING OPTIONAL DEPENDENCY: Unsupported platform for fsevents@2.1.3: wanted {"os":"darwin","arch":"any"} (current: {"os":"linux","arch":"x64"})
# npm WARN optional SKIPPING OPTIONAL DEPENDENCY: fsevents@1.2.13 (node_modules/fsevents):
# npm WARN notsup SKIPPING OPTIONAL DEPENDENCY: Unsupported platform for fsevents@1.2.13: wanted {"os":"darwin","arch":"any"} (current: {"os":"linux","arch":"x64"})

npm install

# build the app

npm run build

# run the app with command line args
# for local run, you need to specify CLI authentication type
# $He_Name is set to the name of your Key Vault

npm start -- --keyvault-name $He_Name --auth-type CLI

# optionally, set the logging level verboseness with --log-level (or -l)
# 'info' is the default
# please type --help for all options

npm start -- --keyvault-name $He_Name --auth-type CLI --log-level info

# alternatively you can set the following environment variables and run without command line args

export KEYVAULT_NAME=$He_Name
export AUTH_TYPE=CLI
export LOG_LEVEL=info # (optional)

npm start

# test the application
# the application takes about 10 seconds to start
# output should show pass or warn

curl http://localhost:4120/healthz

```

## Dependency Fix

The severe vulnerability introduced through the [inversify-restify-utils](https://github.com/inversify/inversify-restify-utils/) package can be resolved by forking the code and publishing the code to a package manager such as npm.

1. Fork the code at [inversify-restify-utils](https://github.com/inversify/inversify-restify-utils/)
2. Update the [restify](https://github.com/restify/node-restify) version in package.json to the latest version. At the time of this README, the latest version is 8.5.1
3. Rename the package if the intention is to publish to the npm registry
4. Publish the package using ```npm run publish-please```. Please note, the command will throw an error if there are any vulnerbilies that need to addressed. Review the [.publishrc](https://github.com/inversify/inversify-restify-utils/blob/master/.publishrc) for publish settings
5. Uninstall inversify-restify-utils, and install the new package.
6. Update the code where inversify-restify-utils is called to the new package if there is a name change
7. Run ```npm run build``` to rebuild the code base

## Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit [Microsoft Contributor License Agreement](https://cla.opensource.microsoft.com).

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
