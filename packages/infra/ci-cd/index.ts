import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';
import { Config } from '@pulumi/pulumi';

import { CiUser } from '../common/ci-user';
import { registerGitlabVariables } from '../common/gitlab-variables';

const componentNamePrefix = pulumi.getStack();

const config = new Config();
const awsRegion = aws.config.requireRegion();

const ciUser = new CiUser(`${componentNamePrefix}-ci-cd`, {
  componentName: componentNamePrefix,
  userPolicy: JSON.stringify({
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Action: [
          'ecs:*',
          'rds:*',
          'cloudfront:*',
          's3:*',
          'secretsmanager:*',
          'ec2:*',
          'iam:*',
          'elasticloadbalancing:*',
          'logs:*',
          'acm:*',
          'sts:GetCallerIdentity',
          'cognito-idp:*',
        ],
        Resource: '*',
      },
    ],
  }),
});

const gitlabProjectId = config.require('gitlabProjectId');

registerGitlabVariables({
  isVariableProtected: true,
  gitlabProjectId,
  environmentScope: `${pulumi.getStack()}/infra`,
  variables: [
    {
      componentName: `${componentNamePrefix}-gitlab-variable-aws-access-key-id`,
      key: 'AWS_ACCESS_KEY_ID',
      value: ciUser.accessKeyId,
    },
    {
      componentName: `${componentNamePrefix}-gitlab-variable-aws-secret-access-key`,
      key: 'AWS_SECRET_ACCESS_KEY',
      value: ciUser.secretAccessKey,
    },
    {
      componentName: `${componentNamePrefix}-gitlab-variable-aws-default-region`,
      key: 'AWS_DEFAULT_REGION',
      value: awsRegion,
    },
  ],
});
