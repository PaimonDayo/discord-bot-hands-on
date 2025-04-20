export const data = {
    name: 'generatehelp',
    description: 'Stable Diffusion画像生成の詳細ヘルプを表示します',
  };
  
  export async function execute(message, args) {
    // 詳細なヘルプメッセージを送信
    await message.reply(
      "```\n" +
      "【 Stable Diffusion 画像生成コマンド詳細ガイド 】\n\n" +
      "基本コマンド:\n" +
      "  !generate [プロンプト]  - 画像を生成します\n\n" +
      "オプション:\n" +
      "  --w=数値    : 画像の幅を指定 (デフォルト: 512)\n" +
      "  --h=数値    : 画像の高さを指定 (デフォルト: 512)\n" +
      "  --steps=数値: 生成ステップ数を指定 (デフォルト: 20)\n" +
      "  --cfg=数値  : CFGスケールを指定 (デフォルト: 7)\n" +
      "  --noup      : アップスケールを無効化\n" +
      "  --neg=文字列: ネガティブプロンプトを指定\n\n" +
      "プロンプトのコツ:\n" +
      "- 具体的な説明を入れる: 「風景」より「山の湖に映る朝日の風景」の方が良い結果が得られます\n" +
      "- 画質を指定する: 「4k, high quality, detailed」などを追加するとクオリティが向上します\n" +
      "- スタイルを指定する: 「oil painting」「watercolor」「digital art」など\n" +
      "- カンマで区切る: 「beautiful landscape, mountains, lake, sunrise, 4k, detailed」\n\n" +
      "解像度のプリセット:\n" +
      "- 正方形: --w=512 --h=512 (デフォルト)\n" +
      "- ポートレート: --w=512 --h=768\n" +
      "- ランドスケープ: --w=768 --h=512\n" +
      "- ワイド: --w=832 --h=512\n\n" +
      "高度な使用例:\n" +
      "!generate beautiful landscape, mountains, lake, sunrise, 4k, detailed --w=768 --h=512 --steps=30 --cfg=7.5\n" +
      "!generate portrait of a woman, photorealistic, studio lighting --w=512 --h=768 --steps=25 --noup\n" +
      "!generate cyberpunk city, neon lights, rainy night, detailed --neg=ugly, blurry, bad quality\n" +
      "```"
    );
  }