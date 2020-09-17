const fs = require('fs')

fs.writeFileSync(
  './.env',
  `API_ACCESS_KEY=${process.env.API_ACCESS_KEY}\nNODE_ENV=production`,
)
