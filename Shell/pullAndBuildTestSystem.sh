#!/bin/sh

DATA7_BRANCH=${DATA7_BRANCH:-master}
DATA7_REPO=${DATA7_REPO:-https://github.com/jasonrohrer/OneLifeData7.git}
if [ ! -e OneLifeData7 ]
then
	git clone -b $DATA7_BRANCH $DATA7_REPO OneLifeData7
fi
MINORGEMS_BRANCH=${MINORGEMS_BRANCH:-master}
MINORGEMS_REPO=${MINORGEMS_REPO:-https://github.com/skps2010/minorGems.git}
if [ ! -e minorGems ]
then
	git clone -b $MINORGEMS_BRANCH $MINORGEMS_REPO minorGems
fi
ONELIFE_BRANCH=${ONELIFE_BRANCH:-master}
ONELIFE_REPO=${ONELIFE_REPO:-https://github.com/skps2010/OneLife.git}
if [ ! -e OneLife ]
then
	git clone -b $ONELIFE_BRANCH $ONELIFE_REPO OneLife
	exit 1
fi



cd minorGems
git pull --tags

cd ../OneLife
git pull --tags

cd ../OneLifeData7
git pull --tags

rm */cache.fcz
rm */bin_*cache.fcz


cd ../OneLife

./configure 1

cd gameSource

make

echo 1 > settings/useCustomServer.ini

sh ./makeEditor.sh

ln -s ../../OneLifeData7/animations .
ln -s ../../OneLifeData7/categories .
ln -s ../../OneLifeData7/ground .
ln -s ../../OneLifeData7/music .
ln -s ../../OneLifeData7/objects .
ln -s ../../OneLifeData7/overlays .
ln -s ../../OneLifeData7/scenes .
ln -s ../../OneLifeData7/sounds .
ln -s ../../OneLifeData7/sprites .
ln -s ../../OneLifeData7/transitions .
ln -s ../../OneLifeData7/dataVersionNumber.txt .


cd ../server
./configure 1
make


ln -s ../../OneLifeData7/categories .
ln -s ../../OneLifeData7/objects .
ln -s ../../OneLifeData7/transitions .
ln -s ../../OneLifeData7/tutorialMaps .
ln -s ../../OneLifeData7/dataVersionNumber.txt .


git for-each-ref --sort=-creatordate --format '%(refname:short)' --count=1 refs/tags/OneLife_v* | sed -e 's/OneLife_v//' > serverCodeVersionNumber.txt


echo 0 > settings/requireTicketServerCheck.ini
echo 1 > settings/forceEveLocation.ini
