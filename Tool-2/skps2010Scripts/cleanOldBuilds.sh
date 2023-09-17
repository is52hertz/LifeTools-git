find . -type f -name '*.o' -exec rm {} +
find . -type f -name '*.dep' -exec rm {} +
find . -type f -name '*.cpp' -exec rm {} +
find . -type f -name '*.h' -exec rm {} +
rm OneLife/gameSource/Makefile.minorGems_dependencies
echo 
echo "Projects cleaned. Ready for compilation."