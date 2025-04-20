export const data = {
  name: 'hello',
  description: '挨拶を返すコマンド',
};

export async function execute(message, args) {
  // 引数があればそれを名前として挨拶、なければデフォルト
  const name = args[0] || message.author.username;
  await message.reply(`こんにちは、${name}さん！`);
}
