# Dockerfile
FROM node:16-alpine

# Install docker terminal in the container
# But in docker run command refer the docker socket to host machine so avoid docker in docker scenario
RUN apk add --update docker openrc

ENV AGENT_ID=100
ENV CAPSTONE_FREQUENCY=300000 

# create destination directory
RUN mkdir -p /home/app
COPY . /home/app

# set default dir so that next commands executes in /home/app dir
WORKDIR /home/app

# will execute npm install in /home/app because of WORKDIR
RUN npm install

# expose 5900 on container
EXPOSE 5900

CMD [ "npm", "run", "start" ]