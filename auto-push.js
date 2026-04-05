#!/usr/bin/env node
// Called by the Claude Code PostToolUse hook after every Write/Edit.
// Reads the hook JSON from stdin, then git add + commit + push.

const { execSync } = require('child_process');
const path = require('path');

const ROOT = path.resolve(__dirname);

let raw = '';
process.stdin.on('data', (chunk) => (raw += chunk));
process.stdin.on('end', () => {
  let filename = 'files';
  try {
    const payload = JSON.parse(raw);
    const fp = (payload.tool_input && payload.tool_input.file_path) || '';
    if (fp) filename = path.basename(fp);
  } catch {
    // non-JSON stdin — ignore
  }

  try {
    execSync('git add -A', { cwd: ROOT, stdio: 'pipe' });
    // Check if there's anything staged
    try {
      execSync('git diff --cached --quiet', { cwd: ROOT, stdio: 'pipe' });
      // Nothing staged — nothing to do
    } catch {
      // Something staged — commit and push
      execSync(`git commit -m "Update ${filename}"`, { cwd: ROOT, stdio: 'pipe' });
      execSync('git push origin main', { cwd: ROOT, stdio: 'pipe' });
      process.stdout.write(`[auto-push] Committed and pushed: Update ${filename}\n`);
    }
  } catch (err) {
    // Don't block Claude — just log
    process.stderr.write(`[auto-push] git error: ${err.message}\n`);
  }
});
