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

    print("Translating Menu...")

    r = requests.get(
        f'https://script.google.com/macros/s/AKfycbx0agAIW99KUpLdLQX1ghFaMu81uopoQ7zNqHe7s3D5gWIZO8cb7tLRTGV8Gb8F4saC/exec?lang={lang}&type=1'
    )
    data = r.json()

    for i in range(len(data['key'])):
        if data['value'][i] != '':
            menuItems[data['key'][i]] = data['value'][i]

    with open('languages/English.txt', 'w', encoding='utf-8') as f:
        for key in menuItems:
            f.write(f'{key} "{menuItems[key]}"\n')

if __name__ == '__main__':
    main()
