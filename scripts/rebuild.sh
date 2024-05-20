#!/bin/bash

# 設置根目錄及其子目錄
ROOT_DIR=$(dirname "$0")
LIBS_DIR="$ROOT_DIR/libs"
APPS_DIR="$ROOT_DIR/apps"

# 獲取項目列表
get_projects() {
  local dir=$1
  local projects=()
  if [ -d "$dir" ]; then
    for project in "$dir"/*; do
      if [ -d "$project" ]; then
        projects+=("$(basename "$project")")
      fi
    done
  fi
  echo "${projects[@]}"
}

# 讀取 package.json 文件
get_package_json() {
  local dir=$1
  local project=$2
  local package_json_path="$dir/$project/package.json"
  # echo "Reading package.json from: $package_json_path"  # 調試信息
  if [ -f "$package_json_path" ]; then
    cat "$package_json_path"
  else
    echo "{}"  # 如果 package.json 不存在，返回一個空的 JSON 對象
  fi
}

# 執行 yarn build
build_project() {
  echo "Building project: $PWD"
  yarn build
}

# 對項目執行 yarn rebuild
rebuild_project() {
  local dir=$1
  local project=$2
  echo "Rebuilding project: $dir/$project"
  yarn --cwd "$dir/$project" rebuild
}

# 查找依賴指定 lib 的項目
find_dependent_projects() {
  local lib=$1
  local dir=$2
  local current_project=$3
  shift 3
  local projects=("$@")
  local dependent_projects=()
  for project in "${projects[@]}"; do
    # 排除當前項目自身
    if [ "$project" == "$current_project" ]; then
      continue
    fi
    local package_json=$(get_package_json "$dir" "$project")
    if echo "$package_json" | grep -q $lib; then
      dependent_projects+=("$project")
    fi
  done
  echo "${dependent_projects[@]}"
}

# 確保當前目錄在 libs 下
if [[ $PWD != */libs/* ]]; then
  echo "請在 libs 目錄下運行此腳本"
  exit 1
fi

# 獲取當前目錄名作為目標 lib 項目
TARGET_LIB=$(basename "$PWD")

# 執行指定的 lib 項目構建
build_project

# 獲取所有 libs 和 apps 項目
libs=($(get_projects "$LIBS_DIR"))
echo "搜尋到的 libs 目錄："
echo "${libs[@]}"

apps=($(get_projects "$APPS_DIR"))
echo "搜尋到的 apps 目錄："
echo "${apps[@]}"

# 查找依賴指定 lib 的項目
dependent_lib_projects=($(find_dependent_projects "$TARGET_LIB" "$LIBS_DIR" "$TARGET_LIB" "${libs[@]}"))
echo "依賴於 $TARGET_LIB 的 libs 項目："
echo "${dependent_lib_projects[@]}"
dependent_app_projects=($(find_dependent_projects "$TARGET_LIB" "$APPS_DIR" "$TARGET_LIB" "${apps[@]}"))
echo "依賴於 $TARGET_LIB 的 apps 項目："
echo "${dependent_app_projects[@]}"

對依賴的項目進行重建並記錄更新的項目
updated_projects=()

for project in "${dependent_lib_projects[@]}"; do
  rebuild_project "$LIBS_DIR" "$project"
  updated_projects+=("$LIBS_DIR/$project")
done

for project in "${dependent_app_projects[@]}"; do
  rebuild_project "$APPS_DIR" "$project"
  updated_projects+=("$APPS_DIR/$project")
done

# 返回更新了哪些專案
if [ ${#updated_projects[@]} -eq 0 ]; then
  echo "沒有項目需要更新"
else
  echo "更新了以下項目："
  for project in "${updated_projects[@]}"; do
    echo "$project"
  done
fi
