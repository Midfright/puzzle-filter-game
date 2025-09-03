from flask import Flask, render_template, jsonify, request
import os

app = Flask(__name__)
app.secret_key = 'dev-key-change-in-production'

# Routes
@app.route('/')
def home():
    # Home page for start game button
    return render_template('index.html')

@app.route('/game')
def game():
    # Main game page
    return render_template('game.html')

@app.route('/api/new-game', methods=['POST'])
def new_game():
    #TODO: create game session, fetch image, return game id
    return jsonify({'status': 'success', 'game_id': '12345'})

@app.route('/api/get-pieces', methods=['GET'])
def get_pieces():
    #TODO: slice image into pieces, apply filter(s)
    return jsonify({'pieces': []})

@app.route('/api/check-solution', methods=['POST'])
def check_solution():
    #TODO: check piece positions, calculate score(if we want scores), return result
    return jsonify({'correct': False})

if __name__ == '__main__':
    app.run(debug=True, port=5000)