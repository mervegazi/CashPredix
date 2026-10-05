import subprocess

issues_to_update = [6, 7, 8, 9]
for issue_num in issues_to_update:
    # Get current body
    res = subprocess.run(['gh', 'issue', 'view', str(issue_num), '--json', 'body', '-q', '.body'], capture_output=True, text=True)
    if res.returncode == 0:
        body = res.stdout
        # Replace [ ] with [x]
        new_body = body.replace('[ ]', '[x]').replace('[✓]', '[x]')
        subprocess.run(['gh', 'issue', 'edit', str(issue_num), '--body', new_body])
        print(f"Updated issue #{issue_num}")
    else:
        print(f"Failed to get issue #{issue_num}")
