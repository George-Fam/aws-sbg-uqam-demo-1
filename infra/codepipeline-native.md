# Pour aller plus loin : équivalent 100% AWS-natif

Tout l'atelier utilise GitHub Actions comme orchestrateur de CI/CD. Si
votre code vit déjà dans **CodeCommit** (ou si vous voulez éviter toute
dépendance à GitHub), AWS propose son propre outillage équivalent :

| GitHub Actions | Équivalent AWS natif |
|---|---|
| Dépôt GitHub | AWS CodeCommit (ou GitHub via une connexion CodeStar) |
| Workflow YAML (`.github/workflows/`) | **CodePipeline** (orchestration des étapes) |
| Job qui build (`npx ng build`) | **CodeBuild** (exécute un `buildspec.yml`) |
| Secrets GitHub | **AWS Secrets Manager** / variables d'environnement CodeBuild |
| OIDC + rôle IAM assumé | Rôle de service IAM attaché directement à CodePipeline/CodeBuild (pas besoin d'OIDC, tout reste dans AWS) |

## Exemple de `buildspec.yml` (CodeBuild) pour le même déploiement S3+CloudFront

```yaml
version: 0.2
phases:
  install:
    commands:
      - cd client-web && npm install
  build:
    commands:
      - npx ng build --configuration production
  post_build:
    commands:
      - aws s3 sync public/browser s3://$S3_BUCKET_NAME --delete
      - aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --paths "/*"
artifacts:
  files:
    - '**/*'
  base-directory: client-web/public/browser
```

## Pipeline CodePipeline (schéma des étapes)

1. **Source** : CodeCommit (ou connexion GitHub via CodeStar Connections).
2. **Build** : CodeBuild exécute le `buildspec.yml` ci-dessus.
3. **Deploy** : soit une étape CodeBuild supplémentaire (comme ci-dessus),
   soit une action CodePipeline dédiée selon la cible (S3, Elastic
   Beanstalk a une action native `ElasticBeanstalk`, CodeDeploy pour EC2).

## Pourquoi GitHub Actions pour l'atelier quand même ?

- La plupart des membres du club utilisent déjà GitHub.
- Palier d'entrée plus bas : pas besoin d'apprendre CodeCommit/CodePipeline
  en plus d'AWS lui-même le même jour.
- OIDC donne la même sécurité (pas de clés long-terme) sans être enfermé
  dans l'écosystème AWS pour l'orchestration.

Ce document est fourni pour celles et ceux qui veulent creuser après
l'atelier, pas couvert en démo live.
