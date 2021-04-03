if [[ "$1" = "vanilla" ]]; then
    # Set up for Vanilla Server
    mv -f ./package-vanilla.json package.js
    mv -f ./app-vanilla app
    mv -f ./server-vanilla.js server.js
elif [[ "$1" = "express" ]]; then
    # Set up for Express Server
    mv -f ./package-express.json package.js
    mv -f ./app-express app
    mv -f ./server-express.js server.js
else
    echo "first argument must be either \"vanilla\" or \"express\"."
    exit 1
fi

# Clean remaining files and folders
rm -f package-*.json
rm -fr ./app-*
rm -f ./server-*.js

# Install deps and dev deps
mv ./_.env ./.env
npm install --save-dev