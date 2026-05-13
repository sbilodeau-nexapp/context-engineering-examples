# Frontend

## Pour débuter

### Configurer les variables d'environment

Le projet a présentement 2 environnements possibles: dev et production. Chacun possède son propre fichier
d'environnement:

```
.env
.env.production
```

Pour communiquer avec le backend, `VITE_API_URL` est nécessaire. Celui en développement est déjà configuré pour
communiquer avec le backend de ce projet. Cependant, l'URL de votre production doit être changé pour le vrai URL.

```
VITE_API_URL=http://localhost:3000
```

### Configurer Sentry

1. Créer un projet dans Sentry. Par défaut, les projets sont créés dans le Sentry de Nexapp. Pour se faire, suivez
   ce [guide](https://docs.sentry.io/product/sentry-basics/integrate-frontend/create-new-project/). Pour configurer le
   projet, vous aurez besoin de 3 valeurs: Le nom de l'organisation, le nom du projet et le `DSN`. Ceux-ci vous seront
   donnée au conrant de la configuration du projet dans le lien précédent.
2. Lorsque vous aurez ces informations, ajouter les dans les variables d'environnement respectives:

```
   VITE_SENTRY_DSN
   VITE_SENTRY_ORG
   VITE_SENTRY_PROJECT
```

3. Pour avoir une meilleur stacktrace dans les exceptions de Sentry, il est nécessaire d'uploader les sourcesmaps du projet. Pour ce faire, Sentry offre un wizard pour configurer ce dernier:

```
npx @sentry/wizard@latest -i sourcemaps
```

## Fonctionnement

### Routing

Librairie utilisée

- [React-Router](https://reactrouter.com/en/main/routers/create-browser-router)

Les routes de l'application sont définies sous forme de configuration dans le fichier `src/routing/Router.tsx`. Ce
dernier contient initialement un exemple de structure de route pour un site web.

#### Lien URL non géré

D'un point de vue UX, il existe 2 façons de réagir lorsque l'utilisateur tente d'ouvrir une page web invalide :

1. Rediriger vers une page valide
2. Afficher une page du style `404 NOT FOUND`

Ce projet contient un composant `UnknownRoute.tsx` pour gérer ce type de situation. Il suffit de styler ce dern ou
de remplacer son contenu par une [navigation automatique](https://reactrouter.com/en/main/components/navigate) de
`react-router`.

#### Erreur non gérée

Dans la mesure où une erreur non gérée serait lancée dans le JavaScript, il est préférable de ne pas se retrouver avec
une page blanche. Dans le setup initial de la navigation, il existe le composant `GlobalErrorBoundary` pour afficher un
message générique. Il suffit d'ajuster le visuel du composant au design de votre produit. Le pattern peut être reproduit
en suivant son utilisation dans `Router.tsx`.

#### Lazy Loading / Code Splitting

Afin d'avoir de bonnes performances dans le chargement initial de l'application, il est recommandé de faire
du [Lazy Loading](https://dev.to/franklin030601/code-splitting-in-react-js-4o2g).

Il existe plusieurs façons de l'appliquer. La méthode traditionnelle est d'utiliser la
méthode [lazy()](https://react.dev/reference/react/lazy) de React ainsi
qu'un Suspense. Un exemple d'utilisation se retrouve dans le Router.tsx. Il suffit d'importer le composant à l'aide de
la fonction lazy et d'insérer le retour dans la fonction `LazyLoading` du projet:

```
const IncrementButton = lazy(
  () => import('@/helloWorld/components/IncrementButton'),
);

// Dans la configuration du router
{
  path: 'count',
  element:LazyLoading(IncrementButton),
}
```

Pour ajouter un indicateur de chargement, il suffit de remplacer la propriété fallback dans la fonction LazyLoading par
l'élément visuel désiré.

**Note** : React-Router permet de faire du lazy loading de la même façon que le Server Side Rendering. Il nécessite
cependant une approche très différente de celle que Nexapp utilise actuellement (2023). Cette façon de gérer les données
et de charger du contenu mériterait d'être explorée. Pour plus de détails : https://reactrouter.com/en/main/route/lazy

### Styling

Librairies utilisées

- [Emotion](https://emotion.sh/docs/introduction)
- [clsx](https://www.npmjs.com/package/clsx)

Le styling de l'application se fait à l'aide
de [CSS-in-JS](https://medium.com/dailyjs/what-is-actually-css-in-js-f2f529a2757). La version de Emotion installé permet
uniquement de faire des classnames.

```
import {css} from 'emotion/css'

const title = css`
  font-size: 24px;
  margin-bottom: 12px;
`

// utilisation
<h1 className={title}>Some title</h1>
```

Bien qu'avec `emotion/react` et `emotion/styled` il soit possible de faire de générer des "components", il a été décider
d'utiliser les classnames pour garder le HTML le plus près du natif possible.

Pour garder une flexibilité quant à la composition du style, l'application contient `clsx` qui permet de combiner des
classNames ainsi que d'en ajouter de façon conditionnel (au lieu d'utiliser des props comme les styled-component).

```
// isError est un boolean
<span className={clsx(basicStyle, activeStyle, { error: isError })}>Some Text</span>

const basicStyle = css`
    font-size: 12px;

    &.error {
        color: red;
    }
`

const activeStyle = css({ // 2e façon de définir la classname
    border: 1px solid;
})
```

Lorsque le style varie en fonction d'une valeur spécifique (par exemple, une couleur est passé en props au composant),
il est recommendé de passer par la props `style` de l'élément HTML.

#### Theming

Le theming fonctionne à l'aide de variables CSS. Dans le fichier `src/common/styles/theming.css`, ajouter dans
le `:root` votre palette de couleur (les Base Tokens) comme les exemples déjà présents. **Note**: Regarder avec le/la
designer de votre équipe s'il est possible d'auto générer cette partie automatiquement à partir de Figma.

Dans le `body` du même fichier, vous pouvez définir le theming en soit (les Theme Tokens).

Pour ne pas à utiliser les variables CSS directement dans le styling, mais plutôt un thème typescript, utiliser le
fichier `src/common/styles/Theme.ts`.

D'utiliser les variables CSS pour le thème évite de devoir gérer une `ThemeProvider` React et de risquer un render
complet de l'application sur le changement de thème (ex: dark vs light).

Pour simplifier l'utilisation du thème dans nos classnames, le projet contient une fonction css homemade (dans le
fichier `src/common/styles/Styles.ts`) qui injecte ce dernier. Cette fonction possède aussi les différentes signatures
de la fonction css de Emotion:

```typescript
import { css, Theme } from '@/common/styles/Styles';

// object
const centered = css({
  margin: '40px',
});

// string literal
const topRight = css`
  position: absolute;
  top: 20px;
  right: 20px;
`;

// function with object
const title = css((theme: Theme) => ({
  color: theme.palette.text.secondary,
}));

// function with string literal
const subTitle = css(
  (theme: Theme) => `
  color: ${theme.palette.text.secondary};
`,
);
```

### Internationalisation

L'application utilise [i18next](https://www.i18next.com/) comme outil de traduction. Ce dernier, à l'aide
de [react-i18next](https://react.i18next.com/) permet d'effectuer des changemet de langue de manière réactif (sans
nécessiter un rafrâichissement du browser).

La librairie a été configuré pour lazy-load les fichiers de traduction. C'est à dire que l'application ne va
initialement chargement qu'un seul fichier JSON de langue (ex: fr.json). Pour y parvenir, ces derniers doivent être dans
le dossier `public/locales/` du projet. Pour ajouter d'autres langues, simplement ajouter un fichier JSON dans ce
dossier nommé comme l'acronyme de la langue (ex: `public/locales/es.json`)

Par défaut, la traduction a la langue française comme fallback dans la mesure où le browser est dans une langue non
supporté par l'application. Cela signifie que son fichier de traduction sera
toujours chargé à l'ouverture du site. Si vous voulez changer la langue par défaut, simplement changer la configuration
dans `i18n.ts`:

```typescript
fallbackLng: 'en';
```

Afin d'éviter les namespaces "structurés" qui se retrouve à être utilisé partout (cela vient briser leur raison d'être),
il a été décidé d'avoir un seul fichier de traduction par langue avec toutes les traductions au même niveau. Cela va
aussi éviter d'avoir une clé de traduction qui se répette entre les différents contextes de l'application.

Le composant `ChangeLocaleButton.tsx` du projet initial donne un exemple d'utilisation d'utilisation des traductions
ainsi que comment le changement de langue de façon "lazy" est appliqué.

#### Tests

En raison du lazy loading, un comportement différent est nécessaire pour les tests. En effet, ce dernier n'aura pas
accès au "serveur" pour charger ses fichiers de langues. Un fichier `i18nTest.ts` a donc été créé pour configurer la
traduction de façon à ce que les traductions dans le UI des tests se comportent de la même façon que dans l'application.
Afin d'éviter de changer plusieurs langues pour rien, seulement l'anglais est chargé. Celle-ci peut facilement être
changé dans le dit fichier

### Testing

Librairies utilisées

- [Vitest](https://vitest.dev/)
- [Testing-Library React](https://testing-library.com/docs/react-testing-library/example-intro)
- [Testing-Library Selector](https://testing-library.com/docs/ecosystem-testing-library-selector/)
- [jest-dom](https://github.com/testing-library/jest-dom)
- [Nock](https://github.com/nock/nock)

#### Tester le UI

Comme tous les projets React chez Nexapp, les tests UI sont fait à l'aide de Testing Library. `jest-dom` a été installé
pour offrir des validateurs d'expect plus intéressant à ce type de tests. `testing-library-selector` a aussi été ajouté
pour facilité la gestion des différents accesseurs du UI:

```typescript
const ui = {
  englishButton: byText(t('english')),
  frenchButton: byText(t('french')),
  modal: byRole('modal', { name: t('someName') }),
};
```

#### Mock d'API

Afin de simuler les réponses d'API dans les tests, Nock a été choisi en raison de son API beaucoup plus simple que Mock
Service Worker (msw). Le fichier `HelloWorldClient.ts` contient un exemple d'utilisation:

```typescript
nock(TEST_BASE_URL).get('/').reply(200, { hello: 'Hello World' });
```

### Monitoring

Librairie utilisée

- [Sentry](https://sentry.io)

Sentry est configuré pour capturer les erreurs javascripts qui pourrait arriver dans l'application. Alors que le routing gère le visuel, Sentry va tout de même en être informé.

Dans la mesure où des erreurs manuelles voudraient être lancées, le projet possède un `MonitoringService` qui offre 2 fonctions principales:

- `logError(error: Error)`
- `logMessage(message: string)`
