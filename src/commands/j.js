export const data = {
    name: 'j',
    description: 'スプレッドシートから時間割を表示するコマンド',
    usage: '!j [シート名] [曜日(省略可)]', // 使用方法の説明を追加
  };
  
  export async function execute(message, args) {
    // 曜日名の定義
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayShortNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    
    // 引数の解析
    let sheetName = "Dayo"; // デフォルトのシート名
    let targetDay = dayNames[new Date().getDay()]; // デフォルトは今日の曜日
    
    if (args.length > 0) {
      // 最初の引数がシート名
      sheetName = args[0];
      
      // 2番目の引数が曜日の場合
      if (args.length > 1) {
        const dayArg = args[1].charAt(0).toUpperCase() + args[1].slice(1).toLowerCase();
        // 完全一致または短縮形で曜日を検索
        const dayIndex = dayNames.findIndex(d => d === dayArg || d.startsWith(dayArg));
        const shortDayIndex = dayShortNames.findIndex(d => d === dayArg);
        
        if (dayIndex !== -1) {
          targetDay = dayNames[dayIndex];
        } else if (shortDayIndex !== -1) {
          targetDay = dayNames[shortDayIndex];
        }
      }
    }
    
    // 土日なら時間割はないと返信（曜日指定がない場合のみ）
    if (args.length <= 1 && (targetDay === "Saturday" || targetDay === "Sunday")) {
      return message.reply("今日は時間割はありません。特定の曜日の時間割を見るには `!j [シート名] [曜日]` と入力してください。");
    }
  
    // 公開済みのスプレッドシート CSV URL
    const sheetId = "1Oubppnfdtog6r60X559Mfl7ncnXRyjGw9emDDdh65PI";
    
    // シート名を指定してURLを構築
    const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
  
    try {
      // CSV データを取得
      const response = await fetch(sheetUrl);
      if (!response.ok) {
        return message.reply(`スプレッドシートの取得に失敗しました。シート「${sheetName}」が存在しないか、アクセス権限がない可能性があります。HTTP ${response.status}`);
      }
      const csvText = await response.text();
  
      // CSV のパース
      const rows = csvText.split("\n")
        .map(row => row.trim())
        .filter(row => row.length > 0);
      if (rows.length === 0) {
        return message.reply(`シート「${sheetName}」にデータがありません。`);
      }
  
      // ヘッダー行からカラム名を取得
      const headers = rows[0].split(",").map(h => h.trim().replace(/^"|"$/g, '')); // 引用符を除去
      const schedule = [];
  
      // ヘッダー以降の各行をオブジェクトに変換
      for (let i = 1; i < rows.length; i++) {
        // CSVの行を適切に分割（カンマが引用符内にある場合に対応）
        const cols = parseCSVRow(rows[i]);
        
        // ヘッダー数と異なる行はスキップ
        if (cols.length < headers.length) continue;
        
        const rowObj = {};
        headers.forEach((header, j) => {
          rowObj[header] = cols[j];
        });
        schedule.push(rowObj);
      }
  
      // 指定した曜日と一致し、Subject が空でない行を抽出
      const daySchedule = schedule.filter(row =>
        row.Day === targetDay && row.Subject && row.Subject !== ""
      );
  
      if (daySchedule.length === 0) {
        return message.reply(`シート「${sheetName}」の ${targetDay} の時間割は登録されていません。`);
      }
  
      // 整形して Discord メッセージを作成
      let replyText = `**【${sheetName} - ${targetDay} の時間割】**\n\n`;
      
      // 時間割を時間順にソート
      daySchedule.sort((a, b) => {
        return parseInt(a.Period) - parseInt(b.Period);
      });
      
      daySchedule.forEach(row => {
        replyText += `**${row.Period}限 (${row["Start Time"]} - ${row["End Time"]})**\n`;
        replyText += `📚 **${row.Subject}**\n`; // 科目名を目立たせる
        replyText += `🏫 ${row.Room}\n`;
        if (row.Teacher) {
          replyText += `👨‍🏫 ${row.Teacher}\n`;
        }
        replyText += `\n`;
      });
  
      return message.reply(replyText);
    } catch (error) {
      console.error("Error fetching or parsing schedule:", error);
      return message.reply(`シート「${sheetName}」の時間割の取得中にエラーが発生しました。`);
    }
  }
  
  // CSVの行を適切に分割するヘルパー関数（引用符内のカンマを扱うため）
  function parseCSVRow(row) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      
      if (char === '"') {
        // 引用符の処理
        if (inQuotes && i + 1 < row.length && row[i + 1] === '"') {
          // エスケープされた引用符 ("") の処理
          current += '"';
          i++; // 次の引用符をスキップ
        } else {
          // 引用符の開始または終了
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // カンマがフィールドの区切りとして機能する場合
        result.push(current.trim());
        current = '';
      } else {
        // 通常の文字
        current += char;
      }
    }
    
    // 最後のフィールドを追加
    result.push(current.trim().replace(/^"|"$/g, '')); // 引用符を除去
    
    return result;
  }