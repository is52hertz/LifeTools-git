#!/bin/sh

DATA7_BRANCH=${DATA7_BRANCH:-My1}
DATA7_REPO=${DATA7_REPO:-https://github.com/is52hertz/OneLifeData7.git}
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

cd settings

echo "Passworld:"
read passworld
echo $passworld > clientPassword.ini

echo "Email"
read email
echo $email > mapRequestAllowAccounts.ini

echo "EatBonus (2) "
read eat
echo $eat > eatBonus.ini
