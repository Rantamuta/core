# Dependency Inventory

## Direct dependencies (`package.json`)

| Name | Version | Notes |
| --- | --- | --- |
| bcryptjs | ^2.4.0 | Runtime dependency. |
| js-yaml | ^3.12.0 | Legacy candidate (README explicitly calls out js-yaml@3). |
| longjohn | ^0.2.11 | README notes removal as a future task. |
| pretty-error | ^2.0.2 | Used with `longjohn` in Logger pretty errors. |
| require-dir | ^1.1.0 | Entry point export strategy relies on it. |
| winston | ^2.4.4 | Legacy candidate (README explicitly calls out winston@2). |
| wrap-ansi | ^2.0.0 | Legacy candidate (README explicitly calls out wrap-ansi@2). |

## Dev dependencies (`package.json`)

| Name | Version | Notes |
| --- | --- | --- |
| c8 | ^10.1.3 | Coverage tooling. |
| coveralls-next | ^6.0.1 | Coverage reporter. |
| mocha | ^10.5.0 | Test runner. |

## Legacy candidates (explicit targets)

| Dependency | Current version | Why flagged |
| --- | --- | --- |
| winston | ^2.4.4 | README calls out winston@2 as a legacy dependency. |
| js-yaml | ^3.12.0 | README calls out js-yaml@3 as a legacy dependency. |
| wrap-ansi | ^2.0.0 | README calls out wrap-ansi@2 as a legacy dependency. |

## Transitive highlights (from `package-lock.json`)

| Dependency | Version | Why highlighted |
| --- | --- | --- |
| glob | 8.1.0 | Deprecated in lockfile; also two major versions behind the glob 10.x line present elsewhere in the lockfile. |
| inflight | 1.0.6 | Deprecated in lockfile with a warning about memory leaks. |
| glob | 10.5.0 | Deprecated notice in lockfile (still marked as an old version). |
