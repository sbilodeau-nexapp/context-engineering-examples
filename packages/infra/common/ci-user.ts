import * as iam from '@pulumi/aws/iam';
import { PolicyDocument } from '@pulumi/aws/iam';
import {
  all,
  ComponentResource,
  ComponentResourceOptions,
  Input,
  Output,
} from '@pulumi/pulumi';

import { Api } from '../components/api';
import { StaticWebApplication } from '../components/static-web-application';

interface Args {
  componentName: string;
  userPolicy: Input<string | PolicyDocument>;
}

export class CiUser extends ComponentResource {
  readonly accessKeyId: Output<string>;
  readonly secretAccessKey: Output<string>;

  constructor(name: string, args: Args, opts?: ComponentResourceOptions) {
    super('CiUser', name, {}, opts);

    const user = new iam.User(
      `${args.componentName}-ci-user`,
      {
        name: `${args.componentName}-ci-user`,
      },
      { parent: this },
    );

    new iam.UserPolicy(
      `${args.componentName}-ci-user-policy`,
      {
        user: user.name,
        policy: args.userPolicy,
      },
      { parent: this },
    );

    const accessKey = new iam.AccessKey(
      `${args.componentName}-ci-user-access-key`,
      {
        user: user.name,
      },
      { parent: this },
    );

    this.accessKeyId = accessKey.id;
    this.secretAccessKey = accessKey.secret;
  }
}
