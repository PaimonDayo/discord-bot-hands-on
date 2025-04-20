import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ______________________________________________
// **Bot 初期化側で必要な設定**
// client = new Client({
//   intents: [
//     GatewayIntentBits.Guilds,
//     GatewayIntentBits.GuildMessages,
//     GatewayIntentBits.MessageContent,
//     GatewayIntentBits.GuildMessageReactions // ← 追加
//   ],
//   partials: [Partials.Message, Partials.Channel, Partials.Reaction]
// });
// ______________________________________________

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputDir = path.join(__dirname, "../../generated_images");
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

// Stable Diffusion WebUI API
const SD_API_URL = "https://f62dc7c0dae8d693b3.gradio.live";

// プロンプト設定
const QUALITY_PREFIX = "masterpiece, best quality, high resolution, detailed";
// 絶対に人物生成を避けるための強化ネガティブプロンプト
const DEFAULT_NEGATIVE_PROMPT =
  "EasyNegativeV2, (human:1.4), (person:1.4), (people:1.4), (face:1.4), (portrait:1.4), (body:1.4), (figure:1.4), (man:1.4), (woman:1.4), (nude:1.2), (erotic:1.2), (crowd:1.2), (group:1.2), text, watermark, signature";

function saveBase64Image(base64, filename) {
  const filePath = path.join(outputDir, filename);
  fs.writeFileSync(filePath, Buffer.from(base64, "base64"));
  return filePath;
}

async function generateImage(
  prompt,
  w = 256,
  h = 256,
  steps = 28,
  cfg = 8,
  neg = DEFAULT_NEGATIVE_PROMPT,
  quality = true,
) {
  const body = {
    prompt: quality ? `${QUALITY_PREFIX}, ${prompt}` : prompt,
    negative_prompt: neg,
    width: w,
    height: h,
    steps,
    cfg_scale: cfg,
    sampler_name: "DPM++ 2M Karras",
    batch_size: 1,
    restore_faces: false,
    tiling: false,
    enable_hr: false,
  };
  const res = await fetch(`${SD_API_URL}/sdapi/v1/txt2img`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export const data = { name: "generate111", description: "Stable Diffusion で画像生成" };

export async function execute(message, args) {
  // ヘルプ
  if (args[0]?.toLowerCase() === "help") {
    return message.reply(
      "```" +
        "!generate [プロンプト] --w=幅 --h=高さ --steps=N --cfg=SCALE --noq --neg=NEG\n" +
        "例: !generate 美しい風景 --w=256 --h=256" +
        "```",
    );
  }

  if (!args.length) {
    return message.reply("プロンプトを入力してください。`!generate help` で使い方を確認できます。");
  }

  const loading = await message.reply("画像生成中...");

  try {
    let prompt = args.join(" ");
    let w = 512,
      h = 512,
      steps = 28,
      cfg = 8,
      quality = true,
      neg = DEFAULT_NEGATIVE_PROMPT;

    // オプション解析
    const re = /--(\w+)(?:=([^,\s]+))?/g;
    let m;
    while ((m = re.exec(prompt))) {
      const [, key, val] = m;
      switch (key.toLowerCase()) {
        case "w":
        case "width":
          w = Number.parseInt(val);
          break;
        case "h":
        case "height":
          h = Number.parseInt(val);
          break;
        case "steps":
          steps = Number.parseInt(val);
          break;
        case "cfg":
          cfg = Number.parseFloat(val);
          break;
        case "noq":
          quality = false;
          break;
        case "neg":
          neg = val || DEFAULT_NEGATIVE_PROMPT;
          break;
      }
      prompt = prompt.replace(m[0], "").trim();
    }

    const { images } = await generateImage(prompt, w, h, steps, cfg, neg, quality);
    const filePath = saveBase64Image(images[0], `${Date.now()}.png`);

    await loading.edit(`プロンプト: “${prompt}”`);
    const sent = await message.channel.send({ files: [filePath] });

    // ❌ リアクションで削除
    await sent.react("❌");

    const filter = (reaction, user) =>
      reaction.emoji.name === "❌" && !user.bot && user.id === message.author.id;

    const collector = sent.createReactionCollector({ filter, time: 5 * 60 * 1000 });

    collector.on("collect", async (reaction, user) => {
      console.log(`❌ pressed by ${user.tag}`);
      try {
        await sent.delete();
      } catch (e) {
        console.error("削除失敗:", e);
      }
    });

    collector.on("end", (_, reason) => {
      if (reason === "time") sent.reactions.removeAll().catch(() => {});
    });
  } catch (err) {
    console.error(err);
    await loading.edit("エラーが発生しました。再試行してください。");
  }
}
