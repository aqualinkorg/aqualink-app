FROM postgres:12.2
RUN apt update
RUN apt install --yes postgis
