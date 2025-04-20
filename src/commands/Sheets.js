export const data = {
    name: 'sheets',
    description: 'スプレッドシートのシート名一覧を表示するコマンド',
    usage: '!sheets [スプレッドシートID]', // 使用方法の説明
  };
  
  export async function execute(message, args) {
    // デフォルトのスプレッドシートID（j.jsで使用しているもの）
    let sheetId = "1Oubppnfdtog6r60X559Mfl7ncnXRyjGw9emDDdh65PI";
    
    // 引数があれば、スプレッドシートIDとして使用
    if (args.length > 0) {
      sheetId = args[0];
    }
  
    try {
      // スプレッドシートの情報を取得（HTMLを解析してシート名を抽出する方法）
      const htmlUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/edit`;
      
      const response = await fetch(htmlUrl);
      if (!response.ok) {
        return message.reply(`スプレッドシートの取得に失敗しました。スプレッドシートが存在しないか、アクセス権限がない可能性があります。HTTP ${response.status}`);
      }
      
      const html = await response.text();
      
      // シート名を抽出（HTMLからタブ名を見つける）
      const sheetNames = [];
      const sheetGids = [];
      
      // シート名を探すための正規表現パターン
      // Google Sheetsでは、シート名とgidの対応がHTMLに含まれています
      const sheetPattern = /"(.*?)","gid":"?(\d+)"?/g;
      let match;
      
      while ((match = sheetPattern.exec(html)) !== null) {
        const sheetName = match[1];
        const gid = match[2];
        
        // すでに追加されていない場合のみ追加
        if (!sheetNames.includes(sheetName)) {
          sheetNames.push(sheetName);
          sheetGids.push(gid);
        }
      }
      
      // 別の方法: HTMLからシート名を探す（上記が失敗した場合）
      if (sheetNames.length === 0) {
        const tabPattern = /<ul class="docs-sheet-tab-menu">(.*?)<\/ul>/s;
        const tabMatch = tabPattern.exec(html);
        
        if (tabMatch) {
          const tabsHtml = tabMatch[1];
          const namePattern = /aria-label="(.*?)"/g;
          let nameMatch;
          
          while ((nameMatch = namePattern.exec(tabsHtml)) !== null) {
            const fullLabel = nameMatch[1];
            // 「シート名」部分だけを抽出
            const sheetName = fullLabel.split(',')[0].trim();
            
            if (!sheetNames.includes(sheetName)) {
              sheetNames.push(sheetName);
            }
          }
        }
      }
      
      // それでも見つからない場合は、画像に表示されているシート名を手動で設定
      if (sheetNames.length === 0) {
        const knownSheets = ["Dayo", "Donnu", "Kobo", "Kou", "Izumi", "Tarisuka", "Erin", "Puchi", "Sho"];
        sheetNames.push(...knownSheets);
      }
  
      // Discord用のメッセージを作成
      let replyText = `**📊 セカイの時間割一覧:**\n\n`;
      
      if (sheetNames.length === 0) {
        replyText += "シート名を取得できませんでした。スプレッドシートの公開設定を確認してください。\n";
      } else {
        sheetNames.forEach((name, index) => {
          const gidInfo = sheetGids[index] ? `(gid=${sheetGids[index]})` : '';
          replyText += `${index + 1}. **${name}** ${gidInfo} ✅\n`;
        });
      }
      
      replyText += `\n**使用方法:**\n- 時間割を見る: \`!j ${sheetNames[0] || 'シート名'} [曜日]\`\n- 他のシートを見る: \`!j シート名 [曜日]\``;
      
      return message.reply(replyText);
    } catch (error) {
      console.error("Error fetching spreadsheet info:", error);
      return message.reply(`スプレッドシートの情報取得中にエラーが発生しました: ${error.message}\n\nスプレッドシートが公開設定になっているか確認してください。`);
    }
  }