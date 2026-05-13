import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';
import { all, interpolate } from '@pulumi/pulumi';
import * as path from 'path';

import { CiUser } from './common/ci-user';
import { registerGitlabVariables } from './common/gitlab-variables';
import { Api } from './components/api';
import { Bastion } from './components/bastion';
import { Database } from './components/database';
import { StaticWebApplication } from './components/static-web-application';
import { UserPool } from './components/user-pool';
import { registerDeferredBackendGitlabVariables } from './gitlab-variables';
import { Networking } from './networking/networking';

const stackName = pulumi.getStack();
const config = new pulumi.Config('base-template');
const apiConfig = new pulumi.Config('api');
const userPoolConfig = new pulumi.Config('user-pool');
const alertingConfig = new pulumi.Config('alerting');
const bastionConfig = new pulumi.Config('bastion');
const databaseConfig = new pulumi.Config('database');

const projectName = pulumi.getProject();

const componentNamePrefix = `${stackName}-${projectName}`;

const organization = config.require('organization');
const dockerRegistryProjectName = config.require('dockerRegistryProjectName');
const dockerRegistryStackName = config.require('dockerRegistryStackName');
const dockerRegistryStack = new pulumi.StackReference(
  `${organization}/${dockerRegistryProjectName}/${dockerRegistryStackName}`,
);

const networking = new Networking(`${projectName}-networking-${stackName}`, {
  componentName: 'networking',
  stackName,
  targetGroupPort: apiConfig.requireNumber('targetPort'),
  healthCheckEndpoint: apiConfig.require('healthCheckEndpoint'),
  certificateArn: config.require('certificateArn'),
});

const database = new Database(`${projectName}-database-${stackName}`, {
  networking: networking,
  componentName: componentNamePrefix,
  databaseName: databaseConfig.require('name'),
  instanceClass: databaseConfig.require('instanceClass'),
  allocatedStorage: databaseConfig.requireNumber('allocatedStorage'),
});

// The cluster that will contain the service
const cluster = new aws.ecs.Cluster(`${projectName}-cluster-${stackName}`);

const userPool = new UserPool(`${projectName}-userpool-${stackName}`, {
  componentName: `${stackName}-${projectName}-userpool`,
  stackName: stackName,
  emailTemplatesPath: path.join(__dirname, 'emails'),
  invitationEmailSubject: userPoolConfig.require('invitationEmailSubject'),
  invitationEmailTemplateName: userPoolConfig.require(
    'invitationEmailTemplateName',
  ),
  resetPasswordEmailTemplateName: userPoolConfig.require(
    'resetPasswordEmailTemplateName',
  ),
});

const imageTag = apiConfig.require('targetImageTag');
const imageNameWithTag = interpolate`${dockerRegistryStack.getOutput('imageName')}:${imageTag}`;
const api = new Api(`${projectName}-api-${stackName}`, {
  clusterArn: cluster.arn,
  componentName: `${stackName}-${projectName}-api`,
  stackName: stackName,
  networking: networking,
  database: database,
  apiContainerConfiguration: {
    imageName: imageNameWithTag,
    apiPort: apiConfig.requireNumber('targetPort'),
    cpu: apiConfig.requireNumber('cpu'),
    memory: apiConfig.requireNumber('memory'),
    instanceCount: apiConfig.requireNumber('instanceCount'),
    healthCheckEndpoint: apiConfig.require('healthCheckEndpoint'),
  },
  environmentVariables: [
    { name: 'AWS_REGION', value: 'ca-central-1' },
    { name: 'CORS_ORIGIN', value: '.*' },
    { name: 'AUTHENTICATION_SERVICE', value: 'cognito' },
    {
      name: 'COGNITO_CLIENT_ID',
      value: userPool.clientId,
    },
    {
      name: 'COGNITO_USER_POOL_ID',
      value: userPool.userPoolId,
    },
  ],
  secretEnvironmentVariables: [
    {
      name: 'POSTGRES_DATABASE_URL',
      valueFrom: database.connectionStringSecretArn,
    },
    {
      name: 'COGNITO_CLIENT_SECRET',
      valueFrom: userPool.clientSecretSecretArn,
    },
    {
      name: 'SENTRY_AUTH_TOKEN_BACKEND',
      valueFrom: alertingConfig.require('authTokenSecretArn'),
    },
    {
      name: 'SENTRY_DSN',
      valueFrom: alertingConfig.require('apiDsnSecretArn'),
    },
  ],
  executionRolePolicy: JSON.stringify({
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Action: [
          'secretsmanager:GetSecretValue',
          'ecr:GetAuthorizationToken',
          'ecr:BatchCheckLayerAvailability',
          'ecr:GetDownloadUrlForLayer',
          'ecr:BatchGetImage',
          'logs:CreateLogStream',
          'logs:PutLogEvents',
        ],
        Resource: '*',
      },
    ],
  }),
  taskRolePolicy: all([userPool.userPoolArn]).apply(([userPoolArn]) =>
    JSON.stringify({
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Action: [
            'cognito-idp:AddCustomAttributes',
            'cognito-idp:AdminConfirmSignup',
            'cognito-idp:AdminDisableUser',
            'cognito-idp:AdminEnableUser',
            'cognito-idp:AdminCreateUser',
            'cognito-idp:AdminRespondToAuthChallenge',
            'cognito-idp:DeleteUser',
            'cognito-idp:DeleteUserAttributes',
            'cognito-idp:GetUser',
            'cognito-idp:GetUserAttributes',
            'cognito-idp:GlobalSignOut',
            'cognito-idp:InitiateAuth',
            'cognito-idp:RevokeToken',
            'cognito-idp:SignUp',
            'cognito-idp:UpdateUserAttributes',
            'cognito-idp:VerifyUserAttribute',
          ],
          Resource: userPoolArn,
        },
      ],
    }),
  ),
});

const staticWebApplication = new StaticWebApplication(
  `${projectName}-static-web-application-${stackName}`,
  {
    alias: config.require('cloudFrontAlias'),
    certificateArn: config.require('cloudFrontCertificateArn'),
    componentName: `${stackName}-${projectName}-static-web-application`,
  },
);

const region = aws.config.requireRegion();

const awsAccount = aws.getCallerIdentityOutput();

// TODO NOTE: some permissions for docker registry will be missing on ci-user
// (talk to pelo for what he needed to add in Grandy)
const ciUser = new CiUser(`${projectName}-ci-user-${stackName}`, {
  componentName: `${stackName}-${projectName}`,
  userPolicy: all([
    pulumi.interpolate`arn:aws:ecs:${region}:${awsAccount.accountId}:service/${cluster.name}/${api.serviceName}`,
    api.executionRoleArn,
    api.taskRoleArn,
    api.taskDefinitionArn,
    staticWebApplication.webappBucketName,
    staticWebApplication.cloudfrontDistributionArn,
  ]).apply(
    ([
      backendServiceArn,
      executionRoleArn,
      taskRoleArn,
      taskDefinitionArn,
      webAppBucketName,
      cloudfrontDistributionArn,
    ]) =>
      JSON.stringify({
        Version: '2012-10-17',
        Statement: [
          //TODO if cannot make generic ci-user, the will need to expose ecr arn
          // {
          //   Effect: 'Allow',
          //   Action: ['ecr:GetAuthorizationToken'],
          //   Resource: '*',
          // },
          // {
          //   Effect: 'Allow',
          //   Action: [
          //     'ecr:BatchCheckLayerAvailability',
          //     'ecr:GetDownloadUrlForLayer',
          //     'ecr:BatchGetImage',
          //     'ecr:PutImage',
          //     'ecr:InitiateLayerUpload',
          //     'ecr:CompleteLayerUpload',
          //     'ecr:UploadLayerPart',
          //   ],
          //   Resource: dockerRepositoryArn,
          // },
          {
            Action: ['ecs:DescribeTaskDefinition'],
            Effect: 'Allow',
            Resource: '*',
          },
          {
            Effect: 'Allow',
            Action: ['ecs:*'],
            Resource: backendServiceArn,
          },
          {
            Effect: 'Allow',
            Action: ['ecs:RegisterTaskDefinition'],
            Resource: taskDefinitionArn, //Was * before, to be validated
          },
          {
            Effect: 'Allow',
            Action: ['iam:PassRole'],
            Resource: [executionRoleArn, taskRoleArn],
          },
          {
            Effect: 'Allow',
            Action: ['s3:ListBucket', 's3:PutObject', 's3:DeleteObject'],
            Resource: [
              `arn:aws:s3:::${webAppBucketName}`,
              `arn:aws:s3:::${webAppBucketName}/*`,
            ],
          },
          {
            Effect: 'Allow',
            Action: [
              'cloudfront:CreateInvalidation',
              'cloudfront:GetInvalidation',
            ],
            Resource: cloudfrontDistributionArn,
          },
        ],
      }),
  ),
});

const bastion = new Bastion(`${componentNamePrefix}-bastion`, {
  componentName: componentNamePrefix,
  networking,
  amiName: 'amzn2-ami-hvm-*-x86_64-gp2',
  keyPair: bastionConfig.require('keyPair'),
  allowedIpCidr: bastionConfig.require('allowedIpCidr'),
});

database.allowInboundTrafficFrom(
  `${componentNamePrefix}-AllowInboundTrafficFromBastion`,
  `Allow inbound traffic from bastion toward database`,
  bastion.securityGroupId,
  { parent: bastion },
);

const gitlabProjectId = config.require('gitlabProjectId');
registerGitlabVariables({
  isVariableProtected: true,
  environmentScope: `${stackName}/*`,
  gitlabProjectId: gitlabProjectId,
  variables: [
    {
      componentName: `${componentNamePrefix}-gitlab-variable-aws-default-region`,
      key: 'AWS_DEFAULT_REGION',
      value: region,
    },
  ],
});

registerGitlabVariables({
  isVariableProtected: true,
  environmentScope: `${stackName}/backend`,
  gitlabProjectId: gitlabProjectId,
  variables: [
    {
      componentName: `${componentNamePrefix}-gitlab-variable-ecs-task-definition-name`,
      key: 'ECS_TASK_DEFINITION_NAME',
      value: api.taskDefinitionName,
    },
    {
      componentName: `${componentNamePrefix}-gitlab-variable-ecs-container-name`,
      key: 'ECS_CONTAINER_NAME',
      value: api.ecsContainerName,
    },
    {
      componentName: `${componentNamePrefix}-gitlab-variable-ecs-cluster-name`,
      key: 'ECS_CLUSTER_NAME',
      value: cluster.name,
    },
    {
      componentName: `${componentNamePrefix}-gitlab-variable-ecr-url`,
      key: 'IMAGE_REGISTRY',
      value: dockerRegistryStack.getOutput('repositoryUrl'),
    },
    {
      componentName: `${componentNamePrefix}-gitlab-variable-aws-access-key-id-backend`,
      key: 'AWS_ACCESS_KEY_ID',
      value: ciUser.accessKeyId,
    },
    {
      componentName: `${componentNamePrefix}-gitlab-variable-aws-secret-access-key-backend`,
      key: 'AWS_SECRET_ACCESS_KEY',
      value: ciUser.secretAccessKey,
    },
  ],
});

registerDeferredBackendGitlabVariables({
  api: api,
  componentNamePrefix: `${stackName}-${projectName}`,
  stackName: stackName,
  gitlabProjectId: gitlabProjectId,
  isVariableProtected: true,
});

registerGitlabVariables({
  isVariableProtected: true,
  environmentScope: `${stackName}/frontend`,
  gitlabProjectId: gitlabProjectId,
  variables: [
    {
      componentName: `${componentNamePrefix}-gitlab-variable-cloudfront-distribution`,
      key: 'CLOUDFRONT_DISTRIBUTION',
      value: staticWebApplication.cloudfrontDistributionId,
    },
    {
      componentName: `${componentNamePrefix}-gitlab-variable-webapp-s3-bucket`,
      key: 'WEBAPP_S3_BUCKET',
      value: staticWebApplication.webappBucketName,
    },
    {
      componentName: `${componentNamePrefix}-gitlab-variable-aws-access-key-id-frontend`,
      key: 'AWS_ACCESS_KEY_ID',
      value: ciUser.accessKeyId,
    },
    {
      componentName: `${componentNamePrefix}-gitlab-variable-aws-secret-access-key-frontend`,
      key: 'AWS_SECRET_ACCESS_KEY',
      value: ciUser.secretAccessKey,
    },
  ],
});
