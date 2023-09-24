#!/bin/sh

if [ ! -e minorGems ]
then
	git clone https://github.com/selb/YumLifeMinorGems.git	
fi

if [ ! -e OneLife ]
then
	git clone git@github.com:is52hertz/YumWorld.git
fi

./configure 1
cd gameSource

rm ../../minorGems/game/platforms/SDL/gameSDL.o

echo
echo "Building latest version of game client..."

make

echo
echo "Building latest version of editor..."

./makeEditor.sh

echo
echo "Building latest version of server..."

cd ../server
make


echo
echo -n "Press ENTER to close."

read userIn
