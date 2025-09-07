'''
image_processor.py
'''

import cv2
import numpy as np
from PIL import Image, ImageTk
import os
import random
import base64
import io

'''
FROM THE tinker_app.py template, for reference or use if want

class ImageFilterApp:  
    def __init__(self, root):  
        self.root = root  
        self.root.title("Image Filter App")  

        # Widgets  
        self.load_btn = Button(root, text="Load Image", command=self.load_image)  
        self.filter_var = StringVar(value="Grayscale")  
        self.filter_menu = OptionMenu(root, self.filter_var, "Grayscale", "Gaussian Blur", "Canny Edge", command=self.apply_filter)  
        self.kernel_slider = Scale(root, from_=1, to=15, orient=HORIZONTAL, label="Kernel Size")  
        self.canvas_orig = Canvas(root, width=400, height=400)  
        self.canvas_filtered = Canvas(root, width=400, height=400)  

        # Layout  
        self.load_btn.pack()  
        self.filter_menu.pack()  
        self.kernel_slider.pack()  
        self.canvas_orig.pack(side=LEFT)  
        self.canvas_filtered.pack(side=RIGHT)  

    def load_image(self):  
        path = filedialog.askopenfilename()  
        self.image = cv2.cvtColor(cv2.imread(path), cv2.COLOR_BGR2RGB)  
        self.display_image(self.image, self.canvas_orig)  

    def apply_filter(self, _=None):  
        if not hasattr(self, 'image'): return  
        kernel = self.kernel_slider.get()  
        kernel = kernel + 1 if kernel % 2 == 0 else kernel  # Ensure odd kernel  

        choice = self.filter_var.get()  
        if choice == "Grayscale":  
            filtered = cv2.cvtColor(self.image, cv2.COLOR_RGB2GRAY)  
            filtered = cv2.cvtColor(filtered, cv2.COLOR_GRAY2RGB)  
        elif choice == "Gaussian Blur":  
            filtered = cv2.GaussianBlur(self.image, (kernel, kernel), 0)  
        elif choice == "Canny Edge":  
            gray = cv2.cvtColor(self.image, cv2.COLOR_RGB2GRAY)  
            filtered = cv2.Canny(gray, 100, 200)  
            filtered = cv2.cvtColor(filtered, cv2.COLOR_GRAY2RGB)  

        self.display_image(filtered, self.canvas_filtered)  

    def display_image(self, image, canvas):  
        image_pil = Image.fromarray(image)  
        image_tk = ImageTk.PhotoImage(image_pil)  
        canvas.create_image(0, 0, anchor=NW, image=image_tk)  
        canvas.image = image_tk  # Prevent garbage collection  

root = Tk()  
app = ImageFilterApp(root)  
root.mainloop()  

'''

def fetch_image(stage_num):
    # image fetching logic
    # i think this should be from local storage (static/images/)
    # returns PIL image object

    # make the filename, e.g., "stage_1.png"
    filename = f"stage_{stage_num}.png"
    image_path = os.path.join("static", "images", filename)
    
    # open and return the image
    image = Image.open(image_path)

    #print(image)
    return image
    

def slice_image(image, stage_num):
    # need to calculate piece dimensions, slice image into grid, and return list of pieces
    # returns list of dictionaries (with information of piece id, iamge data, filter)

    difficulty = stage_num + 1 
    width, height = image.size
    piece_width = width // difficulty
    piece_height = height // difficulty

    pieces_list = []
    piece_id = 0

    for row in range(difficulty):
        for col in range(difficulty):
            left = col * piece_width
            upper = row * piece_height

            # for the last column/row, include any remaining pixels 
            right = (left + piece_width) if col < difficulty - 1 else width
            lower = (upper + piece_height) if row < difficulty - 1 else height
            piece_image = image.crop((left, upper, right, lower))
            pieces_list.append({
                'id': piece_id,
                'image_data': piece_image,
                'filter': None  
            })
            piece_id += 1

    #print(pieces_list)
    return pieces_list

def apply_filter(image, filter_name):
    # filters using OpenCV
    # we should have at least 5 filters as per the instructions (grayscale, blur, etc..)
    # returns image?

    cv_img = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)

    if filter_name == 'grayscale':
        filtered_img = Image.fromarray(cv2.cvtColor(cv_img, cv2.COLOR_BGR2GRAY))

    elif filter_name == 'blur':
        filtered = cv2.GaussianBlur(cv_img, (11, 11), 0)
        filtered_img = Image.fromarray(cv2.cvtColor(filtered, cv2.COLOR_BGR2RGB))

    elif filter_name == 'edge':
        gray = cv2.cvtColor(cv_img, cv2.COLOR_BGR2GRAY)
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        edges = cv2.Canny(blurred, 100, 200)
        filtered_img = Image.fromarray(cv2.cvtColor(edges, cv2.COLOR_GRAY2RGB))

    elif filter_name == 'threshold':
        gray = cv2.cvtColor(cv_img, cv2.COLOR_BGR2GRAY)
        ret, thresh = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY)
        filtered_img = Image.fromarray(thresh)

    elif filter_name == 'invert':
        filtered = cv2.rotate(cv_img, cv2.ROTATE_90_CLOCKWISE)
        filtered_img = Image.fromarray(cv2.cvtColor(filtered, cv2.COLOR_BGR2RGB))

    else:
        raise ValueError(f"No filter: {filter_name}")
    
    #print(filtered_img)
    return filtered_img

def get_filter_list():
    filter_list = ['grayscale','blur','edge','threshold','invert']
    
    #print(filter_list)
    return filter_list

def shuffle_pieces(pieces_list):
    # for randomizing/shuffling pieces

    shuffled_pieces = pieces_list[:]  
    random.shuffle(shuffled_pieces)
    #print(shuffled_pieces)
    return shuffled_pieces

def piece_to_base64(pieces_list):
    # numpy array to base64 string 
    # for passing images from python to js

    base64_pieces = []
    for piece in pieces_list:
        PIL_img = piece['image_data']
        buffered = io.BytesIO()
        PIL_img.save(buffered, format="PNG")
        img_bytes = buffered.getvalue()
        img_base64 = base64.b64encode(img_bytes).decode('utf-8')
        b64_piece = piece.copy()
        b64_piece['image_data'] = img_base64
        base64_pieces.append(b64_piece)
    
    #print(base64_pieces)
    return base64_pieces


