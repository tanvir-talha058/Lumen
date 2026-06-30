# Contributing to Lumen Browser

Thank you for your interest in contributing to Lumen! This guide will help you get started.

## 🎯 Ways to Contribute

### 1. Code Contributions
- Implement new features
- Fix bugs
- Improve performance
- Add tests
- Refactor code

### 2. Documentation
- Improve README and guides
- Write tutorials
- Add code comments
- Create examples

### 3. Design
- Create app icons
- Design UI improvements
- Suggest UX enhancements
- Create themes

### 4. Testing
- Report bugs
- Test on different platforms
- Write automated tests
- Performance testing

### 5. Community
- Answer questions
- Help other contributors
- Share the project
- Write blog posts

## 🚀 Getting Started

### Prerequisites
- Git
- Node.js (v16+)
- Rust (latest stable)
- Platform-specific tools (see README.md)

### Setup Development Environment

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/lumen-browser.git
   cd lumen-browser
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/lumen-browser.git
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Run development mode**
   ```bash
   npm run tauri:dev
   ```

## 📝 Development Workflow

### Creating a Feature

1. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the code style
   - Add comments where needed
   - Test your changes

3. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

4. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request**
   - Go to GitHub
   - Click "New Pull Request"
   - Describe your changes
   - Link related issues

### Commit Message Convention

Use conventional commits:

```
feat: add new feature
fix: fix a bug
docs: update documentation
style: format code (no logic change)
refactor: refactor code
test: add tests
chore: update dependencies
```

Examples:
```
feat: add dark mode support
fix: resolve tab switching bug
docs: improve installation guide
```

## 🏗️ Project Structure

```
src/
  main.js         # Frontend logic
  styles.css      # Styling

src-tauri/
  src/
    main.rs       # Rust backend
  Cargo.toml      # Rust dependencies
  tauri.conf.json # Tauri config

index.html        # Main HTML
```

### Where to Make Changes

**Adding UI features:**
- HTML: `index.html`
- CSS: `src/styles.css`
- JavaScript: `src/main.js`

**Backend features:**
- Rust: `src-tauri/src/main.rs`

**Configuration:**
- Tauri: `src-tauri/tauri.conf.json`
- Vite: `vite.config.js`
- Package: `package.json`

## 🎨 Code Style

### JavaScript
- Use ES6+ features
- Semicolons are optional
- Use meaningful variable names
- Add comments for complex logic
- Use `const` and `let`, not `var`

```javascript
// Good
const activeTab = state.tabs.find(t => t.active);

// Bad
var tab = state.tabs[0];
```

### CSS
- Use CSS variables for colors
- Mobile-first approach
- Consistent naming
- Group related properties

```css
/* Good */
.button {
  background: var(--accent-color);
  padding: 8px 16px;
  border-radius: var(--radius);
}
```

### Rust
- Follow Rust conventions
- Use `cargo fmt` for formatting
- Add documentation comments
- Handle errors properly

```rust
/// Gets all bookmarks from storage
#[tauri::command]
fn get_bookmarks(app_handle: tauri::AppHandle) -> Result<Vec<Bookmark>, String> {
    // Implementation
}
```

## 🧪 Testing

### Manual Testing
1. Run `npm run tauri:dev`
2. Test your changes
3. Check multiple tabs
4. Test keyboard shortcuts
5. Verify settings persist

### Automated Tests (Future)
```bash
# Rust tests
cd src-tauri
cargo test

# JavaScript tests (when added)
npm test
```

## 🐛 Reporting Bugs

### Before Reporting
- Check existing issues
- Try latest version
- Reproduce the bug
- Collect error messages

### Bug Report Template
```markdown
**Description:**
Clear description of the bug

**Steps to Reproduce:**
1. Go to...
2. Click on...
3. See error

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happens

**Environment:**
- OS: Windows 11
- Lumen Version: 0.1.0
- Node.js: v18.0.0
- Rust: 1.75.0

**Screenshots/Logs:**
(if applicable)
```

## 💡 Feature Requests

### Feature Request Template
```markdown
**Feature Description:**
Clear description of the feature

**Use Case:**
Why is this feature needed?

**Proposed Implementation:**
(optional) How could this work?

**Alternatives:**
Other ways to achieve the same goal

**Priority:**
Low / Medium / High
```

## 🎁 Good First Issues

Looking for where to start? Try these:

### Beginner-Friendly
- [ ] Add more search engine options
- [ ] Improve error messages
- [ ] Add tooltips to buttons
- [ ] Create app icons
- [ ] Write documentation

### Intermediate
- [ ] Implement dark mode
- [ ] Add history tracking
- [ ] Create download manager
- [ ] Add keyboard shortcuts customization
- [ ] Implement tab drag-and-drop

### Advanced
- [ ] Implement real webpage rendering
- [ ] Add reader mode functionality
- [ ] Create ad-blocking system
- [ ] Build extension system
- [ ] Port to mobile platforms

## 📚 Resources

### Learning Resources
- [Tauri Documentation](https://tauri.app/)
- [Rust Book](https://doc.rust-lang.org/book/)
- [MDN Web Docs](https://developer.mozilla.org/)
- [Vite Documentation](https://vitejs.dev/)

### Helpful Commands
```bash
# Update dependencies
npm update
cd src-tauri && cargo update

# Format code
cd src-tauri && cargo fmt

# Check Rust code
cd src-tauri && cargo clippy

# Build for production
npm run tauri:build
```

## 🤝 Code Review Process

### What We Look For
- ✅ Code works as expected
- ✅ Follows project style
- ✅ Includes comments
- ✅ No breaking changes (or clearly documented)
- ✅ Tested on target platform

### Review Timeline
- Small changes: 1-3 days
- Medium changes: 3-7 days
- Large changes: 1-2 weeks

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 💬 Communication

### Questions?
- Open a GitHub Discussion
- Comment on related issues
- Tag maintainers in PRs

### Stuck?
- Check DEVELOPMENT.md
- Look at existing code
- Ask for help in your PR

## 🌟 Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in documentation

## Thank You!

Every contribution, no matter how small, makes Lumen better. We appreciate your time and effort! 🙏

---

**Happy coding! 🚀**
