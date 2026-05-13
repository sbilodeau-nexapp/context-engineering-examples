import * as aws from '@pulumi/aws';
import * as ec2 from '@pulumi/aws/ec2';
import * as pulumi from '@pulumi/pulumi';
import {
  ComponentResource,
  ComponentResourceOptions,
  Input,
  Output,
} from '@pulumi/pulumi';
import * as random from '@pulumi/random';

import { Networking } from '../networking/networking';
import { Secret } from './secret';

type Args = {
  networking: Networking;
  componentName: string;
  databaseName: Input<string>;
  instanceClass: Input<string>;
  allocatedStorage: Input<number>;
};

export class Database extends ComponentResource {
  readonly securityGroupId: Output<string>;
  readonly connectionStringSecretArn: Output<string>;
  private readonly databasePort: number = 5432;

  constructor(
    name: string,
    {
      networking,
      componentName,
      databaseName,
      instanceClass,
      allocatedStorage,
    }: Args,
    opts?: ComponentResourceOptions,
  ) {
    super('Database', name, {}, opts);

    const { databaseUsername, databasePassword } =
      this.createDatabaseCredentials(componentName);

    const rdsSecurityGroup = new aws.ec2.SecurityGroup(
      `${componentName}-security-group-rds-ecs-task`,
      {
        vpcId: networking.vpcId,
      },
      { parent: this },
    );

    const dbSubnetGroup = new aws.rds.SubnetGroup(
      `${componentName}-database-subnetgroup`,
      {
        subnetIds: networking.subnetsId,
      },
      { parent: this },
    );

    const rds = new aws.rds.Instance(
      `${componentName}-database`,
      {
        instanceClass: instanceClass,
        vpcSecurityGroupIds: [rdsSecurityGroup.id],
        dbSubnetGroupName: dbSubnetGroup.name,
        dbName: databaseName,
        port: this.databasePort,
        username: databaseUsername,
        password: databasePassword.result,
        engine: 'postgres',
        allocatedStorage: allocatedStorage,
        skipFinalSnapshot: true,
        backupRetentionPeriod: 7,
        backupWindow: '00:00-04:00',
        deletionProtection: true,
      },
      { parent: this },
    );

    const connectionString = pulumi
      .all([rds.username, rds.password, rds.endpoint, rds.dbName])
      .apply(
        ([username, password, endpoint, dbName]) =>
          `postgresql://${username}:${password}@${endpoint}/${dbName}`,
      );

    const connectionStringSecret = new Secret(
      `${componentName}-connection-string`,
      {
        name: `${componentName}-connection-string`,
        description: 'Connection string to reach database',
        value: connectionString,
      },
      { parent: this },
    );

    this.securityGroupId = rdsSecurityGroup.id;
    this.connectionStringSecretArn = connectionStringSecret.secretArn;
  }

  allowInboundTrafficFrom(
    componentName: string,
    description: string,
    securityGroupId: Input<string>,
    opts?: ComponentResourceOptions,
  ) {
    new ec2.SecurityGroupRule(
      `${componentName}`,
      {
        description: description,
        sourceSecurityGroupId: securityGroupId,
        securityGroupId: this.securityGroupId,
        type: 'ingress',
        fromPort: this.databasePort,
        toPort: this.databasePort,
        protocol: 'TCP',
      },
      opts,
    );
  }

  private createDatabaseCredentials(componentName: string) {
    const databaseUsername = 'postgres';

    const databasePassword = new random.RandomString(
      `${componentName}-database-password`,
      {
        length: 30,
        special: false,
      },
      { parent: this },
    );

    new Secret(
      `${componentName}-database-username`,
      {
        name: `${componentName}-db-username`,
        value: databaseUsername,
      },
      { parent: this },
    );

    new Secret(
      `${componentName}-database-password`,
      {
        name: `${componentName}-db-password`,
        value: databasePassword.result,
      },
      { parent: this },
    );
    return { databaseUsername, databasePassword };
  }
}
