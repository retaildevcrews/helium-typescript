# ---- Base Node ----
FROM node:lts AS base

### Optional: Set Proxy Variables
# ENV http_proxy {value}
# ENV https_proxy {value}
# ENV HTTP_PROXY {value}
# ENV HTTPS_PROXY {value}
# ENV no_proxy {value}
# ENV NO_PROXY {value}

WORKDIR /app
COPY . .

### TODO - can any of these be combined to reduce layers? 
RUN npm set progress=false && npm config set depth 0
RUN npm install --production
RUN cp -R node_modules prod_node_modules
RUN npm install
RUN npm run lint && npm run build && npm run test-unit
 
# ---- Release ----
FROM node:lts-alpine AS release

EXPOSE 4120
WORKDIR /app

### run as helium user
RUN adduser -S helium
USER helium

COPY --from=base /app/package.json .
COPY --from=base /app/prod_node_modules ./node_modules
COPY --from=base /app/dist ./dist
COPY --from=base /app/swagger/swagger.json ./swagger/swagger.json

ENTRYPOINT ["/usr/local/bin/npm", "start"]
