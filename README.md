# Puzzle Filter Game

CS 176 Computer Vision - Mini Project 1
Puzzle game

Team Members:
- Joaquin Heffron
- Antonio Torres
- John Muji

## Files
- static/js/game.js for game mechanics (drag-drop, etc..)

- templates/base.html for navbar
- templates/game.html for actual game page
- template/index.html for start page (with start button)

- utils/game_logic.py for creating game session, validating moves, maybe scoring?
- utils/image_processor.py for image fetching, filters, and slicing


## Setup Instructions
1. Clone this github

2. Virtual Environment (Use when working)
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate
```
3. Install dependencies
```bash
pip install -r requirements.txt

# Alternative
pip install flask opencv-python pillow numpy requests
```


## Testing
1. Simply run app.py from the main directory or execute run.bat
```bash
python app.py
```
2. Open in browser using the given http:// link
