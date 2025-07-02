#!/bin/bash

# AI勞基法顧問項目 - 備份恢復腳本 (backendF 版本)
# 使用方法: ./restore-backup.sh <備份檔案名>

BACKUP_DIR="/home/devbox/project/backendF"

if [ $# -eq 0 ]; then
    echo "使用方法: $0 <備份檔案名>"
    echo "例如: $0 project-backup-20250524-032118.tar.gz"
    echo ""
    echo "可用的備份檔案："
    ls -la "$BACKUP_DIR"/project-backup-*.tar.gz 2>/dev/null || echo "沒有找到備份檔案"
    exit 1
fi

BACKUP_FILE="$1"
RESTORE_DIR="/home/devbox/project-restored-$(date +%Y%m%d-%H%M%S)"

# 檢查備份檔案是否存在（支持相對路徑和絕對路徑）
if [ ! -f "$BACKUP_FILE" ] && [ ! -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
    echo "錯誤: 備份檔案 $BACKUP_FILE 不存在"
    echo "請檢查檔案是否在當前目錄或 $BACKUP_DIR 目錄中"
    exit 1
fi

# 如果是相對路徑，補充完整路徑
if [ ! -f "$BACKUP_FILE" ] && [ -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
    BACKUP_FILE="$BACKUP_DIR/$BACKUP_FILE"
fi

echo "正在恢復備份: $BACKUP_FILE"
echo "恢復目標目錄: $RESTORE_DIR"

# 創建恢復目錄
mkdir -p "$RESTORE_DIR"

# 解壓備份檔案
echo "正在解壓縮..."
tar -xzf "$BACKUP_FILE" -C "$RESTORE_DIR" --strip-components=1

if [ $? -eq 0 ]; then
    echo "備份恢復成功！"
    echo "項目已恢復到: $RESTORE_DIR"
    echo ""
    echo "接下來的步驟："
    echo "1. cd $RESTORE_DIR"
    echo "2. 安裝依賴:"
    echo "   - 後端: cd backend && npm install"
    echo "   - 前端: cd frontend && npm install (如果有前端項目)"
    echo "3. 配置環境變量 (.env 檔案)"
    echo "4. 啟動服務"
else
    echo "恢復失敗！"
    exit 1
fi 