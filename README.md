# base-template

### Prérequis

Avoir déployé l'infra au moins une fois. Cela va donner des valeurs à copier dans les `gitlab-ci.yml` (frontend + backend)

Valeurs d'environement frontend

* CLOUDFRONT_DISTRIBUTION
* WEBAPP_S3_BUCKET

Valeurs d'environement backend

* ECS_TASK_DEFINITION_NAME
* ECS_CLUSTER_NAME
* ECS_SERVICE_NAME
* ECS_CONTAINER_NAME
* ECR_URL
* IMAGE_REGISTRY
