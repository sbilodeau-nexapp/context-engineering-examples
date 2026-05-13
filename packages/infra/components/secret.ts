import { secretsmanager } from '@pulumi/aws';
import {
  ComponentResource,
  ComponentResourceOptions,
  Input,
} from '@pulumi/pulumi';
import { Output } from '@pulumi/pulumi/output';

interface Props {
  name: string;
  value: Input<string>;
  description?: string;
}

export class Secret extends ComponentResource {
  readonly secretArn: Output<string>;

  constructor(
    name: string,
    { name: secretName, value, description }: Props,
    opts?: ComponentResourceOptions,
  ) {
    super('Secret', name, {}, opts);

    const secret = new secretsmanager.Secret(
      `${name}-secret`,
      {
        name: secretName,
        description: description,
        recoveryWindowInDays: 7,
      },
      { parent: this },
    );

    new secretsmanager.SecretVersion(
      `${name}-secretValue`,
      {
        secretId: secret.id,
        secretString: value,
      },
      { parent: this },
    );

    this.secretArn = secret.arn;
  }
}
