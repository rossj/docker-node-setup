# docker-node-setup
## What
This repo contains a sample Node application and support scripts for a nice Docker-based development setup. The sample application consists of 2 Node services, both of which depend on a 3rd local Node module.

The current workflow and support scripts support the following goals:

1. Restarting of service when service code edited on host (on OS X or Linux host)
2. Restarting of service when local dependency module edited on host (on OS X or Linux host)
3. Installation of 3rd party dependencies as separate image build step that is cached unless dependencies actually change
4. Easy way to pull new code and "run" or "test", knowing everything is bult and up to date

Currently, there is a lot of Dockerfile boilerplate and many support scripts to get this to work the way I want. The support scripts will have to revisited as Docker for Mac and Docker for Windows become available.

## Usage
In this app, file watching is performed on the host to get around the fact that monitoring a directory mounted from OS X doesn't work (see [Docker issue here](https://github.com/docker/docker/issues/18246)).
This might be easier once Docker for Mac becomes available, but for now you need to install a watching tool on the host. If on OS X, you will need to install `fswatch`, as described [here](https://emcrisostomo.github.io/fswatch/getting.html).
On a Debian based Linux distro, you can install `inotifywait` from the `inotify-tools` package.

Then, in a docker terminal, navigate to this repository's directory and run `./up.sh`.

This will look at `docker-compose.yml` and `docker-compose.dev.yml` to determine that there are 2 services, and it will continue to build the `service1` and `service2` images. They will then be started up.

At the end of the output, you should see:

```
service2_1  | Listening on port 3000
service1_1  | Listening on port 3000
```

Only `service1` is exposed to the Docker host, which is linked to and depends on `service2`.

Open a browser and browse to to an following endpoint on `service1`, using the IP of the Docker host (typically 192.168.99.100 on OS X).

```
http://192.168.99.100/hello
```

You should see the following output:
```
Hello World from service1
Using lodash version 4.12.0
...
```

Now, open `service1/index.js`, edit the output text, and save the file. The up.sh script should detect the file change, and that it only affects `service1`. It will send a signal to a wrapping process inside the container which will quickly restart the Node service with the updated code. Refresh the browser window and you should see the updated text.

Now, open and edit the text of `module1/index.js`. This change will trigger a restart of both `service1` and `service2` since it is in the Node dependency tree of both services.

Finally, you can `ctrl+c` the up.sh script and start it again. This will quickly rebuild the service images with your updated code, but will not redo the `npm install` step since that is separated off and cached by Docker, and you haven't edited a package.json file.
