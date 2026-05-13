import * as cognito from '@pulumi/aws/cognito';
import {
  ComponentResource,
  ComponentResourceOptions,
  Input,
  Output,
} from '@pulumi/pulumi';
import * as fs from 'node:fs';
import * as path from 'path';

import { Secret } from './secret';

interface Args {
  componentName: string;
  stackName: string;
  invitationEmailSubject: string;
  invitationEmailTemplateName: string;
  resetPasswordEmailTemplateName: string;
  emailTemplatesPath: string;
}

export class UserPool extends ComponentResource {
  readonly clientSecretSecretArn: Output<string>;
  readonly userPoolId: Output<string>;
  readonly userPoolArn: Output<string>;
  readonly clientId: Output<string>;

  constructor(name: string, args: Args, opts?: ComponentResourceOptions) {
    super('UserPool', name, {}, opts);

    const userPool = new cognito.UserPool(
      `${args.componentName}-user-pool`,
      {
        usernameAttributes: ['email'],
        usernameConfiguration: {
          caseSensitive: true,
        },
        autoVerifiedAttributes: ['email'],
        accountRecoverySetting: {
          recoveryMechanisms: [
            {
              name: 'verified_email',
              priority: 1,
            },
          ],
        },
        passwordPolicy: {
          minimumLength: 12,
          requireUppercase: true,
          requireLowercase: true,
          requireSymbols: true,
          requireNumbers: true,
        },
        adminCreateUserConfig: {
          inviteMessageTemplate: {
            emailSubject: args.invitationEmailSubject,
            emailMessage: this.readFromTemplate(
              args.emailTemplatesPath,
              args.invitationEmailTemplateName,
            ),
            smsMessage:
              'Your username is {username} and temporary password is {####}.',
          },
        },
        verificationMessageTemplate: {
          emailMessage: this.readFromTemplate(
            args.emailTemplatesPath,
            args.resetPasswordEmailTemplateName,
          ),
          emailSubject: 'Your Password Reset Code',
        },
      },
      { parent: this },
    );

    const client = new cognito.UserPoolClient(
      `${args.componentName}-user-pool-api-client`,
      {
        name: `${args.componentName}-api`,
        userPoolId: userPool.id,
        accessTokenValidity: 1, //In hours
        refreshTokenValidity: 30, //In days
        idTokenValidity: 1, //In hours
        explicitAuthFlows: [
          'ALLOW_REFRESH_TOKEN_AUTH',
          'ALLOW_USER_PASSWORD_AUTH',
        ],
        enableTokenRevocation: true,
        preventUserExistenceErrors: 'ENABLED',
        generateSecret: true,
      },
      { parent: this },
    );

    const clientSecret = new Secret(
      `${args.componentName}-user-pool-api-client-secret`,
      {
        name: `${args.componentName}-user-pool-api-client-secret`,
        description: `Secret used for communication between the api and Cognito`,
        value: client.clientSecret,
      },
      { parent: this },
    );

    this.clientSecretSecretArn = clientSecret.secretArn;
    this.userPoolId = userPool.id;
    this.userPoolArn = userPool.arn;
    this.clientId = client.id;
  }

  private readFromTemplate(templatePath: string, filename: string) {
    const filePath = path.join(templatePath, filename);
    return fs.readFileSync(filePath, 'utf8');
  }
}
