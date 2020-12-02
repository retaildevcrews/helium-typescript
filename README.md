# Managed Identity and Key Vault with Node.js and Restify

> Build a Node.js and Restify Web API application using Managed Identity, Key Vault, and Cosmos DB that is designed to be deployed to Azure App Service or AKS as a Docker container.

![License](https://img.shields.io/badge/license-MIT-green.svg)
![Docker Image Build](https://github.com/retaildevcrews/helium-typescript/workflows/Docker%20Image%20Build/badge.svg)

This is a Node.js and Restify Web API reference application designed to "fork and code" with the following features:

- Securely build, deploy and run an Azure App Service (Web App for Containers) application
- Securely build, deploy and run an Azure Kubernetes Service (AKS) application
- Use Managed Identity to securely access resources
- Securely store secrets in Key Vault
- Securely build and deploy the Docker container to Azure Container Registry (ACR) or Docker Hub
- Connect to and query Cosmos DB
- Automatically send telemetry and logs to Azure Monitor

> Visual Studio Codespaces is the easiest way to evaluate helium as all of the prerequisites are automatically installed
>
> Follow the setup steps in the [Helium readme](https://github.com/retaildevcrews/helium) to setup Codespaces

## Prerequisites

- Bash shell (tested on Visual Studio Codespaces, Mac, Ubuntu, Windows with WSL2)
  - Will not work with WSL1 or Cloud Shell
- Azure CLI ([download](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest))
- Docker CLI ([download](https://docs.docker.com/install/))
- Node.js 12.14.1+ ([download](https://nodejs.org/en/download/))
- npm 6.14.4+ (comes with Node.js)
- Visual Studio Code (optional) ([download](https://code.visualstudio.com/download))

## Setup

- Initial setup instructions are in the [Helium readme](https://github.com/retaildevcrews/helium)
  - Please complete the setup steps and then continue below

### Validate az CLI works

> In Visual Studio Codespaces, open a terminal by pressing ctl + `

```bash

# make sure you are logged into Azure
az account show

# if not, log in
az login

```

### Verify Key Vault Access

```bash

# verify you have access to Key Vault
az keyvault secret show --name CosmosDatabase --vault-name $He_Name

```

### Using Visual Studio Codespaces

- Open `launch.json` in the `.vscode` directory
- Replace `{your key vault name}` with the name of your key vault
  - the file saves automatically
- Press F5
- Wait for `Debugger attached` in the Debug Console
- Skip to the testing step below

### Using bash shell

> This will work from a terminal in Visual Studio Codespaces as well

```bash

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

npm start -- --dev

```

wait for `Server is listening on port 4120`

### Testing the application

Open a new bash shell

> Visual Studio Codespaces allows you to open multiple shells by clicking on the `Split Terminal` icon

```bash

# test the application

# test using httpie (installed automatically in Codespaces)
http localhost:4120/version

# test using curl
curl localhost:4120/version

```

Stop helium by typing Ctrl-C or the stop button if run via F5

### Deep Testing

We use [Web Validate](https://github.com/microsoft/webvalidate) to run deep verification tests on the Web API

If you have dotnet core sdk installed

```bash

# install Web Validate as a dotnet global tool
# this is automatically installed in CodeSpaces
dotnet tool install -g webvalidate

# make sure you are in the root of the repository

# run the validation tests
# validation tests are located in the TestFiles directory
cd TestFiles

webv -s localhost:4120 -f baseline.json

# there may be a validation error on the /healthz/ietf endpoint test
#   json: status: warn : Expected: pass
# the "warn" status indicates a slower than normal response time
# this is OK and will occasionally occur

# bad.json tests error conditions that return 4xx codes

# benchmark.json is a 300 request test that covers the entire API

# cd to root of repo
cd ..

```

Test using Docker image

```bash

# make sure you are in the root of the repository

# run the validation tests
# mount the local TestFiles directory to /app/TestFiles in the container
# 172.17.0.1 is the docker host IP
docker run -it --rm -v TestFiles:/app/TestFiles retaildevcrew/webvalidate -s http://172.17.0.1:4120 -f baseline.json

# there may be a validation error on the /healthz/ietf endpoint test
#   json: status: warn : Expected: pass
# the "warn" status indicates a slower than normal response time
# this is OK and will occasionally occur

# bad.json tests error conditions that return 4xx codes

# benchmark.json is a 300 request test that covers the entire API

```

## Build the release container using Docker

> A release build requires MI to connect to Key Vault.

- The unit tests run as part of the Docker build process. You can also run the unit tests manually using `npm test`, with watch using `npm run test:watch`, and with test coverage using `npm run test:coverage`.

```bash

# make sure you are in the root of the repo
# build the image

docker build . -t helium-typescript

# note: you may see output like the following, this is expected and safe to ignore
# npm WARN optional SKIPPING OPTIONAL DEPENDENCY: fsevents@2.1.3 (node_modules/chokidar/node_modules/fsevents):
# npm WARN notsup SKIPPING OPTIONAL DEPENDENCY: Unsupported platform for fsevents@2.1.3: wanted {"os":"darwin","arch":"any"} (current: {"os":"linux","arch":"x64"})
# npm WARN optional SKIPPING OPTIONAL DEPENDENCY: fsevents@1.2.13 (node_modules/fsevents):
# npm WARN notsup SKIPPING OPTIONAL DEPENDENCY: Unsupported platform for fsevents@1.2.13: wanted {"os":"darwin","arch":"any"} (current: {"os":"linux","arch":"x64"})


# Tag and push the image to your Docker repo

```

## CI-CD

> Make sure to fork the repo before experimenting with CI-CD

This repo uses [GitHub Actions](.github/workflows/dockerCI.yaml) for Continuous Integration.

- CI supports pushing to Azure Container Registry or DockerHub
- The action is setup to execute on a PR or commit to ```master```
  - The action does not run on commits to branches other than ```master```
- The action always publishes an image with the ```:beta``` tag
- If you tag the repo with a version i.e. ```v1.0.8``` the action will also
  - Tag the image with ```:1.0.8```
  - Tag the image with ```:stable```
  - Note that the ```v``` is case sensitive (lower case)
- Once the `secrets` below are set, create a new branch, make a change to a file (md file changes are ignored), commit and push your change, create a PR into your local master
- Check the `Actions` tab on the GitHub repo main page

CD is supported via webhooks in Azure App Services connected to the ACR or DockerHub repository.

### CI to Azure Container Registry

In order to push to ACR, you set the following `secrets` in your GitHub repo:

- Azure Login Information
  - TENANT
  - SERVICE_PRINCIPAL
  - SERVICE_PRINCIPAL_SECRET

- ACR Information
  - ACR_REG
  - ACR_REPO
  - ACR_IMAGE

### CI to DockerHub

In order to push to DockerHub, you must set the following `secrets` in your GitHub repo:

- DOCKER_REPO
- DOCKER_USER
- DOCKER_PAT
  - Personal Access Token (recommended) or password

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
