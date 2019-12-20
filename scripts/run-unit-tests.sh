# Runs unit tests after performing a check to see whether any test files exist.
# Note: Script checks for test files named as '*.unit.ts'.

count=`find ./src -name '*.unit.ts' | wc -l`

if [ "$count" -gt "0" ]; then
    mocha --reporter spec --compilers ts:ts-node/register '**/*.unit.ts'
else
    echo -e "Write some tests!"
fi
