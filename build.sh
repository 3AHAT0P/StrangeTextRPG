rm -rf ./dist
tsc -P tsconfig.json
ln package.json ./dist/
ln package-lock.json ./dist/
ln tsconfig.json ./dist/

rm ./dist/.env.json

cd ./dist

ln -s ../assets ./assets

cd ../
