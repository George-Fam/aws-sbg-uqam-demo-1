# Atelier AWS : héberger le site de l'AGEEI sur AWS

Ce dossier contient le matériel pratique de l'atelier d'introduction à AWS du
club. On y déploie une **copie de travail** du vrai site de l'AGEEI
(https://gitlab.com/ageei/ageei.org, une application Angular) vers AWS, avec
trois méthodes différentes, chacune automatisée par GitHub Actions.

1. Créez un dépôt GitHub vide à vous (ex. `ageei-aws-demo`).
2. Clonez le dépôt officiel en local, puis poussez-le vers votre dépôt GitHub :
   ```bash
   git clone https://gitlab.com/ageei/ageei.org.git
   cd ageei.org
   git remote remove origin
   git remote add origin https://github.com/<votre-compte>/ageei-aws-demo.git
   git push -u origin main
   ```
3. Copiez le contenu de `.github/workflows/` (dans ce dossier `demo-repo/`)
   dans le `.github/workflows/` de votre fork.
4. Suivez les guides `infra/*.md` pour créer les ressources AWS nécessaires
   à chaque méthode, sur **votre compte AWS Free Tier personnel**.

## Les trois méthodes

| Méthode                     | Fichier workflow           | Théorie                                                                                                                                 |
| --------------------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| S3 + CloudFront             | `deploy-s3-cloudfront.yml` | Hébergement statique DIY : bucket S3 comme origine, CloudFront comme CDN devant. Contrôle total, configuration manuelle.                |
| AWS Amplify Hosting         | `deploy-amplify.yml`       | PaaS managé : Amplify gère le build, le CDN et le HTTPS pour vous. Le plus simple à démarrer.                                           |
| Elastic Beanstalk (Node.js) | `deploy-eb.yml`            | Hébergement par serveur géré : un vrai processus Node sert les fichiers, pour illustrer la différence avec une appli purement statique. |

L'appli Angular buildée produit des fichiers statiques dans
`client-web/public/browser` (voir `client-web/angular.json` du dépôt
officiel), c'est ce dossier qu'on déploie dans les trois cas, sauf pour
Elastic Beanstalk où on l'enveloppe dans un petit serveur Express
(`eb-app/`) pour simuler un déploiement « compute ».

## Authentification AWS depuis GitHub Actions

Toutes les workflows utilisent **OIDC** (OpenID Connect) plutôt que des
clés d'accès AWS long-terme stockées en secret. Voir
`infra/oidc-setup.md` pour la configuration du rôle IAM à faire une seule
fois par compte AWS.

## Pour aller plus loin (optionnel, après l'atelier)

`infra/codepipeline-native.md` montre à quoi ressemblerait le même
déploiement avec l'outillage 100 % AWS (CodePipeline + CodeBuild) au lieu
de GitHub Actions, utile si votre code vit déjà entièrement dans AWS
CodeCommit ou si vous voulez éviter toute dépendance externe à GitHub.
