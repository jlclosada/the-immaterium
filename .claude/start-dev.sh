#!/bin/bash
export PATH="/usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin:$PATH"
cd /Users/josecaceres/Code/proyectos/warhammer-galaxy
exec /usr/local/bin/node node_modules/.bin/vite --port 5175 --host localhost
