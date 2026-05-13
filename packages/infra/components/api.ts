import * as ec2 from '@pulumi/aws/ec2';
import * as iam from '@pulumi/aws/iam';
import * as awsx from '@pulumi/awsx';
import {
  ComponentResource,
  ComponentResourceOptions,
  Input,
  Output,
} from '@pulumi/pulumi';

import { Networking } from '../networking/networking';
import { Database } from './database';

type Args = {
  clusterArn: Input<string>;
  componentName: string;
  stackName: string;
  networking: Networking;
  database: Database;
  executionRolePolicy: Input<string>;
  taskRolePolicy: Input<string>;
  apiContainerConfiguration: {
    imageName: Input<string>;
    cpu: Input<number>;
    memory: Input<number>;
    instanceCount: Input<number>;
    apiPort: Input<number>;
    healthCheckEndpoint: Input<string>;
  };
  environmentVariables: Input<{ name: string; value: Input<string> }>[];
  secretEnvironmentVariables: Input<{
    name: string;
    valueFrom: Input<string>;
  }>[];
};

export class Api extends ComponentResource {
  readonly serviceName: Output<string>;
  readonly ecsContainerName: string;
  readonly taskRoleName: Output<string>;
  readonly executionRoleArn: Output<string>;
  readonly taskRoleArn: Output<string>;
  readonly taskDefinitionName: Output<string>;
  readonly taskDefinitionArn: Output<string>;

  constructor(name: string, args: Args, opts?: ComponentResourceOptions) {
    super('Api', name, {}, opts);

    const taskRole = this.createTaskRole(
      args.componentName,
      args.taskRolePolicy,
    );

    const execRole = this.createExecutionRole(
      args.componentName,
      args.executionRolePolicy,
    );

    // Security group of the load balancer.
    // It can receive traffic from http and https and can call all the internet

    const ecsTaskSecurityGroup = this.createApiTaskSecurityGroup(
      args.componentName,
      args.networking,
      args.database,
      args.apiContainerConfiguration.apiPort,
    );

    const apiContainerName = 'api';
    const taskDefinition = new awsx.ecs.FargateTaskDefinition(
      `${args.componentName}-task-definition`,
      {
        taskRole: {
          roleArn: taskRole.arn,
        },
        executionRole: {
          roleArn: execRole.arn,
        },
        container: {
          name: apiContainerName,
          image: args.apiContainerConfiguration.imageName,
          environment: args.environmentVariables,
          secrets: args.secretEnvironmentVariables,
          healthCheck: {
            command: [
              'CMD-SHELL',
              //TODO: Be sure to revise this command accordingly to your docker image
              `curl -f http://localhost:${args.apiContainerConfiguration.apiPort}${args.apiContainerConfiguration.healthCheckEndpoint} || exit 1`,
            ],
          },
          cpu: args.apiContainerConfiguration.cpu,
          memory: args.apiContainerConfiguration.memory,
          essential: true,
          portMappings: [
            { protocol: 'tcp', hostPort: 80, containerPort: 80 },
            {
              targetGroup: args.networking.loadBalancer.targetGroup,
              containerPort: args.apiContainerConfiguration.apiPort,
              hostPort: args.apiContainerConfiguration.apiPort,
            },
          ],
        },
      },
    );
    const service = new awsx.ecs.FargateService(
      `${args.componentName}-ecs`,
      {
        cluster: args.clusterArn,
        deploymentCircuitBreaker: {
          rollback: true,
          enable: true,
        },
        loadBalancers: [{
          containerPort: args.apiContainerConfiguration.apiPort,
          containerName: apiContainerName,
          targetGroupArn: args.networking.loadBalancer.targetGroup.apply(t=> t.arn)
        }],
        networkConfiguration: {
          subnets: [args.networking.subnetsId[0]],
          securityGroups: [ecsTaskSecurityGroup.id],
          assignPublicIp: true,
        },
        desiredCount: args.apiContainerConfiguration.instanceCount,
        taskDefinition: taskDefinition.taskDefinition.arn,
      },
      { parent: this, dependsOn: [taskDefinition, args.networking.loadBalancer.targetGroup] },
    );
    this.serviceName = service.service.name;
    this.ecsContainerName = apiContainerName;
    this.executionRoleArn = execRole.arn;
    this.taskRoleArn = taskRole.arn;
    this.taskRoleName = taskRole.name;
    this.taskDefinitionName = taskDefinition.taskDefinition.id;
    this.taskDefinitionArn = taskDefinition.taskDefinition.arn;
  }

  private createApiTaskSecurityGroup(
    componentName: string,
    networking: Networking,
    database: Database,
    apiPort: Input<number>,
  ) {
    const ecsTaskSecurityGroup = new ec2.SecurityGroup(
      `${componentName}-security-group-ecs-task`,
      {
        name: `${componentName}-security-group-ecs-task`,
        vpcId: networking.vpcId,
        ingress: [
          {
            description: 'Allow inbound traffic from the load balancer',
            fromPort: apiPort,
            toPort: apiPort,
            protocol: 'tcp',
            cidrBlocks: ['0.0.0.0/0'],
            securityGroups: [networking.loadBalancer.securityGroupId],
          },
        ],
        egress: [
          {
            fromPort: 0,
            toPort: 0,
            protocol: '-1',
            cidrBlocks: ['0.0.0.0/0'],
          },
        ],
      },
      { parent: this },
    );

    database.allowInboundTrafficFrom(
      `${componentName}-AllowDBInboundTrafficFromApi`,
      `Allow inbound traffic from api toward database`,
      ecsTaskSecurityGroup.id,
      {
        parent: this,
      },
    );

    return ecsTaskSecurityGroup;
  }

  private createExecutionRole(
    componentName: string,
    policy: Input<string>,
  ): iam.Role {
    const role = new iam.Role(
      `${componentName}-ecs-task-execution-role`,
      {
        assumeRolePolicy: iam.assumeRolePolicyForPrincipal({
          Service: 'ecs-tasks.amazonaws.com',
        }),
      },
      { parent: this },
    );

    new iam.RolePolicy(
      `${componentName}-ecs-task-execution`,
      {
        role,
        policy,
      },
      { parent: this },
    );
    return role;
  }

  private createTaskRole(
    componentName: string,
    policy: Input<string>,
  ): iam.Role {
    const role = new iam.Role(
      `${componentName}-ecs-task-role`,
      {
        assumeRolePolicy: iam.assumeRolePolicyForPrincipal({
          Service: 'ecs-tasks.amazonaws.com',
        }),
      },
      { parent: this },
    );

    new iam.RolePolicy(
      `${componentName}-ecs-task`,
      {
        role,
        // See https://aws.permissions.cloud/iam/cognito-idp for cognito permissions
        policy,
      },
      { parent: this },
    );

    return role;
  }
}
