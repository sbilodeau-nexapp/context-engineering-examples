import * as ec2 from '@pulumi/aws/ec2';
import { ec2 as ec2Input } from '@pulumi/aws/types/input';
import {
  ComponentResource,
  ComponentResourceOptions,
  Input,
  Output,
} from '@pulumi/pulumi';

import { Networking } from '../networking/networking';

interface Args {
  componentName: string;
  networking: Networking;
  amiName: string;
  keyPair: Input<string>;
  allowedIpCidr: Input<string>;
}

export class Bastion extends ComponentResource {
  readonly securityGroupId: Output<string>;

  constructor(name: string, args: Args, opts?: ComponentResourceOptions) {
    super('Bastion', name, {}, opts);

    const ingressRules = this.developerIngressRules(args.allowedIpCidr);

    const securityGroup = new ec2.SecurityGroup(
      `${args.componentName}-bastion-security-group`,
      {
        vpcId: args.networking.vpcId,
        ingress: ingressRules,
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

    const ami = ec2.getAmi({
      mostRecent: true,
      owners: ['amazon'],
      filters: [
        {
          name: 'name',
          values: [args.amiName],
        },
      ],
    });

    new ec2.Instance(
      `${args.componentName}-bastion`,
      {
        instanceType: ec2.InstanceType.T2_Nano,
        ami: ami.then((ami) => ami.id),
        vpcSecurityGroupIds: [securityGroup.id],
        subnetId: args.networking.subnetsId[0],
        associatePublicIpAddress: true,
        keyName: args.keyPair,
        tags: {
          Name: `${args.componentName}-bastion-name`,
        },
      },
      { parent: this },
    );

    this.securityGroupId = securityGroup.id;
  }

  private developerIngressRules(
    allowedIpCidr: Input<string>,
  ): ec2Input.SecurityGroupIngress[] {
    const ec2ConnectPrefixListId = 'pl-0beea00ad1821f2ef';
    return [
      {
        description: `Allow inbound ssh traffic from Nexapp Ipv4 address`,
        fromPort: 22,
        toPort: 22,
        protocol: ec2.ProtocolType.TCP,
        cidrBlocks: [allowedIpCidr],
      },
      {
        description: `Enable ec2-connect service`,
        fromPort: 22,
        toPort: 22,
        protocol: ec2.ProtocolType.TCP,
        prefixListIds: [ec2ConnectPrefixListId],
      },
    ];
  }
}
