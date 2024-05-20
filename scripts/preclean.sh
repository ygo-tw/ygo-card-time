#!/bin/bash

# 檢查是否已經安裝 npm-run-all
if ! yarn list | grep -q "npm-run-all"; then
  echo "npm-run-all is not installed. Installing npm-run-all..."
  yarn add npm-run-all -W
else
  echo "npm-run-all is already installed."
fi

echo "PreCleanup complete!"