# Méthode 3 : Elastic Beanstalk (hébergement par serveur géré)

## Théorie

- Jusqu'ici (S3+CloudFront, Amplify), on servait des fichiers **statiques** :
  pas de logique serveur, juste du HTML/CSS/JS livré tel quel.
- **Elastic Beanstalk** (EB) est différent : c'est un PaaS qui provisionne
  et gère un vrai environnement de calcul (EC2 en dessous, avec load
  balancer, auto-scaling, monitoring) pour faire tourner **une
  application avec un processus serveur**. On l'utilise ici pour illustrer
  la catégorie « compute » d'hébergement, même si notre site est
  statique. Beaucoup d'applis réelles (API, SSR, appli avec backend
  intégré) ont besoin de ce modèle.
- EC2 seul (sans Elastic Beanstalk) donnerait un contrôle total sur le
  serveur mais on gérerait nous-mêmes : provisioning, mises à jour de
  sécurité, load balancing, scaling. EB automatise tout ça par-dessus EC2.
- Comparaison rapide :
  - **S3+CloudFront** : zéro serveur, coût quasi nul, pour du 100% statique.
  - **Amplify** : PaaS managé, toujours pour du statique (ou SSR avec
    Next.js), déploiement Git intégré.
  - **Elastic Beanstalk** : vrai serveur géré, nécessaire dès qu'il y a une
    logique applicative côté serveur (API, rendu dynamique, websockets).

## Le petit serveur Express (`eb-app/`)

Elastic Beanstalk pour Node.js s'attend à une appli qui écoute sur un
port. On enveloppe donc les fichiers statiques Angular dans un serveur
Express minimal (`eb-app/server.js`) qui sert `client-web/public/browser`.

## Créer l'environnement (une fois)

```bash
# Installer l'EB CLI si besoin : pip install awsebcli
cd eb-app
eb init ageei-aws-demo --platform "Node.js 20" --region us-east-1
eb create ageei-aws-demo-env --single --instance-type t3.micro
```

`--single` évite de créer un load balancer (facturé séparément), parfait
pour un atelier Free Tier.

## Ce que fait le workflow

`deploy-eb.yml` :
1. Build Angular, copie le résultat dans `eb-app/public`.
2. Zippe `eb-app/` (code du serveur + fichiers statiques + `package.json`).
3. Upload vers S3 puis déploiement via
   `aws elasticbeanstalk create-application-version` +
   `update-environment`.

## Ne pas oublier après l'atelier

```bash
eb terminate ageei-aws-demo-env
```

Un environnement EB (même `t3.micro`) continue de facturer tant qu'il
tourne, contrairement à S3 (quasi gratuit à ce volume) ou Amplify (facturé
à la build/au trafic).
