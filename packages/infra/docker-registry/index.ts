import * as aws from '@pulumi/aws';
import * as docker from '@pulumi/docker';
import * as pulumi from '@pulumi/pulumi';
import * as path from 'path';

const projectName = 'base-template';

// The image repository where we push the dockerized backend
const ecrImageRepository = new aws.ecr.Repository(
  `${projectName}-image-repository`,
  {
    name: `${projectName}-backend-images`,
  },
);
const registryInfo = aws.ecr.getAuthorizationToken({});
const image = new docker.Image(`${projectName}-backend-image`, {
  build: {
    args: {
      platform: 'linux/amd64',
    },
    context: path.join(__dirname, '..', '..', 'backend'),
    dockerfile: path.join(__dirname, '..', '..', 'backend', 'Dockerfile'),
    platform: 'linux/amd64',
  },
  imageName: pulumi.interpolate`${ecrImageRepository.repositoryUrl}`.apply(
    (a) => a.toLowerCase(),
  ),
  registry: {
    server: registryInfo.then((info) => `${info.proxyEndpoint}`),
    username: registryInfo.then(
      (info) =>
        Buffer.from(info.authorizationToken, 'base64').toString().split(':')[0],
    ),
    password: registryInfo.then(
      (info) =>
        Buffer.from(info.authorizationToken, 'base64').toString().split(':')[1],
    ),
  },
});

export const imageName = image.imageName;
export const registryUrl = pulumi.interpolate`${ecrImageRepository.registryId}.dkr.ecr.${aws.config.region}.amazonaws.com`;
export const repositoryUrl = ecrImageRepository.repositoryUrl;
