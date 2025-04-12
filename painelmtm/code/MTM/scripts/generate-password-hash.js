const crypto = require('crypto');

// Função para gerar o hash
function generateHash(password) {
  return crypto.createHash('sha256')
    .update(password)
    .digest('hex');
}

// Se quiser testar direto no terminal
const password = process.argv[2];
if (password) {
  console.log('Hash gerado:', generateHash(password));
}

module.exports = { generateHash };
