// API endpoint to validate invite codes
export async function validateInvite(code) {
    try {
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/invite_codes?code=eq.${code}`, {
            headers: {
                'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
            }
        });

        const codes = await response.json();
        if (codes.length === 0) {
            return { valid: false, message: 'Invalid invite code' };
        }

        const inviteCode = codes[0];

        if (!inviteCode.is_active) {
            return { valid: false, message: 'This invite code is no longer active' };
        }

        if (inviteCode.current_uses >= inviteCode.max_uses) {
            return { valid: false, message: 'This invite code has reached its maximum uses' };
        }

        return {
            valid: true,
            code_type: inviteCode.code_type,
            max_uses: inviteCode.max_uses,
            current_uses: inviteCode.current_uses,
            spots_left: inviteCode.max_uses - inviteCode.current_uses
        };
    } catch (error) {
        console.error('Error validating invite code:', error);
        return { valid: false, message: 'Failed to validate invite code' };
    }
}

// API endpoint to submit bug reports (creates GitHub Issues)
export async function submitBugReport(bugData) {
    try {
        // Insert into Supabase
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/bug_reports`, {
            method: 'POST',
            headers: {
                'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(bugData)
        });

        const result = await response.json();

        // Create GitHub Issue (via Netlify Function or direct GitHub API)
        await createGitHubIssue(bugData);

        return { success: true, data: result };
    } catch (error) {
        console.error('Error submitting bug report:', error);
        return { success: false, error: error.message };
    }
}

// Create GitHub Issue automatically
async function createGitHubIssue(bugData) {
    const issueBody = `
## Bug Report

**Description:**
${bugData.description}

**Browser Info:**
\`\`\`json
${JSON.stringify(bugData.browser_info, null, 2)}
\`\`\`

**Console Logs:**
\`\`\`
${bugData.console_logs || 'No console logs captured'}
\`\`\`

**Error Message:**
\`\`\`
${bugData.error_message || 'No error message'}
\`\`\`

---
*This issue was automatically created by the ForTheWeebs bug reporting system*
  `.trim();

    try {
        const response = await fetch('https://api.github.com/repos/polotuspossumus-coder/Fortheweebs/issues', {
            method: 'POST',
            headers: {
                'Authorization': `token ${import.meta.env.VITE_GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: bugData.title,
                body: issueBody,
                labels: ['bug', 'auto-generated']
            })
        });

        const issue = await response.json();
        console.log('GitHub issue created:', issue.html_url);
        return issue;
    } catch (error) {
        console.error('Failed to create GitHub issue:', error);
        // Don't throw - bug report is still saved in database
    }
}
