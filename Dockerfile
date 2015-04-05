FROM rudijs/rsm-iojs:0.0.1
MAINTAINER Ride Share Market "systemsadmin@ridesharemarket.com"

# NPM package cache
ENV NPM_REFRESHED_AT 2015-03-18.1
COPY package.json /tmp/package.json
RUN \
    cd /tmp && \
    npm install --production && \
    npm install -g pm2 && \
    npm cache clean

# Application
ENV APP_REFRESHED_AT 2015-03-18.1
ENV APP_DIR /srv/ride-share-market-api
RUN \
    mkdir ${APP_DIR} && \
    cp -a /tmp/node_modules/ ${APP_DIR} && \
    mkdir ${APP_DIR}/log && \
    mkdir ${APP_DIR}/pids
COPY config/ ${APP_DIR}/config
COPY httpd/ ${APP_DIR}/httpd
COPY server.js ${APP_DIR}/server.js
COPY pm2-development.json ${APP_DIR}/pm2-development.json
COPY package.json ${APP_DIR}/package.json

# Application User
RUN \
    useradd -c 'RSM Data' -u 2000 -m -d /home/rsm-data -s /bin/bash rsm-data && \
    chown -R rsm-data.rsm-data ${APP_DIR}

USER rsm-data

ENV HOME /home/rsm-data

# Export the APP_DIR as a data volume under the app user account.
# Other containers use this volume's data (eg. logstash, nginx).
VOLUME ${APP_DIR}

# Application Start
WORKDIR ${APP_DIR}

CMD ["pm2", "start", "pm2-development.json", "--no-daemon"]
