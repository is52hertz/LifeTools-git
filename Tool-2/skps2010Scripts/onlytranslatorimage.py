#!/usr/bin/env python3
import requests
import os


def main():
    print('0: English')
    print('1: 正體中文')
    print('2: 简体中文')
    print('3: Українська')
    print('4: Deutsch')
    print('Please input 0~4: ')
    while 1:
        try:
            lang = int(input())
            if lang < 0 or lang > 4:
                raise ValueError
            break
        except ValueError:
            print('Please input 0~4: ')
            
    print("Translating Images...")

    r = requests.get(
        f'https://script.google.com/macros/s/AKfycbx0agAIW99KUpLdLQX1ghFaMu81uopoQ7zNqHe7s3D5gWIZO8cb7tLRTGV8Gb8F4saC/exec?lang={lang}&type=2'
    )
    data = r.json()
    for i in range(len(data['key'])):
        link = data['value'][i]
        if link != '':
            r = requests.get(link)
            if r.status_code != 200:
                print(f'File can\'t be found: {link}')
                continue
            with open(f'graphics/{data["key"][i]}', 'wb') as f:
                f.write(r.content)

    print("Translating done!")


if __name__ == '__main__':
    main()
