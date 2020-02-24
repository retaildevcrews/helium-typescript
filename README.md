# [Work in Progress] Build a Docker containerized, secure Node.js Web API application using Managed Identity, Key Vault, and Cosmos DB that is designed to be deployed to Azure App Service or AKS

This is a Node.JS REST WebAPI reference application designed to "fork and code" with the following features:

- Securely build, deploy and run an App Service (Web App for Containers) application
- Use Managed Identity to securely access resources
- Securely store secrets in Key Vault
- Securely build and deploy the Docker container from Container Registry or Azure DevOps
- Connect to and query CosmosDB
- Automatically send telemetry and logs to Azure Monitor
- Instructions for setting up Key Vault, ACR, Azure Monitor and Cosmos DB are in the Helium [readme](https://github.com/retaildevcrews/helium)

## Prerequisites

- Azure CLI 2.0.72+ ([download](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest))
- Docker CLI ([download](https://docs.docker.com/install/))
- Node.js 12.14.1+ ([download](https://nodejs.org/en/download/))
- npm 6.14.4+ (comes with Node.js)
- JQ ([download](https://stedolan.github.io/jq/download/))
- Visual Studio Code (optional) ([download](https://code.visualstudio.com/download))

## Package Status

### Dependency Vulnerability

Currently, helium-typescript has a dependncy on inversify-restify-utils which has a [vulnerability](https://www.npmjs.com/advisories/1171) (Regular Expression Denial of Service) due to a dependency on an older version of restify. This is being tracked in the appropriate github repo with [this issue](https://github.com/inversify/InversifyJS/issues/1158).

### Warnings

There is a known dependency on deprecated @opentelemetry/types package. This is due to a dependency on a few Azure SDK packages, tracked by [this issue](https://github.com/Azure/azure-sdk-for-js/issues/7079).

- npm WARN deprecated @opentelemetry/types@0.2.0: Package renamed to @opentelemetry/api, see [description](https://github.com/open-telemetry/opentelemetry-js)

There is a known dependency on deprecated request@2.88.2. This is due to dependencies on jsdom and adal-node. This is tracked by [jsdom issue](https://github.com/jsdom/jsdom/issues/2792) and [adal issue](https://github.com/AzureAD/azure-activedirectory-library-for-nodejs/issues/229).  Adal-node should be updated to msal, tracking this with [ms-node-auth issue](https://github.com/Azure/ms-rest-nodeauth/issues/84).

- npm WARN deprecated request@2.88.2: request has been deprecated, see [description](https://github.com/request/request/issues/3142)

There is a known warning for a peer dependency on canvas.  However, the reported work-arounds online introduce a lot of different, additional errors.  Tracked by [issue/PR](https://github.com/node-gfx/node-canvas-prebuilt/pull/80). For now, this does not affect app behavior.

- npm WARN jsdom@15.2.1 requires a peer of canvas@^2.5.0 but none is installed. You must install peer dependencies yourself.

## Setup

- Fork this repo and clone to your local machine
  - All instructions assume starting from the root of the repo

Build the container using Docker

- The unit tests run as part of the Docker build process. You can also run the unit tests manually.

```bash

npm run test-unit

```

- For instructions on building the container with ACR, please see the Helium [readme](https://github.com/retaildevcrews/helium)

```bash

# make sure you are in the root of the repo
# build the image
docker build -t helium-typescript -f Dockerfile .

# note: you may see output like the following, this is expected and safe to ignore
# npm WARN optional SKIPPING OPTIONAL DEPENDENCY: fsevents@2.1.2 (node_modules/mocha/node_modules/fsevents):
# npm WARN notsup SKIPPING OPTIONAL DEPENDENCY: Unsupported platform for fsevents@2.1.2: wanted {"os":"darwin","arch":"any"} (current: {"os":"linux","arch":"x64"})

# Tag and push the image to your Docker repo

```

Run the application locally

- The application requires Key Vault and Cosmos DB to be setup per the Helium [readme](https://github.com/retaildevcrews/helium)

```bash

# make sure you are in the root of the repo

# set required keyvaultname environment variable
export KeyVaultName={name of your key vault}

# log in with azure credentials (if not done already)
az login

# install modules in package.json file
# note: you may see output like the following, this is expected and safe to ignore
# npm WARN optional SKIPPING OPTIONAL DEPENDENCY: fsevents@2.1.2 (node_modules/mocha/node_modules/fsevents):
# npm WARN notsup SKIPPING OPTIONAL DEPENDENCY: Unsupported platform for fsevents@2.1.2: wanted {"os":"darwin","arch":"any"} (current: {"os":"linux","arch":"x64"})
npm install

# run the app
npm run build
npm start

# test the application
# the application takes about 10 seconds to start
curl http://localhost:4120/healthz

```

Run the application as a local container instead

```bash

# make sure you are in the root of the repo
# docker-dev builds an alpine image with Azure CLI installed in the container
docker build -t helium-dev -f Dockerfile-Dev .

# run the container
# mount your ~/.azure directory to container root/.azure directory
# you can also run the container and run az login from a bash shell
# $He_Name is set to the name of your key vault
docker run -d -p 4120:4120 -e KeyVaultName=$He_Name --name helium-dev -v ~/.azure:/root/.azure helium-dev "npm" "start"

# check the logs
# re-run until the application started message appears
docker logs helium-dev

# curl the health check endpoint
curl http://localhost:4120/healthz

# Stop and remove the container
docker stop helium-dev
docker rm helium-dev

```

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
