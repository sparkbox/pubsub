'use strict'
const chokidar = require('chokidar')
const spawnSync = require('child_process').spawnSync

function run(cmd, args) {
  const child = spawnSync(cmd, args)
  console.log(`${child.output}`)
  console.log(`${cmd} ${args} exited with code ${child.signal}`)
}

// One-liner for current directory, ignores .dotfiles
chokidar.watch(['specs/**/*.js', 'src/**/*.js']).on('change', (event, path) => {
  run('npm', ['test'])
})
