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

- **inversify-restify-utils** which has a high severity [vulnerability](https://www.npmjs.com/advisories/1171) (Regular Expression Denial of Service) due to a dependency on an older version of restify. This is being tracked in the appropriate github repo with [this issue](https://github.com/inversify/InversifyJS/issues/1158). This vulnerability, which can be resolved by forking the repo, is [documented below](#dependency-workaround).

## Setup

- Initial setup instructions are in the [Helium readme](https://github.com/retaildevcrews/helium)
  - Please complete the setup steps and then continue below

### Using Visual Studio Codespaces

Visual Studio Codespaces is the easiest way to evaluate helium. Follow the setup steps in the [Helium readme](https://github.com/retaildevcrews/helium) to setup Codespaces.

- Open `launch.json` in the `.vscode` directory
- Replace `{your key vault name}` with the name of your key vault
  - the file saves automatically
- Press F5
- Wait for `Debugger attached` in the Debug Console
- Skip to the testing step below

### Using bash shell

> This will work from a terminal in Visual Studio Codespaces as well

```bash

# run the application
# He_Name was set during setup and is your Key Vault name
npm start -- --auth-type CLI --dev --keyvault-name $He_Name

```

wait for `Server is listening on port 4120`

### Testing the application

Open a new bash shell

```bash

# test the application
webv -s localhost:4120 -t 2 -f baseline.json

```

Stop helium by typing Ctrl-C or the stop button if run via F5

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

## CI-CD

This repo uses [GitHub Actions](/.github/workflows/dockerCI.yml) for Continuous Integration.

- CI supports pushing to Azure Container Registry or DockerHub
- The action is setup to execute on a PR or commit to ```master```
  - The action does not run on commits to branches other than ```master```
- The action always publishes an image with the ```:beta``` tag
- If you tag the repo with a version i.e. ```v1.0.8``` the action will also
  - Tag the image with ```:1.0.8```
  - Tag the image with ```:stable```
  - Note that the ```v``` is case sensitive (lower case)

CD is supported via webhooks in Azure App Services connected to the ACR or DockerHub repository.

### Pushing to Azure Container Registry

In order to push to ACR, you must create a Service Principal that has push permissions to the ACR and set the following ```secrets``` in your GitHub repo:

- Azure Login Information
  - TENANT
  - SERVICE_PRINCIPAL
  - SERVICE_PRINCIPAL_SECRET

- ACR Information
  - ACR_REG
  - ACR_REPO
  - ACR_IMAGE

### Pushing to DockerHub

In order to push to DockerHub, you must set the following ```secrets``` in your GitHub repo:

- DOCKER_REPO
- DOCKER_USER
- DOCKER_PAT
  - Personal Access Token

## Run the application locally

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
# for local run, you need to specify CLI authentication type and set the dev flag
# $He_Name is set to the name of your Key Vault

npm start -- --keyvault-name $He_Name --auth-type CLI --dev

# optionally, set the logging level verboseness with --log-level (or -l)
# 'info' is the default
# please type --help for all options

npm start -- --keyvault-name $He_Name --auth-type CLI --log-level info --dev

# alternatively you can set the following environment variables and run without command line args

export KEYVAULT_NAME=$He_Name
export AUTH_TYPE=CLI # requires the dev flag be set
export LOG_LEVEL=info # (optional)


npm start

# test the application
# the application takes about 10 seconds to start
# output should show pass or warn

curl http://localhost:4120/healthz

```

## Dependency workaround

The severe vulnerability introduced through the [inversify-restify-utils](https://github.com/inversify/inversify-restify-utils/), has a PR that updates version of the dependency that fixes the issue, however the repo owner, the only one with permission to publish to the npm registry has been unreachable. The package can be resolved by forking the repo and publishing the code to a package manager.

1. Fork the repo at [inversify-restify-utils](https://github.com/inversify/inversify-restify-utils/)
2. Update the [restify](https://github.com/restify/node-restify) version in the inversify-restify-utils package.json to the latest version. At the time of this README, the latest version is 8.5.1
3. Change the name of the package to avoid conflicts with original inversify-restify-utils package in the npm registry (ex: inversify-restify-utils-{myappname}, where {myappname} is the name of your app)
4. Publish the package to the npm registry using ```npm run publish-please```. Please note, the command will throw an error if there are any vulnerbilies that need to addressed. Review the [.publishrc](https://github.com/inversify/inversify-restify-utils/blob/master/.publishrc) for publish settings
5. Uninstall inversify-restify-utils, and install the new package with ```npm uninstall inversify-restify-utils && install inversify-restify-utils-{myappname} --save```
6. Update the code in this repo where inversify-restify-utils is called to the new package ex: ```import { InversifyRestifyServer } from "inversify-restify-utils";``` to ```import { InversifyRestifyServer } from "inversify-restify-utils-{myappname}";```. Here is a list of files that need to change:
    - HeliumServer.ts
    - server.ts
    - controllers/ActorController.ts
    - controllers/FeaturedController.ts
    - controllers/GenreController.ts
    - controllers/HealthzController.ts
    - controllers/MovieController.ts
    - test/e2e/webv.tests.ts
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
