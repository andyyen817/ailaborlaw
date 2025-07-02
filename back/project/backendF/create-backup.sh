#!/bin/bash

# AI勞基法顧問項目 - 自動備份腳本 (backendF 版本)
# 備份項目檔案，排除node_modules目錄，存儲在 backendF 目錄

PROJECT_DIR="/home/devbox/project"
BACKUP_DIR="/home/devbox/project/backendF"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_NAME="project-backup-$TIMESTAMP.tar.gz"
BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"

echo "開始備份 AI勞基法顧問項目..."
echo "項目目錄: $PROJECT_DIR"
echo "備份檔案: $BACKUP_PATH"

# 檢查項目目錄是否存在
if [ ! -d "$PROJECT_DIR" ]; then
    echo "錯誤: 項目目錄 $PROJECT_DIR 不存在"
    exit 1
fi

# 檢查備份目錄是否存在，不存在則創建
if [ ! -d "$BACKUP_DIR" ]; then
    echo "創建備份目錄: $BACKUP_DIR"
    mkdir -p "$BACKUP_DIR"
fi

# 創建備份
echo "正在創建備份..."
cd /home/devbox
tar --exclude='node_modules' \
    --exclude='*/node_modules' \
    --exclude='**/node_modules' \
    --exclude='*.log' \
    --exclude='logs/*.log' \
    --exclude='.git' \
    --exclude='dist' \
    --exclude='build' \
    --exclude='.DS_Store' \
    --exclude='Thumbs.db' \
    -czf "$BACKUP_PATH" project/

if [ $? -eq 0 ]; then
    # 獲取備份檔案大小
    BACKUP_SIZE=$(ls -lh "$BACKUP_PATH" | awk '{print $5}')
    FILE_COUNT=$(tar -tzf "$BACKUP_PATH" | wc -l)
    
    echo "備份成功完成！"
    echo "備份檔案: $BACKUP_PATH"
    echo "檔案大小: $BACKUP_SIZE"
    echo "包含檔案數量: $FILE_COUNT"
    
    # 檢查是否排除了node_modules
    NODE_MODULES_COUNT=$(tar -tzf "$BACKUP_PATH" | grep -c node_modules || echo 0)
    if [ "$NODE_MODULES_COUNT" -eq 0 ]; then
        echo "✓ node_modules 目錄已成功排除"
    else
        echo "⚠ 警告: 發現 $NODE_MODULES_COUNT 個node_modules相關檔案"
    fi
    
    # 清理舊備份（保留最近5個）
    echo ""
    echo "清理舊備份檔案..."
    cd "$BACKUP_DIR"
    ls -t project-backup-*.tar.gz 2>/dev/null | tail -n +6 | xargs -r rm -f
    echo "保留最近5個備份檔案"
    
    echo ""
    echo "現有備份檔案："
    ls -lht project-backup-*.tar.gz 2>/dev/null | head -5
else
    echo "備份失敗！"
    exit 1
fi

echo ""
echo "備份完成！使用以下命令恢復備份："
echo "cd /home/devbox/project/backendF && ./restore-backup.sh $BACKUP_NAME" 