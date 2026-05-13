import * as ec2 from '@pulumi/aws/ec2';
import { TargetGroup } from '@pulumi/aws/lb';
import * as awsx from '@pulumi/awsx';
import {
  ComponentResource,
  ComponentResourceOptions,
  Input,
  Output,
} from '@pulumi/pulumi';

type Args = {
  componentName: string;
  stackName: string;
  targetGroupPort: Input<number>;
  healthCheckEndpoint: Input<string>;
  certificateArn: Input<string>;
};

export class Networking extends ComponentResource {
  readonly vpcId: Output<string>;
  readonly subnetsId: Output<string>[];
  readonly loadBalancer: {
    dnsName: Output<string>;
    targetGroup: Output<TargetGroup>;
    securityGroupId: Output<string>;
  };

  constructor(name: string, args: Args, opts?: ComponentResourceOptions) {
    super('Networking', name, {}, opts);

    const vpc = new ec2.Vpc(
      `${args.componentName}-vpc`,
      {
        cidrBlock: '10.0.0.0/16',
        enableDnsSupport: true,
        enableDnsHostnames: true,
      },
      { parent: this },
    );

    const internetGateway = new ec2.InternetGateway(
      `${args.componentName}-internetGateway`,
      {
        vpcId: vpc.id,
      },
      { parent: this },
    );

    const routeTable = new ec2.MainRouteTableAssociation(
      `${args.componentName}-route-table`,
      {
        vpcId: vpc.id,
        routeTableId: vpc.mainRouteTableId,
      },
      { parent: this },
    );

    new ec2.Route(
      `${args.componentName}-route-table-internet-gateway-route`,
      {
        routeTableId: routeTable.routeTableId,
        destinationCidrBlock: '0.0.0.0/0',
        gatewayId: internetGateway.id,
      },
      { parent: this },
    );

    // Subnet are used to ensure that in case of failure in an availability zone, the traffic is not interrupted
    // These subnet are used exclusively in the vpc so they are private
    const subnet1 = new ec2.Subnet(
      `${args.componentName}-applicative-subnet1`,
      {
        cidrBlock: '10.0.1.0/24',
        vpcId: vpc.id,
        availabilityZone: 'ca-central-1a',
      },
      { parent: this },
    );

    const subnet2 = new ec2.Subnet(
      `${args.componentName}-applicative-subnet2`,
      {
        cidrBlock: '10.0.2.0/24',
        vpcId: vpc.id,
        availabilityZone: 'ca-central-1b',
      },
      { parent: this },
    );
    this.vpcId = vpc.id;
    this.subnetsId = [subnet1.id, subnet2.id];

    // The load balancer which will route the traffic to the registered tasks in the cluster
    // It also contains 2 listeners: # HTTP listener (port 80)
    // and one HTTPS listener (port 443) with a ssl certificate
    this.loadBalancer = this.createLoadBalancer(args);
  }

  private createLoadBalancer(args: Args) {
    const loadBalancerSecurityGroup = new ec2.SecurityGroup(
      `${args.componentName}-lb-security-group`,
      {
        vpcId: this.vpcId,
        ingress: [
          {
            fromPort: 80,
            protocol: 'tcp',
            toPort: 80,
            cidrBlocks: ['0.0.0.0/0'],
          },
          {
            fromPort: 443,
            protocol: 'tcp',
            toPort: 443,
            cidrBlocks: ['0.0.0.0/0'],
          },
        ],
        egress: [
          {
            fromPort: 0,
            protocol: '-1',
            toPort: 0,
            cidrBlocks: ['0.0.0.0/0'],
          },
        ],
      },
      { parent: this },
    );

    const alb = new awsx.lb.ApplicationLoadBalancer(
      `${args.componentName}-alb`,
      {
        name: `${args.stackName}-alb`,
        internal: false,
        securityGroups: [loadBalancerSecurityGroup.id],
        subnetIds: this.subnetsId,
        defaultTargetGroup: {
          name: `${args.stackName}`,
          port: args.targetGroupPort,
          protocol: 'HTTP',
          healthCheck: {
            matcher: '200',
            path: args.healthCheckEndpoint,
          },
        },
        listeners: [
          {
            port: 80,
            protocol: 'HTTP',
            defaultActions: [
              {
                type: 'redirect',
                redirect: {
                  protocol: 'HTTPS',
                  port: '443',
                  statusCode: 'HTTP_301',
                },
              },
            ],
          },
          {
            port: 443,
            protocol: 'HTTPS',
            certificateArn: args.certificateArn,
          },
        ],
      },
      { parent: this },
    );
    return {
      dnsName: alb.loadBalancer.dnsName,
      securityGroupId: loadBalancerSecurityGroup.id,
      targetGroup: alb.defaultTargetGroup,
    };
  }
}
