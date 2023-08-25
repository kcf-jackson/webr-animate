build: 
	mkdir -p _site
	cp -r examples/assets _site/assets
	cp -r examples/css _site/css
	cp examples/sample.html _site/index.html
	cp examples/main.mjs _site/main.mjs
	cp examples/webr-serviceworker.js _site/webr-serviceworker.js
	cp examples/webr-worker.js _site/webr-worker.js