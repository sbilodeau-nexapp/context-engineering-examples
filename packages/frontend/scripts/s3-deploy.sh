#!/bin/bash

echo "Deploying ${ENV} to ${WEBAPP_S3_BUCKET}"
aws s3 sync dist s3://$WEBAPP_S3_BUCKET --delete
echo "Invalidating CloudFront ${CLOUDFRONT_DISTRIBUTION}"
aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION --paths "/*"