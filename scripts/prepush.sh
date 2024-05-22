#!/bin/sh

# 同步遠端分支
git fetch origin

# 取得本地分支名稱
CURRENT_BRANCH=$(git branch --show-current)

# 檢查遠端分支是否存在，如果不存在則創建
if ! git show-ref --quiet refs/remotes/origin/$CURRENT_BRANCH; then
  echo "Remote branch origin/$CURRENT_BRANCH does not exist. Creating it now..."
  git push origin $CURRENT_BRANCH
fi

# 取得本地分支與遠端分支的差異檔案列表
CHANGED_FILES=$(git diff origin/$CURRENT_BRANCH --name-only --diff-filter=ACM | grep -E '\.(js|ts|tsx)$')

echo "Changed files: $CHANGED_FILES"

if [ -z "$CHANGED_FILES" ]; then
  echo "No JavaScript/TypeScript files changed"
  exit 0
fi

echo "Running tests on changed files..."

# 針對異動的檔案運行 Jest 測試
npx jest --bail --findRelatedTests --passWithNoTests $CHANGED_FILES

# 如果測試失敗，則退出並阻止 push
if [ $? -ne 0 ]; then
  echo "Tests failed, push aborted"
  exit 1
fi

echo "All tests passed"
exit 0
