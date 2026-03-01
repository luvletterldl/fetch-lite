set -o errexit
MOD_NAME=${CI_PROJECT_NAME}
TAR="${MOD_NAME}.tar.gz"

cd packages/docs
npm install
npm run b

# artifact directory
rm -rf ../../output

mkdir -p ../../output/webroot/documents/${MOD_NAME}
cp -r ./dist/* ../../output/webroot/documents/${MOD_NAME}

cd ../../output
tar zcvf $TAR ./webroot
echo "build end"
