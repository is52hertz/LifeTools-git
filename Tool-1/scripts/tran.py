import os
from tkinter import filedialog
from tkinter import Tk

def find_keys(filetype):
    keys = []
    translate_prefix = 'translate("'
    
    # 搜索当前目录下所有文件
    for filename in os.listdir('.'):
        
        # 如果文件的后缀名和用户选择的文件后缀名一致
        if filename.endswith(filetype):
            
            # 尝试打开并读取文件
            try:
                with open(filename, 'r') as file:
                    # 逐行查找含有translate("的内容
                    for line in file:
                        if translate_prefix in line:
                            # 找到translate("后面的内容
                            start_index = line.index(translate_prefix) + len(translate_prefix)
                            end_index = line.index('"', start_index)
                            key = line[start_index:end_index]
                            keys.append(key)
            except FileNotFoundError:
                print(f"The file {filename} does not exist.")
            except ValueError:
                print("There might be something wrong with the translate format.")
    
    return keys


def write_keys(keys_file, keys):
    with open(keys_file, 'w') as file:
        # 将找到的结果一行一行写入文件中
        for key in keys:
            file.write(key + "\n")


def main():
    # 利用Tk选择文件类型
    root = Tk()
    root.withdraw()  # 隐藏Tk窗口
    
    # 打开文件对话框让用户选择文件后缀
    filetypes = filedialog.askopenfilenames()
    # 获取用户选择的文件后缀
    filetype = os.path.splitext(filetypes[0])[1]
    
    # 搜索文件并将结果写入文件
    keys = find_keys(filetype)
    write_keys("keys.txt", keys)

if __name__ == "__main__":
    main()

