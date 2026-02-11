# Contributing to Mithra AI

First off, thank you for considering contributing to Mithra AI! 🎉

It's people like you that make Mithra AI such a great tool for productivity and life management.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Pull Request Process](#pull-request-process)
- [Style Guidelines](#style-guidelines)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)
- [Community](#community)

---

## 📜 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to [hemasaivattikuti@gmail.com](mailto:hemasaivattikuti@gmail.com).

### Our Standards

- **Be respectful** — Treat everyone with respect and kindness
- **Be inclusive** — Welcome people of all backgrounds and identities
- **Be collaborative** — Work together towards common goals
- **Be constructive** — Provide helpful feedback and accept criticism gracefully

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.0 or higher
- **npm** 9.0 or higher (or yarn 1.22+)
- **Git** 2.30 or higher
- **VS Code** (recommended) with extensions:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense

### Fork & Clone

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:

```bash
git clone https://github.com/YOUR_USERNAME/Mithra-AI-life-os.git
cd Mithra-AI-life-os
```

3. **Add upstream** remote:

```bash
git remote add upstream https://github.com/hemasaivattikuti25/Mithra-AI-life-os.git
```

---

## 🛠️ Development Setup

### Frontend Setup

```bash
# Navigate to client directory
cd ClientScheduler/client

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Backend Setup (Optional)

```bash
# Navigate to server directory
cd server

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start server
uvicorn main:app --reload
```

### Database Setup

1. Create a free Supabase project at [supabase.com](https://supabase.com)
2. Run the schema from `server/supabase_schema.sql` in SQL Editor
3. Copy credentials to your `.env` file

---

## ✏️ Making Changes

### Branch Naming Convention

Create a descriptive branch name:

```bash
# Features
git checkout -b feature/add-dark-mode
git checkout -b feature/calendar-integration

# Bug fixes
git checkout -b fix/habit-streak-calculation
git checkout -b fix/mobile-layout-issue

# Documentation
git checkout -b docs/update-readme
git checkout -b docs/api-documentation

# Refactoring
git checkout -b refactor/auth-context
git checkout -b refactor/component-structure
```

### Commit Message Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Format
<type>(<scope>): <description>

# Types
feat:     New feature
fix:      Bug fix
docs:     Documentation changes
style:    Code style (formatting, semicolons, etc.)
refactor: Code refactoring
test:     Adding tests
chore:    Maintenance tasks

# Examples
feat(tasks): add drag-and-drop reordering
fix(calendar): correct timezone handling
docs(readme): add installation instructions
style(components): format with prettier
refactor(auth): simplify login flow
test(habits): add streak calculation tests
chore(deps): update React to 18.3.1
```

### Keep Your Fork Updated

```bash
# Fetch upstream changes
git fetch upstream

# Merge into your branch
git checkout main
git merge upstream/main

# Push to your fork
git push origin main
```

---

## 🔄 Pull Request Process

### Before Submitting

1. **Update your branch** with the latest upstream changes
2. **Run tests** and ensure they pass
3. **Run linting** and fix any issues:
   ```bash
   npm run lint
   ```
4. **Build the project** to ensure no errors:
   ```bash
   npm run build
   ```
5. **Test on mobile** if your changes affect responsive design

### Submitting a PR

1. Push your changes to your fork
2. Go to the original repository
3. Click "New Pull Request"
4. Select your branch
5. Fill out the PR template:

```markdown
## Description
[Describe what this PR does]

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Screenshots (if applicable)
[Add screenshots for UI changes]

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code where necessary
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have tested on mobile devices
```

### After Submission

- **Respond to feedback** promptly
- **Make requested changes** in new commits
- **Don't force push** after review has started
- **Be patient** — maintainers are volunteers too!

---

## 🎨 Style Guidelines

### JavaScript/React

```javascript
// ✅ Good: Functional components with hooks
const TaskCard = ({ task, onComplete }) => {
  const [isEditing, setIsEditing] = useState(false);
  
  return (
    <div className="task-card">
      {/* Component content */}
    </div>
  );
};

// ✅ Good: Destructure props
const Button = ({ label, onClick, variant = 'primary' }) => { ... };

// ❌ Bad: Avoid class components for new code
class TaskCard extends React.Component { ... }
```

### Tailwind CSS

```jsx
// ✅ Good: Use Tailwind utilities
<button className="px-4 py-2 bg-accent text-white rounded-lg hover:opacity-90 transition-all">
  Click me
</button>

// ✅ Good: Use CSS variables for theming
<div style={{ backgroundColor: 'var(--bg-secondary)' }}>

// ❌ Bad: Avoid inline styles for static values
<button style={{ padding: '16px', backgroundColor: 'blue' }}>
```

### File Organization

```
components/
├── common/           # Shared components
│   ├── Button.jsx
│   ├── Modal.jsx
│   └── Input.jsx
├── features/         # Feature-specific components
│   ├── tasks/
│   ├── habits/
│   └── calendar/
└── layout/           # Layout components
    ├── Header.jsx
    ├── Sidebar.jsx
    └── Footer.jsx
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `TaskCard.jsx` |
| Hooks | camelCase, use prefix | `useAuth.js` |
| Utilities | camelCase | `formatDate.js` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_TASKS` |
| CSS classes | kebab-case | `task-card-header` |

---

## 🐛 Reporting Bugs

### Before Reporting

1. **Search existing issues** — the bug might already be reported
2. **Check the FAQ** — it might be a known issue
3. **Try to reproduce** — ensure it's consistent

### Bug Report Template

```markdown
## Bug Description
[Clear description of the bug]

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
[What you expected to happen]

## Actual Behavior
[What actually happened]

## Screenshots
[If applicable]

## Environment
- OS: [e.g., macOS 14.0]
- Browser: [e.g., Chrome 120]
- Version: [e.g., 1.0.0]
- Device: [e.g., iPhone 15]

## Additional Context
[Any other relevant information]
```

---

## 💡 Suggesting Features

### Feature Request Template

```markdown
## Feature Description
[Clear description of the feature]

## Problem It Solves
[What problem does this solve?]

## Proposed Solution
[How you envision it working]

## Alternatives Considered
[Other solutions you've thought of]

## Additional Context
[Mockups, examples from other apps, etc.]
```

---

## 👥 Community

### Get Help

- 💬 **Discussions** — Ask questions and share ideas
- 🐛 **Issues** — Report bugs and request features
- 📧 **Email** — [hemasaivattikuti@gmail.com](mailto:hemasaivattikuti@gmail.com)

### Stay Updated

- ⭐ **Star** the repository to show support
- 👁️ **Watch** for notifications on updates
- 🐦 **Follow** [@hemasaivattikuti](https://twitter.com/hemasaivattikuti) on Twitter

---

## 🏆 Recognition

Contributors will be:

- Listed in the **Contributors** section of the README
- Mentioned in **release notes** for significant contributions
- Given **credit** in commit messages and documentation

---

## 📝 License

By contributing to Mithra AI, you agree that your contributions will be licensed under the MIT License.

---

<p align="center">
  <strong>Thank you for contributing! 🙏</strong>
</p>

<p align="center">
  Every contribution, no matter how small, makes a difference.
</p>
