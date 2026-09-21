# Configurer l'authentification OIDC entre GitHub Actions et AWS

À faire **une seule fois** par compte AWS, avant de lancer les workflows.
On évite complètement les clés d'accès AWS stockées en secret GitHub :
GitHub Actions échange un jeton OIDC de courte durée contre des
identifiants temporaires AWS.

## 1. Créer le fournisseur d'identité OIDC (une fois par compte)

Dans la console AWS → **IAM → Identity providers → Add provider** :

- Type de fournisseur : `OpenID Connect`
- URL du fournisseur : `https://token.actions.githubusercontent.com`
- Audience (public) : `sts.amazonaws.com`

Ou en CLI :

```bash
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1
```

## 2. Créer un rôle IAM que GitHub Actions peut assumer

Politique de confiance (`trust-policy.json`), remplacez
`<ACCOUNT_ID>` et `<GITHUB_USER>/<REPO>` :

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::<ACCOUNT_ID>:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:<GITHUB_USER>/<REPO>:ref:refs/heads/main"
        }
      }
    }
  ]
}
```

```bash
aws iam create-role \
  --role-name github-actions-deploy \
  --assume-role-policy-document file://trust-policy.json

# Attachez seulement les permissions nécessaires à la démo (principe du
# moindre privilège) : S3, CloudFront, Amplify, Elastic Beanstalk selon
# ce que vous testez. Ne donnez jamais AdministratorAccess (le vrai,
# global) pour ça.
aws iam attach-role-policy \
  --role-name github-actions-deploy \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess

aws iam attach-role-policy \
  --role-name github-actions-deploy \
  --policy-arn arn:aws:iam::aws:policy/CloudFrontFullAccess

# Nécessaire seulement si vous testez la méthode Amplify :
aws iam attach-role-policy \
  --role-name github-actions-deploy \
  --policy-arn arn:aws:iam::aws:policy/AdministratorAccess-Amplify

# Nécessaire seulement si vous testez la méthode Elastic Beanstalk.
# Note : la policy `AWSElasticBeanstalkFullAccess` n'existe plus, AWS
# l'a remplacée par `AdministratorAccess-AWSElasticBeanstalk`.
aws iam attach-role-policy \
  --role-name github-actions-deploy \
  --policy-arn arn:aws:iam::aws:policy/AdministratorAccess-AWSElasticBeanstalk
```

> Pour un atelier de 2h, les policies gérées ci-dessus sont acceptables.
> En contexte réel, écrivez une policy custom qui liste exactement les
> actions nécessaires. Ces policies "AdministratorAccess-\*" sont
> scopées au service (Amplify, Elastic Beanstalk) malgré leur nom — ce
> ne sont pas des policies d'administrateur global du compte.

## 3. Ajouter le secret dans GitHub

Dans votre fork GitHub → **Settings → Secrets and variables → Actions** :

- `AWS_ROLE_ARN` : `arn:aws:iam::<ACCOUNT_ID>:role/github-actions-deploy`
- `AWS_REGION` : ex. `us-east-1`

C'est tout : aucune clé secrète AWS à stocker.
