#!/bin/bash

echo "Deploy using docker image ${IMAGE_REGISTRY}:${IMAGE_TAG}"
# Fetch the task definition as JSON. The task was either create in the AWS console or as code (cdk, pulumi terraform, etc)
# Put the JSON in a variable
ECS_CURRENT_TASK_DEFINITION=$(aws ecs describe-task-definition --task-definition "${ECS_TASK_DEFINITION_NAME}")
# In case of multiple containers, get the index of the container defined in the ECS_CONTAINER_NAME variable
ECS_API_CONTAINER_INDEX=$(
    echo "${ECS_CURRENT_TASK_DEFINITION}" \
    | jq '.taskDefinition | .containerDefinitions | map(.name == "$ECS_CONTAINER_NAME") | index(true)'
)
# Manipulate the task definition to overwrite the image. When not using the tag "latest", it will define the image matching the tag
# Why not using latest all the time? It case of failure, this script must be used to deploy an old version of the app with a specific tag.
# The lastest tag will be use in the infra as code to provision a new env with up-to-date code. It's also easier since the pulumi is outside gitlab context
# It also removes a couple of properties that will be regenerated
ECS_NEW_TASK_DEFINITION=$(
  echo "${ECS_CURRENT_TASK_DEFINITION}" \
  | jq --arg IMAGE "${IMAGE_REGISTRY}:${IMAGE_TAG}" --arg API_CONTAINER_INDEX "${ECS_API_CONTAINER_INDEX}" \
    '.taskDefinition | .containerDefinitions[$API_CONTAINER_INDEX|tonumber].image = $IMAGE | del(.taskDefinitionArn) | del(.revision) | del(.status) | del(.requiresAttributes) | del(.compatibilities) | del(.registeredAt) | del(.registeredBy)'
)

# Register a new task with the updated task definition
echo "Registering new task definition version for ${ECS_TASK_DEFINITION_NAME}"
aws ecs register-task-definition \
  --family "${ECS_TASK_DEFINITION_NAME}" \
  --cli-input-json "${ECS_NEW_TASK_DEFINITION}"

# Update the service with the new task revision
echo "Deploying to service ${ECS_SERVICE_NAME}"
aws ecs update-service \
  --cluster "${ECS_CLUSTER_NAME}" \
  --service "${ECS_SERVICE_NAME}" \
  --task-definition "${ECS_TASK_DEFINITION_NAME}" \
  --force-new-deployment

# Wait for the service to create the new task(s) and to become healthy
# In case of failure, ECS will keep the old tasks running and will stop the new faulty tasks
echo "Waiting for deployment"
aws ecs wait services-stable \
  --cluster "${ECS_CLUSTER_NAME}" \
  --services "${ECS_SERVICE_NAME}"
