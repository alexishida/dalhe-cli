# Review and Change Output

For substantial code reviews, present findings by severity only when severity is supported by concrete impact and exploitability. Do not manufacture findings to fill categories.

Recommended concise structure:

## Summary

State what was investigated or changed and the main result.

## Findings

For each material issue:

- Location: file/function/line when available.
- Issue: concrete failure or risk.
- Impact: what can happen and under what conditions.
- Fix: what should change or what was changed.
- Verification: test/check or reproduction evidence.

For review-only tasks, prioritize bugs and security/correctness issues before style.

## Changes made

List only meaningful implementation changes.

## Verification

List commands/checks actually executed and their result. Distinguish anything not run.

## Residual risks

Mention only unresolved, relevant risks or assumptions. Omit the section when there are none.
