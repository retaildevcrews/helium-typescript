# ---- Base Node ----
FROM node:current-alpine AS base

### Optional: Set Proxy Variables
# ENV http_proxy {value}
# ENV https_proxy {value}
# ENV HTTP_PROXY {value}
# ENV HTTPS_PROXY {value}
# ENV no_proxy {value}
# ENV NO_PROXY {value}

# Create a user
RUN adduser -S appuser
WORKDIR /app
COPY scripts ./scripts
EXPOSE 4120
COPY package.json .
 
#
# ---- Dependencies ----
FROM base AS dependencies
RUN npm set progress=false && npm config set depth 0
RUN apk add --no-cache --virtual .gyp \
        make \
        python \
        && npm install --production 
RUN cp -R node_modules prod_node_modules
RUN npm install
 
#
# ---- Test ----
# run linters, setup and tests
FROM dependencies AS test
COPY . .
RUN npm run lint && npm run build && npm run test-unit
 
#
# ---- Release ----
FROM base AS release
# Tell docker that all commands in this step should run as the appuser user
USER appuser
COPY --from=dependencies /app/prod_node_modules ./node_modules
COPY --from=test /app/dist ./dist
ENTRYPOINT [ "sh", "./scripts/start-service.sh" ]