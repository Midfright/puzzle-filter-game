@echo off
if not exist venv (
    python -m venv venv
)
call venv\Scripts\activate
pip install flask opencv-python pillow numpy requests --quiet
start "" python app.py
timeout /t 3 >nul
start http://127.0.0.1:5000
