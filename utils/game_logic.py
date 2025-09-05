'''
game_logic.py
'''

def get_grid_size(stage_num):
    # returns integer
    # really only need this if we want different grid size/puzzle slice number
    pass

def generate_puzzle(stage_num):
    # use image_processor functions like fetch, slide, apply filters
    # return dictionary with puzzle data like stage, grid size, pieces, original order
    pass

def validate_solution(cur_pos, orig_pos):
    # get two lists of piece positions and compare
    # return boolean to confirm validity
    pass

def get_stage_config(stage_num):
    # stage, filters, puzzle slicing(3x3, 4x4)
    pass