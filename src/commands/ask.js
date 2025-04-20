import { GoogleGenerativeAI } from "@google/generative-ai";
import { Client, Collection, GatewayIntentBits } from "discord.js";
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env["GEMINI_API_KEY"]);
// 使用するモデルを取得（必要なら非同期処理の場合は await する）
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const client = new Client({
  intents: ["Guilds", "GuildMembers", "GuildMessages", "MessageContent"]
});

// （コマンドハンドラなど、他の初期化処理が続く ...）

client.on("messageCreate", async (message) => {
  if (!message.content.startsWith("!ask") || message.author.bot) return;

  const prompt = message.content.slice(5).trim();
  if (!prompt) {
    await message.reply("質問内容を入力してください。");
    return;
  }

  try {
    // Gemini API にプロンプトを投げる
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    // response.text() が Promise を返す場合もあるので await の可能性を考慮
    const text = typeof response.text === "function" 
                   ? await response.text() 
                   : response.text;

    await message.reply(text);
  } catch (error) {
    console.error(error);
    await message.reply(`API リクエスト中にエラーが発生しました。\n${error.message}`);
  }
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.login(process.env.DISCORD_BOT_TOKEN);
