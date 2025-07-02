#!/bin/bash

# 後端服務監控腳本
# 檢查後端服務是否運行，如果沒有運行則自動重啟

SERVICE_NAME="node src/app.js"
PROJECT_DIR="/home/devbox/project/backend"
LOG_FILE="/home/devbox/project/monitor.log"

# 記錄日誌函數
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

# 檢查服務是否運行
check_service() {
    pgrep -f "$SERVICE_NAME" > /dev/null
    return $?
}

# 啟動服務
start_service() {
    log_message "嘗試啟動後端服務..."
    cd "$PROJECT_DIR"
    
    # 殺死可能存在的舊進程
    pkill -f "$SERVICE_NAME" 2>/dev/null
    sleep 2
    
    # 啟動新服務
    npm run dev > /tmp/backend.log 2>&1 &
    
    # 等待服務啟動
    sleep 5
    
    if check_service; then
        log_message "後端服務啟動成功"
        return 0
    else
        log_message "後端服務啟動失敗"
        return 1
    fi
}

# 主監控邏輯
main() {
    log_message "開始檢查後端服務狀態..."
    
    if check_service; then
        log_message "後端服務正常運行"
    else
        log_message "後端服務未運行，正在重啟..."
        start_service
        
        if [ $? -eq 0 ]; then
            log_message "服務重啟成功"
        else
            log_message "服務重啟失敗，請手動檢查"
        fi
    fi
}

# 執行監控
main 