# Version: 0.0.1
FROM ubuntu:14.04
MAINTAINER Ride Share Market "systemsadmin@ridesharemarket.com"

# APT cache
ENV APT_REFRESHED_AT 2015-03-14.1
RUN apt-get -qq update

# Install io.js, gpg keys listed at https://github.com/iojs/io.js
ENV IOJS_VERSION 1.5.1
RUN apt-get -y install curl \
&& gpg --keyserver pool.sks-keyservers.net --recv-keys 9554F04D7259F04124DE6B476D5A82AC7E37093B DD8F2338BAE7501E3DD5AC78C273792F7D83545D \
&& curl -SLO "https://iojs.org/dist/v${IOJS_VERSION}/iojs-v${IOJS_VERSION}-linux-x64.tar.gz" \
&& curl -SLO "https://iojs.org/dist/v${IOJS_VERSION}/SHASUMS256.txt.asc" \
&& gpg --verify SHASUMS256.txt.asc \
&& grep " iojs-v${IOJS_VERSION}-linux-x64.tar.gz\$" SHASUMS256.txt.asc | sha256sum -c - \
&& tar -xzf "iojs-v${IOJS_VERSION}-linux-x64.tar.gz" -C /usr/local --strip-components=1 \
&& rm "iojs-v${IOJS_VERSION}-linux-x64.tar.gz" SHASUMS256.txt.asc

# NPM package cache
ENV NPM_REFRESHED_AT 2015-03-14.1
COPY package.json /tmp/package.json
RUN cd /tmp \
&& npm install --production \
&& npm install -g pm2

# Application
ENV APP_REFRESHED_AT 2015-03-10.4
ENV APP_DIR /srv/ride-share-market-api
RUN mkdir ${APP_DIR} \
&& cp -a /tmp/node_modules/ ${APP_DIR} \
&& mkdir ${APP_DIR}/pids
COPY config/ ${APP_DIR}/config
COPY httpd/ ${APP_DIR}/httpd
COPY server.js ${APP_DIR}/server.js
COPY pm2-development.json ${APP_DIR}/pm2-development.json
COPY package.json ${APP_DIR}/package.json

# Application User
RUN useradd -c 'RSM Data' -u 2000 -m -d /home/rsm-data -s /bin/bash rsm-data \
&& chown -R rsm-data.rsm-data ${APP_DIR}
USER rsm-data
ENV HOME /home/rsm-data

# Application Start
WORKDIR ${APP_DIR}
CMD ["pm2", "start", "pm2-development.json", "--no-daemon"]
