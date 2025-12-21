# 🚀 VS Code Setup for ForTheWeebs Development

**Ultimate development environment for rapid iteration and national security-grade development**

---

## 📦 **Essential VS Code Extensions**

### **Must-Have (Install These First):**

```
1. ES7+ React/Redux/React-Native snippets
   - Publisher: dsznajder
   - Why: React component shortcuts (type 'rafce' → instant component)

2. Prettier - Code formatter
   - Publisher: esbenp.prettier-vscode
   - Why: Auto-format on save (keeps code clean)

3. ESLint
   - Publisher: dbaeumer.vscode-eslint
   - Why: Catch errors before they run

4. GitLens
   - Publisher: eamodio.gitlens
   - Why: See who changed what and when (critical for team work)

5. Auto Rename Tag
   - Publisher: formulahendry.auto-rename-tag
   - Why: Change <div> → automatically updates </div>

6. Path Intellisense
   - Publisher: christian-kohler.path-intellisense
   - Why: Auto-complete file paths

7. Error Lens
   - Publisher: usernamehw.errorlens
   - Why: See errors inline (no more hunting)

8. Console Ninja
   - Publisher: WallabyJs.console-ninja
   - Why: See console.log() output right in your code

9. Thunder Client
   - Publisher: rangav.vscode-thunder-client
   - Why: Test APIs without leaving VS Code

10. GitHub Copilot (if you have it)
    - Publisher: GitHub
    - Why: AI pair programming
```

### **Quick Install Command:**
Open VS Code terminal and paste:
```bash
code --install-extension dsznajder.es7-react-js-snippets
code --install-extension esbenp.prettier-vscode
code --install-extension dbaeumer.vscode-eslint
code --install-extension eamodio.gitlens
code --install-extension formulahendry.auto-rename-tag
code --install-extension christian-kohler.path-intellisense
code --install-extension usernamehw.errorlens
code --install-extension wallabyjs.console-ninja
code --install-extension rangav.vscode-thunder-client
```

---

## ⚙️ **VS Code Settings (settings.json)**

Press `Ctrl+Shift+P` → Type "Open Settings (JSON)" → Paste this:

```json
{
  // Auto-format on save
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",

  // Better code navigation
  "editor.minimap.enabled": true,
  "editor.minimap.maxColumn": 80,
  "breadcrumbs.enabled": true,

  // Auto-save (critical for hot reload)
  "files.autoSave": "afterDelay",
  "files.autoSaveDelay": 1000,

  // Show hidden files
  "files.exclude": {
    "**/.git": false,
    "**/node_modules": true,
    "**/.vscode": false
  },

  // Better terminal
  "terminal.integrated.fontSize": 14,
  "terminal.integrated.defaultProfile.windows": "Git Bash",

  // Prettier config
  "prettier.singleQuote": true,
  "prettier.trailingComma": "es5",
  "prettier.semi": true,
  "prettier.printWidth": 100,

  // ESLint auto-fix
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },

  // Better IntelliSense
  "javascript.suggest.autoImports": true,
  "typescript.suggest.autoImports": true,
  "javascript.updateImportsOnFileMove.enabled": "always",

  // Git settings
  "git.autofetch": true,
  "git.confirmSync": false,
  "git.enableSmartCommit": true,

  // Better search
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.git": true
  },

  // Live reload
  "emmet.includeLanguages": {
    "javascript": "javascriptreact"
  },

  // Console Ninja
  "console-ninja.featureSet": "Community",

  // Error Lens
  "errorLens.enabled": true,
  "errorLens.enabledDiagnosticLevels": ["error", "warning"]
}
```

---

## 🎨 **Recommended Theme for Long Sessions**

```
Dark+: Default (built-in) - Easy on eyes
OR
One Dark Pro: For better syntax highlighting
```

Install One Dark Pro:
```bash
code --install-extension zhuangtongfa.material-theme
```

---

## ⌨️ **Essential Keyboard Shortcuts**

### **Navigation:**
```
Ctrl+P          - Quick open file (MOST USED)
Ctrl+Shift+P    - Command palette
Ctrl+`          - Toggle terminal
Ctrl+B          - Toggle sidebar
Ctrl+Tab        - Switch between files
Ctrl+\          - Split editor
```

### **Editing:**
```
Alt+Up/Down     - Move line up/down
Shift+Alt+Down  - Duplicate line
Ctrl+D          - Select next occurrence
Ctrl+/          - Toggle comment
Ctrl+Shift+K    - Delete line
Ctrl+Space      - Trigger autocomplete
```

### **Search:**
```
Ctrl+F          - Find in file
Ctrl+Shift+F    - Find in all files
Ctrl+H          - Find and replace
```

### **Git:**
```
Ctrl+Shift+G    - Open source control
Ctrl+Enter      - Commit (in source control)
```

### **Debug:**
```
F5              - Start debugging
F9              - Toggle breakpoint
F10             - Step over
F11             - Step into
```

---

## 🔥 **ForTheWeebs-Specific Snippets**

Create custom snippets: `Ctrl+Shift+P` → "Configure User Snippets" → "javascriptreact.json"

```json
{
  "Bug Fixer Monitored Component": {
    "prefix": "bugfix",
    "body": [
      "import { withBugReporting, MONITORED_SYSTEMS, SEVERITY } from '../utils/bugFixerIntegration';",
      "",
      "const handle${1:Action} = withBugReporting(async () => {",
      "  try {",
      "    $0",
      "  } catch (error) {",
      "    console.error('${1:Action} error:', error);",
      "    throw error;",
      "  }",
      "}, {",
      "  system: MONITORED_SYSTEMS.${2:SYSTEM_NAME},",
      "  severity: SEVERITY.${3:HIGH},",
      "  component: '${4:ComponentName}',",
      "});"
    ],
    "description": "Create bug-monitored async function"
  },

  "Creator Application Field": {
    "prefix": "creatorfield",
    "body": [
      "<div className=\"form-group\">",
      "  <label htmlFor=\"${1:fieldName}\">${2:Field Label} *</label>",
      "  <input",
      "    type=\"${3:text}\"",
      "    id=\"${1:fieldName}\"",
      "    name=\"${1:fieldName}\"",
      "    value={formData.${1:fieldName}}",
      "    onChange={handleChange}",
      "    required",
      "  />",
      "</div>"
    ],
    "description": "Creator application form field"
  },

  "Supabase Query": {
    "prefix": "supaquery",
    "body": [
      "const { data: ${1:dataName}, error } = await supabase",
      "  .from('${2:table_name}')",
      "  .select('${3:*}')",
      "  ${4:.eq('id', userId)}",
      "  .single();",
      "",
      "if (error) {",
      "  console.error('${2:table_name} query error:', error);",
      "  throw error;",
      "}",
      "",
      "$0"
    ],
    "description": "Supabase query with error handling"
  }
}
```

---

## 🚀 **Workspace Setup**

### **1. Open Project in VS Code:**
```bash
cd C:\Users\polot\OneDrive\Desktop\fortheweebs
code .
```

### **2. Recommended Folder Structure View:**
```
📁 fortheweebs/
├── 📁 api/                    - Backend APIs
│   ├── creator-applications.js
│   └── trial.js
├── 📁 src/
│   ├── 📁 pages/              - All page components
│   ├── 📁 components/         - Reusable components
│   ├── 📁 utils/              - Helper functions
│   │   └── bugFixerIntegration.js ⭐
│   └── index.jsx              - Entry point
├── 📁 supabase/              - Database schemas
│   └── schema_adult_content_FIXED.sql
├── 📁 public/
│   └── 📁 legal/              - Legal documents
├── .env                      - Config (NEVER COMMIT)
├── server.js                 - Backend server
└── package.json
```

### **3. Create Multi-Root Workspace:**

Save this as `fortheweebs.code-workspace`:
```json
{
  "folders": [
    {
      "path": ".",
      "name": "🏠 ForTheWeebs Root"
    },
    {
      "path": "src",
      "name": "⚛️ Frontend"
    },
    {
      "path": "api",
      "name": "🔌 Backend API"
    },
    {
      "path": "supabase",
      "name": "🗄️ Database"
    }
  ],
  "settings": {
    "files.exclude": {
      "**/node_modules": true,
      "**/.git": true,
      "**/dist": true
    }
  }
}
```

Then: `File → Open Workspace from File → fortheweebs.code-workspace`

---

## 🐛 **Debugging Setup**

### **Create `.vscode/launch.json`:**

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Frontend (Chrome)",
      "url": "http://localhost:3002",
      "webRoot": "${workspaceFolder}/src",
      "sourceMaps": true
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Launch Backend",
      "program": "${workspaceFolder}/server.js",
      "restart": true,
      "console": "integratedTerminal",
      "env": {
        "NODE_ENV": "development"
      }
    }
  ],
  "compounds": [
    {
      "name": "Full Stack Debug",
      "configurations": ["Launch Frontend (Chrome)", "Launch Backend"]
    }
  ]
}
```

**Now you can:**
- Press `F5` → Select "Full Stack Debug"
- Set breakpoints anywhere
- Debug frontend + backend simultaneously

---

## 🧪 **Testing with Thunder Client**

### **Setup API Tests:**

1. Open Thunder Client (lightning icon in sidebar)
2. Create Collection: "ForTheWeebs APIs"
3. Add these requests:

**Health Check:**
```
GET http://localhost:3000/health
```

**Submit Creator Application:**
```
POST http://localhost:3000/api/creator-applications/submit
Content-Type: application/json

{
  "fullName": "Test User",
  "email": "test@example.com",
  "stageName": "TestCreator",
  "contentType": "gaming",
  "contentCategory": "general",
  "agreeToTerms": true
}
```

**Upload ID:**
```
POST http://localhost:3000/api/creator-applications/upload-id
Content-Type: multipart/form-data

[Add file and email fields]
```

Save these for quick testing!

---

## 🔍 **Git Integration**

### **GitLens Features to Use:**

1. **Inline Blame:**
   - See who wrote each line (hover over code)

2. **File History:**
   - Click clock icon in file → See all changes

3. **Compare:**
   - Right-click file → "Compare with..."

4. **Search Commits:**
   - Ctrl+Shift+P → "GitLens: Search Commits"

---

## 🎯 **National Security Development Mode**

### **For Government/Enterprise Work:**

```json
// Add to settings.json
{
  // Disable telemetry
  "telemetry.telemetryLevel": "off",

  // Disable crash reporting
  "extensions.ignoreRecommendations": true,

  // Secure auto-save
  "files.autoSave": "off",

  // Encrypt git commits
  "git.enableCommitSigning": true,

  // Disable external connections
  "extensions.autoCheckUpdates": false,
  "update.mode": "none",

  // Clear recent files on exit
  "window.restoreWindows": "none"
}
```

### **Security Extensions:**

```bash
# Code security scanning
code --install-extension snyk-security.snyk-vulnerability-scanner

# Secrets detection
code --install-extension gitlab.gitlab-workflow
```

---

## 📝 **Tasks Setup (Build/Run Commands)**

### **Create `.vscode/tasks.json`:**

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start Dev Servers",
      "type": "shell",
      "command": "npm run dev:all",
      "problemMatcher": [],
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    },
    {
      "label": "Build Production",
      "type": "shell",
      "command": "npm run build",
      "problemMatcher": ["$tsc"],
      "group": {
        "kind": "build",
        "isDefault": true
      }
    },
    {
      "label": "Run Tests",
      "type": "shell",
      "command": "npm test",
      "problemMatcher": []
    }
  ]
}
```

**Now:**
- `Ctrl+Shift+B` → Runs build
- `Ctrl+Shift+P` → "Run Task" → Select task

---

## 🚀 **Quick Start Workflow**

### **Daily Development Routine:**

1. **Open VS Code:**
   ```bash
   cd C:\Users\polot\OneDrive\Desktop\fortheweebs
   code .
   ```

2. **Start Servers:**
   - Press `` Ctrl+` `` (opens terminal)
   - Type: `npm run dev:all`
   - Wait for "✅ Server started successfully!"

3. **Open Files:**
   - Press `Ctrl+P`
   - Type filename (e.g., "creator" → finds CreatorApplication.jsx)

4. **Make Changes:**
   - Edit code
   - Auto-saves after 1 second
   - Browser auto-reloads

5. **Check Errors:**
   - Error Lens shows inline
   - Check "Problems" panel (Ctrl+Shift+M)

6. **Commit:**
   - `Ctrl+Shift+G` → Opens Git
   - Type commit message
   - Click ✓ or press `Ctrl+Enter`

---

## 🎨 **Code Organization Tips**

### **File Naming Convention:**
```
✅ PascalCase for components: CreatorApplication.jsx
✅ camelCase for utilities: bugFixerIntegration.js
✅ kebab-case for CSS: creator-application.css
✅ UPPERCASE for constants: MONITORED_SYSTEMS
```

### **Folder Structure:**
```
src/
├── pages/           - Full page components
├── components/      - Reusable UI components
├── utils/           - Helper functions
├── hooks/           - Custom React hooks
├── contexts/        - React contexts
└── styles/          - Global styles
```

---

## 🔥 **Pro Tips**

### **1. Multi-Cursor Editing:**
```
Ctrl+Alt+Down    - Add cursor below
Ctrl+D           - Select next match
Alt+Click        - Add cursor at click
```

### **2. Zen Mode:**
```
Ctrl+K Z         - Distraction-free coding
ESC ESC          - Exit Zen Mode
```

### **3. Quick Terminal Commands:**
```
Ctrl+Shift+`     - New terminal
Ctrl+Shift+5     - Split terminal
```

### **4. Refactoring:**
```
F2               - Rename symbol everywhere
Ctrl+.           - Quick fix
Shift+Alt+F      - Format document
```

---

## 🐛 **Troubleshooting**

### **ESLint Not Working:**
```bash
npm install -g eslint
```

### **Prettier Not Formatting:**
- Check bottom-right corner → Should say "Prettier"
- If not: Right-click file → "Format Document With..." → Choose Prettier

### **Git Not Working:**
```bash
# Install Git Bash
# Then restart VS Code
```

---

## 🎯 **National Security Development Extensions**

### **For Enterprise/Government Work:**

```bash
# Code analysis
code --install-extension sonarqube.sonarlint-vscode

# Security scanning
code --install-extension aquasecurity.trivy-vulnerability-scanner

# YAML validation (for configs)
code --install-extension redhat.vscode-yaml

# Docker (for containerization)
code --install-extension ms-azuretools.vscode-docker

# Remote development (for secure servers)
code --install-extension ms-vscode-remote.remote-ssh
```

---

## 📚 **Learning Resources**

**VS Code Docs:**
https://code.visualstudio.com/docs

**Keyboard Shortcuts PDF:**
https://code.visualstudio.com/shortcuts/keyboard-shortcuts-windows.pdf

**React DevTools (Browser Extension):**
- Chrome: https://chrome.google.com/webstore (search "React Developer Tools")
- Shows React component tree in browser

---

## ✅ **Setup Checklist**

- [ ] Installed all essential extensions
- [ ] Updated settings.json
- [ ] Created custom snippets
- [ ] Set up debugging (launch.json)
- [ ] Created tasks (tasks.json)
- [ ] Set up Thunder Client API tests
- [ ] Enabled GitLens
- [ ] Configured Prettier
- [ ] Set up workspace file
- [ ] Tested hot reload

---

## 🎉 **You're Ready!**

Press `Ctrl+P` → Type "creator" → Start coding!

**Everything auto-saves, auto-formats, and auto-reloads.**

**Now go build something that makes the old guard irrelevant.** 🚀
