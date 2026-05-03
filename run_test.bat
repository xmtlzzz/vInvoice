@echo off
cd /d "C:\Users\Administrator\Desktop\code\vibe\vInvoice"
node test_api.mjs > test_output.txt 2>&1
echo DONE >> test_output.txt
