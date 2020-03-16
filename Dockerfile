# ---- Base Node ----
FROM node:lts AS base

### Optional: Set Proxy Variables
# ENV http_proxy {value}
# ENV https_proxy {value}
# ENV HTTP_PROXY {value}
# ENV HTTPS_PROXY {value}
# ENV no_proxy {value}
# ENV NO_PROXY {value}

# Create a user
WORKDIR /app
COPY package.json .

### TODO - can any of these be combined to reduce layers? 
RUN npm set progress=false && npm config set depth 0
RUN npm install --production
RUN cp -R node_modules prod_node_modules
RUN npm install
 
RUN npm run lint && npm run build && npm run test-unit
 
#
# ---- Release ----
FROM node:lts-alpine AS release

EXPOSE 4120
WORKDIR /app

### create a user
RUN groupadd -g 4120 helium && \
    useradd -r  -u 4120 -g helium helium && \
    ### dotnet needs a home directory for the secret store
    mkdir -p /home/helium && \
    chown -R helium:helium /home/helium

### run as helium user
USER helium

COPY --from=dependencies /app/prod_node_modules ./node_modules
COPY --from=test /app/dist ./dist
COPY --from=test /app/swagger/swagger.json ./swagger/swagger.json
ENTRYPOINT ["/usr/local/bin/npm", "start"]
