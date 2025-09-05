'''
app.py
'''

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

# Ideally, these use the functions from utils
# placeholder return calls

@app.route('/api/get-puzzle/<int:stage>')
def get_puzzle(stage):
    # handle all puzzle requests
    # return complete puzzle data for stage
    return jsonify({'stage': 1, 'grid_size':3, 'pieces':[...], 'correct_order':[...]})

@app.route('/api/validate-solution', methods=['POST']) 
def validate_solution():
     # validates solution
    pass

if __name__ == '__main__':
    app.run(debug=True, port=5000)