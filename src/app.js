import dotenv from 'dotenv';
dotenv.config();

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url'; // ← 追加ココ！
import { Client, Collection, GatewayIntentBits } from 'discord.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// コマンドを格納する Collection を初期化
client.commands = new Collection();

// コマンドファイルが格納されているディレクトリのパス（例：src/commands）
const commandsPath = path.resolve('./src/commands');

// コマンドファイルを読み込み、.js ファイルのみフィルタ
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// 各コマンドファイルを読み込み、client.commands に追加
for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = await import(pathToFileURL(filePath).href); // ← ここ修正ポイント
  if (command.data && command.execute) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(`[WARN] ${filePath} は必要な "data" または "execute" プロパティを持っていません`);
  }
}

// メッセージ受信時のイベントリスナー（コマンドの実行部分）
client.on("messageCreate", async (message) => {
  if (!message.content.startsWith('!') || message.author.bot) return;

  const args = message.content.slice(1).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  if (!client.commands.has(commandName)) return;

  const command = client.commands.get(commandName);
  try {
    await command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply('コマンドの実行中にエラーが発生しました。');
  }
});

// Bot の準備完了時の処理
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// Bot にログイン
client.login(process.env.DISCORD_BOT_TOKEN);
