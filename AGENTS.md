# Repository instructions

These rules apply to every change in this repository, including features, fixes, documentation, tests, refactors, dependencies, infrastructure, and automation.

## Branch and pull request workflow

1. Inspect the working tree and current branch before editing. Preserve unrelated user changes; never reset or discard them.
2. Create a new, descriptive branch before beginning a new task. Use `feat/`, `fix/`, `docs/`, `refactor/`, `test/`, `ci/`, or `chore/` followed by a lowercase kebab-case description.
3. Base a new task on the latest `origin/main` when appropriate. Fetch first; never overwrite a dirty checkout to update it. Continuing the same PR stays on its existing branch.
4. Never commit or push changes directly to `main`. Never force-push `main`. The one-time empty repository bootstrap is already complete and is not a precedent for future changes.
5. Make focused commits using Conventional Commits. Review the staged diff and exclude secrets, local environment files, and generated application output.
6. Run checks appropriate to the change. For documentation, run `python docs/tools/validate_docs.py` and `git diff --check`. For application work, use the checks established by the implementation and its release scope.
7. Push the task branch and open a PR targeting `main`. Use the PR template and include the problem, resulting behavior, scope, validation evidence, and material limitations.
8. Do not merge a PR or deploy without explicit user/maintainer authorization. Resolve failing checks before declaring the PR ready.

## Product and architecture baseline

Read `docs/PRD.md`, `docs/SRS.md`, `docs/SDD.md`, and `docs/DECISIONS.md` for the current task's scope. R1 is information/CMS/WhatsApp; payments and fundraising belong to R2 after its gates. Do not enable R2 by adding a frontend button or accepting manual transfers through WhatsApp.

Keep PRD, SRS, SDD and traceability consistent when requirements change. Do not invent organizational history, legal status, impact statistics, partner identities, or media rights. Preserve private data and allowlist public DTOs.
