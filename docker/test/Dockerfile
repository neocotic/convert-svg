FROM ghcr.io/puppeteer/puppeteer:24.10.1

ARG PACKAGE_NAME

WORKDIR /workspace
USER root

RUN sed -i 's/^Components: main$/& contrib/' /etc/apt/sources.list.d/debian.sources \
    && apt-get update \
    && apt-get install -y debconf-utils
RUN echo "ttf-mscorefonts-installer msttcorefonts/accepted-mscorefonts-eula select true" | debconf-set-selections
RUN apt-get install -y ttf-mscorefonts-installer \
    && fc-cache -fv

USER $PPTRUSER_UID

COPY --chown=$PPTRUSER_UID docker/test/convert-svg-core-latest.tgz docker/test/convert-svg-core-test-latest.tgz ./
COPY --chown=$PPTRUSER_UID packages/${PACKAGE_NAME}/package.json packages/${PACKAGE_NAME}/tsconfig.json ./
RUN npm i ./convert-svg-core-latest.tgz ./convert-svg-core-test-latest.tgz \
    && rm ./convert-svg-core-latest.tgz ./convert-svg-core-test-latest.tgz

COPY --chown=$PPTRUSER_UID packages/${PACKAGE_NAME}/src ./src
COPY --chown=$PPTRUSER_UID packages/${PACKAGE_NAME}/test ./test
RUN mkdir ./test/fixtures/actual

CMD ["npm", "test"]
VOLUME ["/workspace/test/fixtures/actual"]
