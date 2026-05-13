#!/bin/bash

# Login to aws docker registry. It uses AWS_ACCESS_KEY under the hood to authenticate to ecr
# Then the output of the get-login-password is passed to the docker login command (--password-stdin)
aws ecr get-login-password --region ca-central-1 | docker login --username AWS --password-stdin "${ECR_URL}"

echo "Building docker image $IMAGE_REGISTRY:$IMAGE_TAG"
# Build the image and tag it as latest
docker build --platform=linux/amd64 -t "${IMAGE_REGISTRY}:latest" .
# Add a tag to the latest build (2 tags will exist)
docker tag "${IMAGE_REGISTRY}:latest" "${IMAGE_REGISTRY}:${IMAGE_TAG}"

echo "Pushing docker image to $IMAGE_REGISTRY:$IMAGE_TAG"
# Push the 2 tags (same build) to keep a trace and add a rollback capability
docker push "${IMAGE_REGISTRY}:latest"
docker push "${IMAGE_REGISTRY}:${IMAGE_TAG}"
