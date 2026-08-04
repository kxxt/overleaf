# USTC v6 customization rebase notes

This branch rebases the customization work from
`ustc-v6-migration-pre` (tip `9fd30509f1`) onto `ustc-cep-v6.2`
(original tip `38250cd239`). The branches share base `6a5d532d30`.

The source branch contains 42 commits after the common base. Changes were not
blindly cherry-picked: each source commit was compared with current Overleaf
v6.2 and the CEP customization commits already in this branch. The table below
records the disposition of every source commit.

## Commit disposition

| Source | Subject | Disposition |
| --- | --- | --- |
| `e9b21d4d42` | Import msttcorefonts into develop/texlive | Ported as `531c5840f3`. |
| `ddf764f5eb` | Import guide of USTC LaTeX into services/web/public | Ported as `1084db6e3d`. |
| `44b649ba72` | Setup mirrors and proxies | Consolidated to the source branch's final state. TeX image USTC mirrors remain in `150d324721`/`46fee4a261` and the base-image TeX Live mirror in `90b96eb8ae`; the temporary LAN proxy and npm registry override were not restored. See `293bba3482` and `7b3172913c`. |
| `fcfce78951` | Update texlive Dockerfiles | Ported and adapted as `150d324721`. Dockerfiles removed upstream were restored for the required historical images. |
| `97aefc2976` | Tweak default settings | Adapted as `aa12f0b6cb` to current settings, Compose, and upload-size configuration. |
| `6dfe136159` | Add more server-ce scripts | Ported and adapted for current ESM/Mongo APIs as `615813c652`. |
| `b4fb5959e0` | Implement USTC CAS authentication | Reimplemented as `bb953757fd`; the later Mongo fix `22cd56a079` is incorporated. |
| `75f841a70f` | Redirect to official docs for /learn | Dropped in favor of CEP `0d0450b7ca`, which redirects a broader set of unavailable public-site routes while preserving the original URL. |
| `16d1df12be` | Support reference index | Dropped in favor of CEP's maintained client-side Reference Picker (`a83e54034f` plus follow-ups). |
| `02045e2517` | Support multiple versions of TeXLive | Superseded by CEP `a66d4389bf` and the sandboxed-compiles module; the USTC image set is configured by `46fee4a261`. |
| `ad246923b3` | Implement old Git Sync UI | Dropped. It is explicitly removed again by `fd41a6c0c2`, and CEP has a current Git Bridge implementation. |
| `92dda91582` | Implement review feature | Dropped in favor of CEP's maintained track-changes/comments implementation beginning at `636231490e`. |
| `41a4ab1a5f` | Tweak history settings | Partially superseded. Current CE already supplies filesystem history paths. The document-updater bypass was not ported because it would skip history whenever an undefined `project_history.enable` is not exactly `true`. The final Chinese locale intent is carried by `260585d347`. |
| `de5979382b` | Unknown fixes | Dropped. It only adds a per-compile debug log and no functional fix. |
| `82dd7a88e1` | Import config | Ported and updated for the v6.2 application/toolkit contracts as `4e0d76e443`. |
| `c150c34b45` | Add makefile target for building sharelatex/sharelatex-self | Adapted as `026cfbcf6f`, retaining current Makefile targets and network settings. |
| `bf08eb2667` | Resolve Sharelatex -> Overleaf rebrand | Adapted as `260585d347`: `OVERLEAF_SITE_LANGUAGE=zh-CN` now lives in the current environment configuration rather than an old Dockerfile `ENV`. |
| `293bba3482` | Disable mirrors and proxies | Folded into the final mirror/proxy state: no hard-coded LAN proxy or npm registry override is present. |
| `286b7a39ec` | Import track-changes module | Dropped in favor of CEP's newer implementation and its ESM/API compatibility follow-ups. |
| `05d0481b5e` | Enable Sandboxed Compiles feature | Dropped in favor of CEP `9aee49e3b8` and its subsequent refactors and fixes. |
| `51b6d30937` | Disable interaction mode when installing texlive | Ported as `513acabe6d`. |
| `50e47ea26e` | Use USTC mirror | Ported as `90b96eb8ae`. |
| `6daa0ae305` | HACK: use --network host for building | Dropped because CEP `e534b32953` already applies `--network=host`; the new self-build target preserves it. |
| `a81250e49e` | Add support for typst | Reimplemented for v6.2 as `2ab01bd0de`. |
| `4a67917f23` | Add more project templates | Reimplemented for v6.2 as `22956c2edd`; selection tests are in `609e57bf04`. |
| `352b07500a` | Add texlive 2024 and update texlive images | Adapted as `46fee4a261`, using CEP's environment-driven image picker. |
| `35f1fcb7ee` | Commit current package lock file | Dropped. v6.2 uses Yarn 4 and `yarn.lock`; there is no npm `package-lock.json` to carry forward. |
| `decbedcd7d` | 修复标题偏移问题 | Adapted to the relocated stylesheet as `bd8a26d81a`. |
| `bd1f9086a6` | Don't shrink the navbar when there are too many papers | Ported as `3b63285bb4`. |
| `342e8990c5` | Implement missing features to make native git-bridge work | Dropped in favor of CEP `83f2ec5f1c` and its routing, nginx/env, UI-location, and token-date follow-ups. |
| `fd41a6c0c2` | Remove old git sync menu | No separate change required: the old UI was not ported. |
| `7b3172913c` | Not using mirrors | Preserved as final state for CLSI/filestore dependency scripts; neither script rewrites Debian mirrors. |
| `3b12eb8467` | Pick 27397 from 5.5.3 hotfix | Dropped; upstream v6.2 contains `1fd4445a34`. |
| `596b2ddddb` | Pick 27397 stage 2 from 5.5.3 hotfix | Dropped; upstream v6.2 contains the completed `1fd4445a34` implementation. |
| `119d4889a8` | Pick 27476 stage 2 from 5.5.3 hotfix | Dropped; upstream v6.2 contains `6a92acf542`. |
| `ebf4db5e9d` | Run node scripts as www-data user | Dropped; it is patch-equivalent to upstream `678d6809b9`. |
| `f4823ee8ad` | Pick 27505 from 5.5.4 hotfix | Dropped; upstream v6.2 contains `29045b9085` and later ESM/storage updates. |
| `a8835837ba` | Pick 27932 from 5.5.5 hotfix | Dropped; upstream v6.2 contains `56f41c77ff`. |
| `5dac8ae274` | Pick pr_28738.patch-abs from 5.5.5 hotfix | Dropped; upstream v6.2 contains `e05ec0321b`. |
| `eda06553e9` | Pick issue_31527.patch from 5.5.8 hotfix | Dropped; upstream v6.2 contains the maintained `pdftocairo` implementation from `f4dd04e110`. |
| `22cd56a079` | Fix mongo js binding usage in CAS code | Incorporated into the async CAS reimplementation in `bb953757fd`. |
| `9fd30509f1` | Enforce owner-scoped PAT deletion | Adapted to CEP's Git Bridge PAT manager, including current imports, as `df32363495`. |

## Important implementation comparisons

### CAS authentication

The source implementation modified `UserPagesController` and used callback-era
Mongo APIs and raw HTTP/XML handling. It selected a user with a single
`gid OR email` query, logged extensive validation data, and required a later
commit to repair Mongo callback usage.

The v6.2 port uses a dedicated ESM `CasAuthenticationController` and current
Overleaf login flow. It:

- validates the CAS ticket with `fetchString` and a 10-second abort timeout;
- parses and requires `email`, `gid`, and `zjhm` without logging the CAS body;
- looks up `gid` and email separately and rejects cross-account collisions;
- JIT-creates a confirmed, non-holding user with a random analytics UUID;
- only attaches an unclaimed `gid`, updates `zjhm`, and rejects identity
  mismatches;
- uses the current login rate limiter, redirect session handling, audit data,
  and promise-based `finishLogin` flow.

### Server maintenance scripts

The source scripts used CommonJS `require` paths for application modules that
are now ESM, deprecated callback/count APIs, and several unused imports. The
source `info-user` script also referenced an undefined `u` variable, so it
could not print a user successfully.

The port keeps the original `.js` entry points as compatibility wrappers and
places the implementations in `.mjs` files. The implementations use current
promise APIs, `countDocuments`, projected queries, ObjectId validation, the
current scripted-deletion audit reason, and explicit not-found handling.

### Reference indexing

The source change disables the references feature guard, asks the web backend
to fetch internal document/file URLs, and parses at most ten 64 KiB BibTeX
files and 200 keys. It also contains an impossible HTTP status condition
(`status < 200 && status >= 300`) and verbose body logging.

CEP's Reference Picker indexes project snapshots in the browser, parses full
BibTeX entries, keeps per-file indexes, and searches key/author/journal/title/
date/year metadata. It avoids server-side fetching of internal URLs and the
source implementation's file/key caps, and is integrated with the current
CodeMirror editor and modal UI. CEP's implementation was therefore retained.

### Track changes and review

The source branch combines a partial legacy chat/document route port with a
small track-changes module. CEP starts with a complete frontend/backend port
and then follows current Overleaf changes: ESM conversion, new range APIs,
tracked-user lookup, updated editor review state, and converted document,
collaborator, chat, and user-info dependencies. Mixing the source modules into
CEP would regress those compatibility fixes, so both source commits were
dropped.

### Sandboxed compiles and TeX Live selection

The source implementation hard-codes image choices in web settings and is
based on an older DockerRunner. CEP instead provides:

- environment-configured image names, descriptions, registry roots, and
  allowed images;
- current project copy/default-image behavior;
- ESM DockerRunner and current `cwd` support;
- recent-container retention, arm64 seccomp support, and image-prefix helper
  scripts.

The USTC image list (`texlive-full`, 2019, 2022, 2023, and 2024) is therefore
declared through `ALL_TEX_LIVE_DOCKER_IMAGES`,
`ALL_TEX_LIVE_DOCKER_IMAGE_NAMES`, and `ALLOWED_IMAGES` in current config and
development Compose files. Historical image Dockerfiles use Debian bookworm,
USTC/TUNA sources, TeX Gyre fonts, Ghostscript, and the Typst wrapper. The
obsolete hard-coded `allowedImageNames` block was not restored.

### Toolkit configuration

The source `variables.env` and `overleaf.rc` predate the current Overleaf
environment-variable and toolkit contracts. The port renames the application
branding, site, mail, LDAP, template, secure-cookie, and Learn variables to
`OVERLEAF_*`. It also updates the toolkit's host controls to
`OVERLEAF_DATA_PATH`, `OVERLEAF_LISTEN_IP`, and `OVERLEAF_PORT` while retaining
the existing data directory and listen address/port values.

Current sandboxed compiles use distinct host paths for compile work and output,
so the legacy compile-directory aliases were replaced with
`SANDBOXED_COMPILES_HOST_DIR_COMPILES` and
`SANDBOXED_COMPILES_HOST_DIR_OUTPUT`. `DOCKER_RUNNER` remains as the documented
compatibility switch. The unused `COMPILER_PATH`, container-level `TEXMFVAR`,
and malformed `SYNCTEX_BIN_HOST_PATH` entry were removed; the TeX images set
their own `TEXMFVAR`, and no v6.2 component reads the other two. The old
`SHARELATEX_BEHIND_PROXY` entry was also removed because v6.2 enables proxy
handling directly and exposes trusted proxies through
`OVERLEAF_TRUSTED_PROXY_IPS`.

The old RC embedded the Mongo tag in `MONGO_IMAGE` and pinned MongoDB 4.4.
Current toolkit configuration separates the repository and tag, so it now uses
`MONGO_IMAGE=mongo` and `MONGO_VERSION=8.0`, matching this v6.2 tree's Compose
configuration. An existing MongoDB 4.4 data directory must **not** be started
directly on 8.0:
MongoDB major versions require sequential upgrades and compatibility-version
steps. Follow Overleaf's
[MongoDB upgrade procedure](https://docs.overleaf.com/on-premises/maintenance/updating-mongodb)
before deploying this RC over an existing installation.

Overleaf v6 also requires Redis 7.4, so the RC pins `redis:7.4` and enables the
toolkit's recommended AOF persistence. The current application requires a
deployment-specific `OVERLEAF_INVITE_TOKEN_SECRET` for sharing-link token
generation. A commented placeholder and generation command are included, but
no reusable secret is committed.

### Typst

The Typst feature required the largest reimplementation because web, CLSI,
the editor, Webpack, dependency management, and project settings have all
changed. The port retains the feature while adapting it as follows:

- uses current `.mjs` controllers/managers, Zod project settings, promise APIs,
  current template APIs, and current React settings/modal locations;
- carries `typstVersion` through project creation, duplication, templates,
  sockets, compile requests, and the authorized version-list endpoint;
- validates version names on both web and CLSI boundaries before using them in
  the compiler environment;
- bind-mounts package/compiler directories through current DockerRunner mount
  options without changing its public call signature;
- preserves CEP's safer `clone3 = ENOSYS` seccomp behavior instead of the
  source branch's unrestricted allowance, while adding the syscalls needed by
  current Typst;
- fixes the source socket cleanup typo and makes the wrapper preserve compiler
  output/status information for CLSI;
- integrates the current CodeMirror language, outline, linter, shortcuts,
  toolbar, list, root-document, and new-project flows, retaining the spaces
  required around Typst strong and emphasis markup;
- implements Typst list toggling locally instead of carrying the source TODO,
  and retains the source projection invalidation fix, adapted to reparse the
  mapped current lines of invalidated items without debug logging or dropping
  multiple projection items on the same line; the unrelated global TextMate
  color change is not carried;
- records `codemirror-lang-typst` in the Yarn 4 workspace and lockfile rather
  than importing npm's package lock.

### Built-in templates

The source implementation used CommonJS `require`, a now-deleted upload
manager, duplicate `ustcbeamer` switch cases, and returned HTTP 418 for every
creation error. The v6.2 port:

- imports USTC thesis/beamer at the exact source gitlink revisions and retains
  the ACM/IEEE template content;
- exposes the current upload manager's directory initializer and dynamically
  imports it to avoid a static ESM cycle;
- creates the project with the compiler attribute already persisted, imports
  the directory, selects the requested root document, and cleans up failed
  projects with a specific `builtin-template-failure` reason;
- lets normal request error handling report failures instead of swallowing
  them as HTTP 418;
- preserves current initial-tag handling and adds the missing ACM option to
  the welcome dropdown.

### Git Bridge and PAT deletion

The source Git/OAuth implementation and CEP implementation solve the same
problem with different modules. CEP's version is already integrated with the
current Git Bridge API, nginx environment configuration, settings widget, and
current editor, and includes later endpoint/date fixes. It was retained.

CEP already passed the session user's ID into PAT deletion, unlike the initial
source implementation. The final source security fix still motivated two
additional constraints in CEP's manager: malformed ObjectIds now return “not
found”, and deletion is restricted to the current user's
`personal_access_token` with `git_bridge` scope.

### History, debugging, dependency lock, and hotfixes

- CE v6.2 already supplies filesystem history paths. In the development stack,
  the production-oriented “bucket” setting names are paths inside the local
  `history-v1-buckets` Docker volume rather than cloud buckets. Filestore now
  mounts that same volume so CLSI can retrieve history blobs, and history-v1
  uses the nested filesystem layout expected by the blob download endpoints.
  The source history gate would silently disable document-updater history calls
  under current settings and was intentionally omitted.
- The “Unknown fixes” commit only logs a compile name and was omitted.
- v6.2 uses Yarn 4, so the source npm lockfile was not imported.
- All eight picked 5.5.x hotfix commits have maintained upstream equivalents in
  v6.2. Keeping both would duplicate or regress later ESM/storage work.

## Verification

- CLSI unit tests for `RequestParser`, `LatexRunner`, and `DockerRunner`:
  **107 passed**.
- Typst/LaTeX outline and projection regression tests: **23 passed**.
- Project-controller tests for Typst plus all five built-in template mappings:
  **6 passed**.
- ESLint passes for the changed web/Typst/template/Git Bridge implementation
  files, including all ported server maintenance scripts.
- All six maintenance scripts and their compatibility wrappers pass Node
  syntax checks; direct and wrapped invalid delete-project invocations both
  return the documented usage error and exit status 1.
- Backend syntax checks pass for the changed project, upload, and CAS modules.
- `docker compose -f develop/docker-compose.yml config --quiet` passes.
- A sandboxed development compile of an existing project completes
  successfully, including history-blob retrieval, Web's CLSI response parsing,
  PDF generation, and output downloads through `clsi-nginx`.
- `config/variables.env` is accepted by Docker's `--env-file` parser.
- `config/overleaf.rc` passes Bash syntax and value checks for the updated
  toolkit controls and service-image settings.
- Docker build-definition checks pass for the 2019, 2022, 2023, and 2024
  TeX Live Dockerfiles.
- Backend TypeScript validation is blocked by a pre-existing syntax error in
  `services/web/test/unit/src/LinkedFiles/LinkedFilesController.test.mjs:261`.
  Frontend-wide validation also encounters pre-existing CEP/generated-parser
  errors; changed Typst paths were checked separately.
- A Yarn immutable install was not used as a final gate because the starting
  CEP branch already has unrelated workspace/lockfile inconsistencies. The
  Typst package and its exact Yarn resolution/checksum are present in
  `services/web/package.json` and `yarn.lock`.
- The imported upstream ACM/IEEE template distributions retain their original
  trailing whitespace; code/config diffs pass whitespace checks separately.
