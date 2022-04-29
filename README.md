# test-interface
testing smart contract integration

## 🔧 Setup your env
Copy the sample environement file: `$ cp .env.sample .env && vi .env`

Then populate it with:
- the address where our contract is deployed, check README.md of https://github.com/Everest-Option-Exchange-Team/contracts 

## CI-Workflow

> 🧪 Testing
> 
> Please un-comment the npm run test inside of the main.yaml file once you created tests.

## Github Working Conventions

1. **Never push commits to the main branch!** This is super important!! Work on your separate branch and when you are ready, submit a PR (Pull Request) so that other team members can review your changes.
2. **When you work on a feature, a bug fix or anything, work on a separate branch**. **Work only on one task in a branch**, it is way easier to make reviews if you break down your work into smaller tasks. To name your branch, here are a few simple rules:
    - If you add new features, name it *feat/your-feature* (try to keep it short, maximum 3-4 words). For example, *feat/wallet-connect*.
    - If you work on bug fixes, use *fix/your-fix*.
    - If you work on documentation, use *doc/your-doc*.
    - If you work on anything else that is not mentioned, use your imagination!
3. **Commits title must be clear and understandable**. It doesn’t matter whether you capitalise or not your sentence but please don’t use “fix”, “test” or “yolo”!
4. **Explain what your PR does**: what’s the motivation? why do we need this? make sure that everyone can understand what you tried to implement/fix/update... and provide context if needed.
5. **Always squash commits before merging**. When you work on your feature branch, it’s fine to add commits for any minor change but be sure to squash all of them before merging your branch onto main.
6. **When you write code, try to be clear, simplify as much as possible and write comments** (but not too many) so that we understand each other.
7. Code styling is enforced by the pre-commit hook so when you’ll try to commit, you’ll get warnings if your code needs refactoring.