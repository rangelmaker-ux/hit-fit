#!/usr/bin/env node
/**
 * HIT-FIT 2.0 | Script Administrativo de Provisionamento Seguro de Contas
 * Uso:
 *   HITFIT_ADMIN_KEY=seu_segredo node scripts/admin-setup.mjs [--url https://hit-fit-one.vercel.app]
 *
 * Nunca armazena ou registra o PIN no repositório.
 */

import readline from 'node:readline';

const args = process.argv.slice(2);
let targetUrl = 'https://hit-fit-one.vercel.app';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--url' && args[i + 1]) {
    targetUrl = args[i + 1].replace(/\/$/, '');
    i++;
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question, isPassword = false) {
  return new Promise((resolve) => {
    if (!isPassword) {
      rl.question(question, (answer) => resolve(answer.trim()));
    } else {
      process.stdout.write(question);
      const stdin = process.stdin;
      const oldRaw = stdin.isRaw;
      if (stdin.setRawMode) stdin.setRawMode(true);
      stdin.resume();

      let pass = '';
      const onData = (ch) => {
        const char = ch.toString();
        if (char === '\n' || char === '\r' || char === '\u0004') {
          if (stdin.setRawMode) stdin.setRawMode(oldRaw);
          stdin.removeListener('data', onData);
          process.stdout.write('\n');
          resolve(pass.trim());
        } else if (char === '\u0003') {
          process.exit(1);
        } else if (char === '\b' || char === '\x7f') {
          if (pass.length > 0) {
            pass = pass.slice(0, -1);
            process.stdout.write('\b \b');
          }
        } else {
          pass += char;
          process.stdout.write('*');
        }
      };
      stdin.on('data', onData);
    }
  });
}

async function main() {
  console.log('\n======================================================');
  console.log(' HIT-FIT 2.0 | Provisionamento Inicial do Proprietário');
  console.log(' Destino:', targetUrl);
  console.log('======================================================\n');

  let adminKey = process.env.HITFIT_ADMIN_KEY || process.env.HITFIT_SETUP_SECRET;
  if (!adminKey) {
    adminKey = await ask('Informe a Chave Administrativa (HITFIT_ADMIN_KEY): ', true);
  }

  if (!adminKey || adminKey.length < 16) {
    console.error('❌ Erro: Chave administrativa deve ter no mínimo 16 caracteres.');
    rl.close();
    process.exit(1);
  }

  const pin = await ask('Defina o PIN inicial compartilhado (6 dígitos numéricos): ', true);
  if (!/^\d{6}$/.test(pin)) {
    console.error('❌ Erro: O PIN deve conter exatamente 6 dígitos numéricos.');
    rl.close();
    process.exit(1);
  }

  const confirmPin = await ask('Confirme o PIN inicial de 6 dígitos: ', true);
  if (pin !== confirmPin) {
    console.error('❌ Erro: A confirmação do PIN não confere.');
    rl.close();
    process.exit(1);
  }

  rl.close();

  console.log('\nEnviando requisição de provisionamento seguro...');

  try {
    const res = await fetch(`${targetUrl}/api/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Key': adminKey
      },
      body: JSON.stringify({
        action: 'setup_pins',
        adminKey,
        pin,
        confirmPin
      })
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error(`\n❌ Falha na inicialização (HTTP ${res.status}):`, data.error || data);
      if (data.code === 'ADMIN_KEY_NOT_CONFIGURED') {
        console.error('👉 Certifique-se de configurar HITFIT_ADMIN_KEY no painel da Vercel!');
      }
      process.exit(1);
    }

    console.log('\n✅ SUCESSO:', data.message || 'Contas inicializadas com sucesso!');
    console.log('As identidades Rangel e Jack já estão ativas e prontas para login.');
  } catch (err) {
    console.error('\n❌ Erro de conexão:', err.message);
    process.exit(1);
  }
}

main();
