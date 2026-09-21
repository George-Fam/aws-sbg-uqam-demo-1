# Méthode 1 : S3 + CloudFront

## Théorie

- **S3** (Simple Storage Service) : stockage objet. Un bucket configuré en
  hébergement statique sert des fichiers HTML/CSS/JS directement, sans
  serveur à gérer.
- **CloudFront** : réseau de diffusion de contenu (CDN). Il met en cache
  le contenu du bucket sur des points de présence partout dans le monde,
  réduit la latence pour les visiteurs, et fournit HTTPS gratuitement via
  un certificat ACM.
- Pourquoi les deux ensemble et pas juste S3 ? Un bucket S3 seul en mode
  site statique ne fait pas de HTTPS nativement et n'a pas de cache
  géographique. CloudFront ajoute ces deux choses par-dessus.
- Accès : le bucket reste **privé**, CloudFront y accède via une
  **Origin Access Control (OAC)**, le public ne parle jamais directement
  à S3.

## Créer les ressources (CLI, une fois)

```bash
BUCKET_NAME=ageei-aws-demo-$(whoami)
aws s3api create-bucket --bucket $BUCKET_NAME --region us-east-1

# Bloquer tout accès public direct au bucket
aws s3api put-public-access-block \
  --bucket $BUCKET_NAME \
  --public-access-block-configuration \
  BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true

# Créer la distribution CloudFront (via la console est plus simple pour
# un atelier débutant : CloudFront → Create distribution → Origin domain =
# le bucket S3 → cocher "Origin access control settings (recommended)" →
# créer un nouveau OAC → la console propose ensuite la policy de bucket à
# coller automatiquement).
```

Notez l'**ID de distribution CloudFront** (ex. `E123ABC456DEF`) et le nom
du bucket : ce sont les deux valeurs à mettre en secrets GitHub
(`S3_BUCKET_NAME`, `CLOUDFRONT_DISTRIBUTION_ID`).

## Ce que fait le workflow

`deploy-s3-cloudfront.yml` :
1. Build Angular (`npx ng build --configuration production`).
2. `aws s3 sync` du dossier `client-web/public/browser` vers le bucket.
3. Invalidation du cache CloudFront (`aws cloudfront create-invalidation`)
   pour que les visiteurs voient immédiatement la nouvelle version, sinon
   CloudFront continuerait à servir les anciens fichiers en cache.
