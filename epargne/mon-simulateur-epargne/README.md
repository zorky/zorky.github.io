# VPS

## Prérequis

**Node.js 20+** (via nvm recommandé)

```bash
$ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
$ source ~/.bashrc
$ nvm install 20
$ node -v && npm -v
```

## Création du projet React (Vite) en local

```bash
$ npm create vite@latest mon-simulateur-epargne -- --template react
$ cd mon-simulateur-epargne
$ echo "20" > .nvmrc
$ nvm use
$ npm install
$ npm install recharts
```

Build de l'applation 

```bash
$ npm run build # génère le dossier dist/
```

### Optionnel : déploiement local -> vps

```bash
# Depuis ton poste local — copie le build sur le VPS
$ scp -r dist/ user@ton-vps:/var/www/html/simulation-epargne/mon-simulateur-epargne

# Ou via rsync (mieux pour les mises à jour)
$ rsync -avz --delete dist/ user@ton-vps:/var/www/epargne/
```


## Configuration Nginx

```
server {
    listen 443 ssl;
    server_name domain.ntld;

    # ... ta config SSL existante ...

    # App épargne
    location /epargne/ {
        alias /var/www/html/simulation-epargne/mon-simulateur-epargne/dist/;
        index index.html;
        try_files $uri $uri/ /epargne/index.html; # SPA fallback
    }

    # location /epargne/ {
    #    alias /var/www/epargne/;
    #    index index.html;
    #    try_files $uri $uri/ /epargne/index.html;  # SPA fallback
    # }
}
```

Rechargement nginx

```bash
$ nginx -t
$ nginx -s reload
```

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
