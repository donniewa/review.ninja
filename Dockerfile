FROM dockerfile/nodejs

COPY . /app

RUN npm install -g bower
RUN cd /app; npm install; bower install --allow-root;

WORKDIR /app

VOLUME ["/certs"]

EXPOSE 5000

CMD ["node", "/app/app.js"]
