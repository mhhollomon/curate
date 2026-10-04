# Curate client

React based client to allow you to listen to your tunz.

## Routes

### /artists
Lists all the artists known by the server. Links will take you to a list of
the artist's music. (future)

### /albums
List all the albums known by the server. Each album has a link to list the tracks.

### /album/\<id>
List tracks for the album along with an audio player to play them.

## Stuff for future thought.

### Pydantic-to-typescript

https://github.com/phillipdupuis/pydantic-to-typescript

### Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
