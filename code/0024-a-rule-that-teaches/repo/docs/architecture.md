# Architecture

Four layers. Each may import from itself and from layers to its left. Never from the right.

    types -> repo -> service -> http

| Layer   | Holds                        | May import           |
| ------- | ---------------------------- | -------------------- |
| types   | shapes, no logic             | types                |
| repo    | database reads and writes    | types, repo          |
| service | business rules, Stripe calls | types, repo, service |
| http    | routes, sessions             | everything           |

## Why

A refund rule that lives in one layer can be tested once. When the repo layer starts
calling the service layer, the same rule becomes reachable by two paths and the two drift.

## When the rule gets in your way

- repo needs a business rule: move that logic up into `src/service/` and let the service call the repo.
- service needs something from the request: have the route pass it in as an argument.

Checked by the layering lint on every run.
