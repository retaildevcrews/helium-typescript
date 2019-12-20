# [Work in Progress] Build a Docker containerized, secure Node.js Web API application using Managed Identity, Key Vault, and Cosmos DB that is designed to be deployed to Azure App Service or AKS

This sample is a Node.JS REST WebAPI application designed to "fork and code" with the following features:

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
- JQ ([download](https://stedolan.github.io/jq/download/))
- Visual Studio Code (optional) ([download](https://code.visualstudio.com/download))
- TODO: Add other prerequisites for running app

## Setup

- Fork this repo and clone to your local machine
  - All instructions assume starting from the root of the repo

Build the container using Docker

- The unit tests run as part of the Docker build process. You can also run the unit tests manually. (TODO: Create Unit Tests)
- For instructions on building the container with ACR, please see the Helium [readme](https://github.com/retaildevcrews/helium)

```bash

# make sure you are in the root of the repo
# build the image
docker build -t helium-node -f Dockerfile

# Tag and push the image to your Docker repo

```

Run the application locally

- The application requires Key Vault and Cosmos DB to be setup per the Helium [readme](https://github.com/retaildevcrews/helium)

```bash

# make sure you are in the root of the repo

# run the app
npm run build
npm start

# test the application
# the application takes about 10 seconds to start
curl http://localhost:4120/healthz

```

Run the application as a local container instead

```bash

# TODO: Add/create dev dockerfile

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
