FROM node:6-slim

# Do Node stuff!
ENV PROJECT=service1
ENV NODE_PATH=/code:/npm

# Run npm install on tree of package.json files, move installed 3rd party stuff to /npm
WORKDIR /work
COPY node_jsons temp/
RUN cd "temp/${PROJECT}" \
  && npm install --unsafe-perm \
  && cd ../../ \
  && mv "temp/${PROJECT}/node_modules" /npm \
  && rm -rf temp
COPY node_modules /code

# Copy any local dependencies (including 3rd party modules of different versions,
# installed by above command) to /code
WORKDIR /code/${PROJECT}

# Copy the service's code to /code/service1
COPY . .

# Remove temp stuff
RUN rm -rf node_modules node_jsons

ENV PORT=3000
EXPOSE $PORT
CMD ["node", "index.js"]
