@echo off
chcp 65001
rem ###############################################################
rem # poc起動bat
rem ###############################################################

rem ###############################################################
rem # 処理実行
rem ###############################################################

set PYTHONDONTWRITEBYTECODE=1

echo %date% %time% %実行
python main.py

rem エラーチェック
if %errorlevel% neq 0 (
    echo %date% %time% 異常終了しました。
    exit /B %errorlevel%
)

echo %date% %time% 正常終了しました。