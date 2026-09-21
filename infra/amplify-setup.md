# Méthode 2 : AWS Amplify Hosting

## Théorie

- Amplify Hosting est une plateforme **managée** (PaaS) : build, CDN,
  HTTPS, et déploiements continus sont gérés pour vous. Pas de bucket ni
  de distribution CloudFront à configurer à la main : Amplify les crée en
  coulisses.
- Différence clé avec S3+CloudFront : **contrôle vs simplicité**. Amplify
  est plus rapide à mettre en place et inclut des prévisualisations de
  branche automatiques, mais on a moins de contrôle fin sur la
  configuration du cache ou de la distribution.
- Amplify se connecte normalement **directement à votre dépôt Git**
  (GitHub, GitLab, etc.) et build lui-même à chaque push. Dans ce cas on
  n'a même pas besoin de workflow GitHub Actions pour Amplify. C'est ce
  qu'on montre à l'atelier comme option la plus simple.
- `deploy-amplify.yml` montre l'alternative pour ceux qui veulent quand
  même déclencher/contrôler le build depuis GitHub Actions (utile si le
  build doit faire des étapes custom avant l'upload).

## Option A : connecter Amplify directement au dépôt (recommandé, zéro CI custom)

1. Console AWS → **Amplify Hosting → Create app → Deploy from Git repository**.
2. Autorisez l'accès à votre fork GitHub, sélectionnez la branche `main`.
3. Amplify détecte Angular automatiquement. Si besoin, ajustez la commande
   de build : `npx ng build --configuration production` et le dossier de
   sortie : `client-web/public/browser`.
4. Chaque push sur `main` redéploie automatiquement. Rien à faire côté
   GitHub Actions.

## Option B : déclencher Amplify depuis GitHub Actions

Utile si vous voulez garder le contrôle du pipeline dans GitHub Actions
plutôt que de laisser Amplify build lui-même.

```bash
aws amplify create-app --name ageei-aws-demo
# Notez l'App ID retourné, et créez la branche :
aws amplify create-branch --app-id <APP_ID> --branch-name main
```

Mettez `AMPLIFY_APP_ID` en secret GitHub. Le workflow
`deploy-amplify.yml` build en local dans le job GitHub Actions, puis
pousse l'archive vers Amplify via `aws amplify start-deployment` avec
upload manuel (déploiement "sans branche Git", Amplify sert alors
uniquement de CDN/hosting, sans lien direct au repo).
