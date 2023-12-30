if [ ! -e SDL ]
then
    ln -s SDL-1.2.15/include/SDL .
fi
if [ ! -e freetype2 ]
then
    ln -s mingw32/include/freetype2 .
fi

if [ ! -e Winsock.h ]
then
    ln -s /usr/i686-w64-mingw32/include/winsock.h Winsock.h
fi
## other lib for linux-windows cross compile
if [ ! -e libpng16 ]
then
    ln -s mingw32/include/libpng16 .
fi
if [ ! -e zlib.h ]
then
    ln -s mingw32/include/zlib.h .
fi