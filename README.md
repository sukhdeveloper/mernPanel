# The mern2 pr 1.0

This is a MERN stack application from the "MERN Stack Front To Back".
Admin panel of the application is developed with MERN.

## Quick Start

```
# setup AWS instance and follow instructions given in reference link https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/setting-up-node-on-ec2-instance.html in order to setup nvm and npm on server and then upload the git repo to the server and follow below steps

# change default.json file in config folder

# this file is located in config/default.json

# add uri of your mongodb connection for example

 "mongoURI": "mongodb://localhost/databaseName",

 if you don't have any database to which you want to connect the App then first login to https://www.mongodb.com/ and create a cluster in it and connect that cluster database as per above steps.
 
```



```bash
# Install server dependencies
npm install

# Install client dependencies
cd client
npm install

# Run both Express & React from root
npm run dev

# Build for production
cd client
npm run build


# Run production build from root
change the mode from development to production in .env file
run command => npm run server

# Run production build permanently from root
install pm2 package globally with "sudo npm i -g pm2 "
run command => pm2 run server.js



```

