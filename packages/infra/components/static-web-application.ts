import * as cloudfront from '@pulumi/aws/cloudfront';
import * as s3 from '@pulumi/aws/s3';
import {
  ComponentResource,
  ComponentResourceOptions,
  Input,
  interpolate,
  Output,
} from '@pulumi/pulumi';

type Args = {
  componentName: string;
  alias: string;
  certificateArn: Input<string>;
};

export class StaticWebApplication extends ComponentResource {
  readonly cloudfrontDomainName: Output<string>;
  readonly cloudfrontDistributionId: Output<string>;
  readonly cloudfrontDistributionArn: Output<string>;
  readonly webappBucketName: Output<string>;

  constructor(name: string, args: Args, opts?: ComponentResourceOptions) {
    super('StaticWebApplication', name, {}, opts);

    const webApp = new s3.Bucket(
      `${args.componentName}-webapp`,
      {
        bucket: `${args.componentName}-webapp`,
      },
      { parent: this },
    );

    const bucketWebsiteConfig = new s3.BucketWebsiteConfiguration(
      `${args.componentName}-bucket-hosting`,
      {
        bucket: webApp.bucket,
        indexDocument: { suffix: 'index.html' },
        errorDocument: { key: 'index.html' },
      },
      { parent: this },
    );

    // Get the recommended managed policy from AWS
    const cachingOptimizedPolicy = cloudfront.getCachePolicyOutput(
      {
        name: 'Managed-CachingOptimized',
      },
      { parent: this },
    );

    // The cloudfront distribution for our webapp. It is a CDN that add caching and SSL validation on top of out bucket
    // Must specify the origin (bucket URL)
    // Must specify a default cache policy
    // The custom error response is for react single page navigation. Since path in url
    // refers to files in S3, we must specify that it is OK and redirect to the index
    const cloudFront = new cloudfront.Distribution(
      `${args.componentName}-cloud-front`,
      {
        enabled: true,
        priceClass: 'PriceClass_100',
        origins: [
          {
            originId: webApp.arn,
            domainName: bucketWebsiteConfig.websiteEndpoint,
            customOriginConfig: {
              httpPort: 80,
              httpsPort: 443,
              originProtocolPolicy: 'http-only',
              originSslProtocols: ['TLSv1.2'],
            },
          },
        ],
        defaultCacheBehavior: {
          targetOriginId: webApp.arn,
          viewerProtocolPolicy: 'redirect-to-https',
          allowedMethods: ['GET', 'HEAD', 'OPTIONS'],
          cachedMethods: ['GET', 'HEAD', 'OPTIONS'],
          cachePolicyId: cachingOptimizedPolicy.apply((policy) => policy.id!),
        },
        restrictions: {
          geoRestriction: {
            restrictionType: 'none',
          },
        },
        customErrorResponses: [
          {
            errorCode: 404,
            responseCode: 200,
            responsePagePath: '/',
          },
          {
            errorCode: 403,
            responseCode: 200,
            responsePagePath: '/',
          },
        ],
        viewerCertificate: {
          sslSupportMethod: 'sni-only',
          acmCertificateArn: args.certificateArn,
          minimumProtocolVersion: 'TLSv1.2_2021',
        },
        aliases: [args.alias],
      },
      { parent: this },
    );
    const webAppPublicAccess = new s3.BucketPublicAccessBlock(
      `${args.componentName}-bucket-public-access`,
      {
        bucket: webApp.id,
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: true,
        restrictPublicBuckets: false,
      },
      { parent: this },
    );

    const myBucketPolicy = new s3.BucketPolicy(
      `${args.componentName}-bucket-policy`,
      {
        bucket: webApp.bucket,
        policy: {
          Version: '2012-10-17',
          Statement: [
            {
              Principal: '*',
              Effect: 'Allow',
              Action: ['S3:GetObject'],
              Resource: [interpolate`${webApp.arn}/*`],
            },
          ],
        },
      },
      { parent: this },
    );

    this.cloudfrontDomainName = cloudFront.domainName;
    this.cloudfrontDistributionId = cloudFront.id;
    this.cloudfrontDistributionArn = cloudFront.arn;
    this.webappBucketName = webApp.bucket;
  }
}
