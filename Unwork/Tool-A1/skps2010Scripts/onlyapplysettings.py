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

    print("Apply settings...")

    r = requests.get(
        f'https://script.google.com/macros/s/AKfycbx0agAIW99KUpLdLQX1ghFaMu81uopoQ7zNqHe7s3D5gWIZO8cb7tLRTGV8Gb8F4saC/exec?lang={lang}&type=3'
    )
    data = r.json()
    for i in range(len(data['key'])):
        value = data['value'][i]
        if value != '':
            with open(f'settings/{data["key"][i]}', 'w') as f:
                f.write(str(value))

    print("Translating done!")


if __name__ == '__main__':
    main()
