@echo off
chcp 65001

if not exist "node_modules" (
    echo node_modules not found. Running npm install...
    call npm install
) else (
    echo node_modules exists. Skipping npm install.
)

npm start