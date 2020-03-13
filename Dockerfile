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
RUN adduser appuser --system
WORKDIR /app
EXPOSE 4120
COPY package.json .
 
#
# ---- Dependencies ----
FROM base AS dependencies
RUN npm set progress=false && npm config set depth 0
RUN npm install --production
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
FROM node:lts-alpine AS release
# Tell docker that all commands in this step should run as the appuser user
USER appuser
COPY --from=dependencies /app/prod_node_modules ./node_modules
COPY --from=test /app/dist ./dist
COPY --from=test /app/swagger/swagger.json ./swagger/swagger.json
ENTRYPOINT ["/usr/local/bin/npm", "start"]