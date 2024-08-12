ncc build index.js --license licenses.txt && git add -f dist/ && git add .
git commit -m "1.22"
git tag -a -m "My first action release" v1.22
git push --follow-tags 