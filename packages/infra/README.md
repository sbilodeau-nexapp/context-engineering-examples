# Infra

## Pour débuter

Prendre note que cette infrastructure contient les resources d'un cas classique de webapp + api. Il est probable que certains éléments pourraient ne pas être pertinent pour débuter un projet. Ex: Bastion, déploiement automatisé par le ci-cd. N'hésitez pas à relire [index.ts](index.ts) pour retirer/commenter certains éléments dans un premier temps. Le déploiement peut se faire en plusieurs temps.

### Pulumi

Pour installer pulumi

#### MACOS

`brew install pulumi/tap/pulumi`

S'assurer que votre brew correspond à votre processeur (ARM64 vs X64). Voir [ici](#x86_64-architecture-error) si vous expérimentez des problèmes avec Pulumi.

#### AWS

##### Prérequis

- Avoir un compte AWS dans lequel vous pouvez déployer
  - Peut être sur Nexapp Infrastructure Dev pour tester
  - Peut être sur le compte du client
  - Demander des accès au besoin
- Avoir un accès en ligne de commande (sso ou access key)
- Créer un bucket S3 pour que pulumi puisse sauvegarder son état.
  - `ex: my-app-pulumi-state`
  - Aller sur la console AWS
  - Aller sur S3
  - Créer un nouveau bucket
  - Entrer le nom et garder le reste par défaut
- Créer une clé kms comme secret provider
  - Aller sur la console AWS
  - Aller sur "kms"
  - Nouvelle clé (s'assurer d'être dans la bonne région dans aws)
    - Attributs de la clé:
      - Symmetric, Encrypt Decrypt
      - Sauf si nécessaire, pas besoin d'établir un administrateur de la clé/utilisateur
  - Vous aurez besoin d'être connecté au bon compte AWS en ligne de commande (export AWS_PROFILE ou bien utiliser les access keys)
  - Pour une nouvelle stack: `pulumi stack init --secrets-provider "awskms://<keyId>?region=ca-central-1"`
  - Pour une stack existante: `pulumi stack change-secrets "awskms://<keyId>?region=ca-central-1"`
    - NOTE: il s'agit bien du KEY ID et pas de l'arn

Il faut ensuite connecter pulumi au bucket s3.

`pulumi login s3://my-app-pulumi-state`

### Configuration

Les fichiers `Pulumi.yaml` et `docker/Pulumi.yaml` contienent les configurations pour toutes les stacks. Il va falloir changer le nom + description ainsi que la variable `projectName` dans le fichier `index.ts` et `docker/index.ts` pour le nom de votre projet.

**À faire Attention: La limite de caractères de certaines resources est de 32 incluant le suffix généré par pulumi.**

Le fichier `Pulumi.[stack].yaml` contient les configurations pour la stack.

Pour faire une nouvelle stack

`pulumi stack init [stack]`

Où stack est le nom que vous voulez (prod, staging, etc).

Les configs à changer pour ce template sont

- initProjectName
  - Le nom du projet du `docker/Pulumi.yaml`
- initStackName: init
  - Le nom de la stack du `docker/Pulumi.[stack].yaml`
- dbName
  - Le nom de la base de données sur AWS (sans caractère spécial)
- sentryDsn
  - Le DSN du sentry que vous voulez utiliser

Valeurs par défaut qui ne sont pas nécéssaire de changer

- aws:region
  - La region dans laquelle vous voulez que pulumi crée les resources
  - Par défaut c'est ca-central-1 (Canada), mais elle peut être changée.
- organization
  - L'organisation dans avec laquelle vous être sur pulumi. Par défaut, la valeur c'est `organization`

Dans les options du fichier `Pulumi.yaml` il y a un refresh: always. C'est pour dire à pulumi de regarder s'il y a du changement sur ses resources avant de déployer. Ça prévient des possibles problèmes.

```yaml
options:
  refresh: always
```

### DNS configuration (manual configuration)

Unless you want to directly refer the Cloudfront Distribution and the load balancer DNS for your api, you'll probably need to configure a DNS at some point.

You will need to add some CNAME into the DNS provider (ex: Cloudflare) of your client to properly configure DNS for the application.

- For the AWS certificate to validate the domain ownership.
  - Create a new certificate with aws certificate manager using DNS validation. Added the created certificate's CNAME
    **IMPORTANT** for cloudfront, the certificate must be located in us-east-1
  - If you're not deploying your resources in us-east-1, create another certificate in aws certificate manager located
    in the same region than your other resources. Since the certificate is for the same domain, you should only have to
    add the CNAME record once for both certificates
- Subdomains for:
  - the webapp mapping to the cloudfront distribution
  - the api mapping to the load balancer

## Deploying

### docker registry stack

If it's the first time deploying a stack, be sure to deploy the docker-registry stack first. You'll need to setup
deployment of variables to [Gitlab](#regarding-gitlab-variables)

1. cd docker-registry
2. pulumi stack init
3. pulumi up
4. You can adjust the configuration value of your stack (Pulumi.stack.yaml) to use the pulumi managed docker registry
   you need (
   dockerRegistryProjectName, dockerRegistryStackName)

### Generating email templates

The project uses mjml to generate html templates compatible with Cognito. You need to run at least once before deployment:

```bash
npm run generate-emails
```

The emails are not automatically regenerated. Each modification to the .mjml templates requires you to generate the html again

### main infra stack

Once the registry is in place, make sure you are at the directory "infra" NOT "docker-registry" with pulumi.
You can then proceed to the deployment of the main application stack
Here's a few useful commands

```bash
pulumi stack select # Pick the stack
pulumi preview # View the changes
pulumi up # Deploy the changes
```

Note that executing `pulumi up` does not necessarily update the app in production. For the api,
it will only be updated given the ecs service is updated with the changes.
Also, changes are deployed based on the latest docker image available in the ecr registry.

In a similar fashion, deploying with pulumi does not update the webapp content itself.

#### Regarding Gitlab variables

We use Gitlab variables in the infra to allow our pipelines to work correctly. Some variables can only be obtained once
the ecs service is fully deployed. This lead to some Gitlab variables looking like they might be undefined in the eyes
of
Pulumi (ex: task-definition-name). This means when you are previewing, Pulumi will make it seems like you are deleting
some variables.
In the end those variables should not be deleted. If they are, you can SHOULD proceed to add them in Gitlab later.

### X86_64 architecture error

You might encounter issues with pulumi operations if you are using a M1/M2 Mac. This is due to your pulumi using an
x86_64
executable instead of arm64. (You can confirm it by running
`file ~/.asdf/installs/pulumi/<YOUR_PULUMI_VERSION>/bin/pulumi`)
Here is how you could be able to bypass it:

- Make sure that you installed pulumi for your architecture version.
- When running a pulumi operation, prefix it with `GODEBUG=asyncpreemptoff=1`. Setting `GODEBUG=asyncpreemptoff=1` disables asynchronous preemption, which can prevent crashes or instability when running Pulumi on ARM64 architectures using the Go runtime.

For example:

```
GODEBUG=asyncpreemptoff=1 pulumi preview
```

### Bastion access

The bastion is a jump point to access some resources deployed in the cloud.

Create a key pair in aws ec2.
Save the private key in the secret manager to allow future retrieval by other team members.
To validate the access, you can try to access the bastion using an ssh tunnel or the ec2-connect service directly from
aws.
For the ssh tunnel, you'll need to be requesting from an IP address supported by the bastion (currently the Nexapp VPN):

```bash
ssh -i <PATH_TO_PRIVATE_KEY_FILE> ec2-user@<EC2_INSTANCE_PUBLIC_DNS>
```

### Gitlab

To be able to deploy and update the gitlab CI/CD variables, you need to set an api token and base url.
As stated in the official documentation, to perform variables manipulation, a users must be a project member with at least the "Maintainer" role

https://docs.gitlab.com/ci/variables/#for-a-project

```bash
export GITLAB_TOKEN=<YOUR_GITLAB_PERSONNAL_ACCESS_TOKEN>
export GITLAB_BASE_URL='https://git.nexapptech.com/api/v4'
```

### Registering first user

If you're deploying a new stack, you'll eventually need to register the first user.
You'll need to add this first user to cognito.

### To setup infra deployment automation in CI/CD

The folder ci-cd contains a pulumi project allowing to deploy resources for deployment automation. It creates access key that can be accessed throught the ${stack}/infra environment in your gitlab jobs

#### Once by Gitlab server host

GITLAB_API_TOKEN, GITLAB_API_BASE_URL must be created and set by hand once. For now, these variable are shared between
all environments.

### For each newly deployed stack

```bash
cd ci-cd
pulumi stack init
# The stack name must match the one on the main application stack
# Example: for axys, you must name your stack in ci-cd: 'axys'
pulumi up
```
