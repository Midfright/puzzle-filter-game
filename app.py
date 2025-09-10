'''
app.py
'''

from flask import Flask, render_template, jsonify, request
import os
import utils.game_logic as gl

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

    if not stage or not isinstance(stage, int):
        return jsonify({'error': 'Stage number is not an integer'}), 400
    if stage < 1:
        return jsonify({'error': 'Stage number is too low'}), 400
    if stage > 5:
        return jsonify({'error': 'Stage number is too high'}), 400
    
    crazy = request.args.get('crazy', 'false').lower() == 'true'

    return jsonify(gl.generate_puzzle(stage, crazy))

@app.route('/api/validate-solution', methods=['POST']) 
def validate_solution():
    solution_data = request.get_json(force=True)
    try:
        correct = gl.validate_solution(solution_data['cur_pos'], solution_data['orig_pos'])

        # next stage is just the stage number + 1
        if correct:
            next_stage = int(solution_data['stage_num']) + 1
            # cap at 6
            if next_stage > 6:
                next_stage = 6
        else:
            next_stage = int(solution_data['stage_num'])

        return jsonify({'correct': correct, 'next_stage': next_stage})
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    

if __name__ == '__main__':
    app.run(debug=True, port=5000)