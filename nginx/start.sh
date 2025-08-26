#!/bin/bash

IMAGE_NAME=my-nginx

docker build -t $IMAGE_NAME .

docker rm -f $IMAGE_NAME-container 2>/dev/null

docker run --name $IMAGE_NAME-container \
  -p 8080:80 \
  -d $IMAGE_NAME

echo "Nginx started http://localhost:8080"