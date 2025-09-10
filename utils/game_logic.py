'''
game_logic.py
'''

import utils.image_processor as ip
import random

def get_grid_size(stage_num):
    return stage_num + 1

def generate_puzzle(stage_num, crazy=False):
    # use image_processor functions like fetch, slide, apply filters
    # return dictionary with puzzle data like stage, grid size, pieces, original order

    filter_list = ip.get_filter_list()
    filter_to_apply = filter_list[(stage_num - 1) % len(filter_list)]

    image = ip.fetch_image(stage_num, randomize=crazy)
    pieces = ip.slice_image(image, stage_num)

    for piece in pieces:
        if crazy:
            filter_to_apply = filter_list[random.randint(0, len(filter_list) - 1)]
        piece['image_data'] = ip.apply_filter(piece['image_data'], filter_to_apply)
        piece['filter'] = filter_to_apply
    
    shuffled_pieces = ip.shuffle_pieces(pieces)
    shuffled_pieces = ip.piece_to_base64(shuffled_pieces)

    return {
        'stage_num': stage_num,
        'grid_size': get_grid_size(stage_num),
        'shuffled_pieces': shuffled_pieces,
        'correct_order': [piece['id'] for piece in pieces],
    }

def validate_solution(cur_pos, orig_pos):

    # accepts ordered list of piece positions represented by piece id
    # returns boolean to confirm validity

    if not isinstance(cur_pos, list) or not isinstance(orig_pos, list):
        raise ValueError("cur_pos and orig_pos must be lists")
    if not all(isinstance(pos, int) for pos in cur_pos) or not all(isinstance(pos, int) for pos in orig_pos):
        raise ValueError("cur_pos and orig_pos must be lists of integers")

    return cur_pos == orig_pos