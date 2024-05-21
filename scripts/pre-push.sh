#!/bin/sh

# 取得異動的檔案列表
CHANGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(js|ts|tsx)$')

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
