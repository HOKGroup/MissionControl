#!/bin/bash

# copy README, LICENSE and package.json to dist folder
cp ./README.md ./dist/
cp ./LICENSE ./dist/
cp ./package.json ./dist/

# update package.json's after build
node scripts/postbuild.js
