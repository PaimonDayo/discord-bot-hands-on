export const data = {
    name: 'weather',
    description: '天気と月に応じたワンダショミクのリアクションを表示',
    usage: '!weatherreact [都市名]', // 使用方法の説明
  };
  
  export async function execute(message, args) {
    // OpenWeatherMap APIキー（必ず自分のAPIキーに置き換えてください）
    const WEATHER_API_KEY = "8b2dfb5e79bd50f7fdf0c17b3f9cfb30";
    
    let city = "";
    
    try {
      // 引数があれば、都市名として使用
      if (args.length > 0) {
        city = args.join(" ");
      } else {
        // 引数がない場合、IPベースで位置情報を取得
        await message.channel.send("位置情報を取得中...");
        
        try {
          // ipapi.coを使用して位置情報を取得（APIキー不要）
          const geoResponse = await fetch("https://ipapi.co/json/");
          
          if (!geoResponse.ok) {
            throw new Error(`位置情報の取得に失敗しました (${geoResponse.status})`);
          }
          
          const geoData = await geoResponse.json();
          
          // 都市名とその他の情報を取得
          city = geoData.city || "Tokyo"; // デフォルトを東京に
          
          message.channel.send(`あなたの位置情報から **${city}** の天気を確認します...`);
        } catch (geoError) {
          console.error("Geolocation error:", geoError);
          city = "Tokyo"; // 位置情報の取得に失敗した場合はデフォルトを東京に
          message.channel.send(`位置情報の取得に失敗しました。デフォルトの東京の天気を確認します...`);
        }
      }
  
      // OpenWeatherMap APIのURL
      const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}&units=metric&lang=ja`;
      
      // APIからデータを取得
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        if (response.status === 404) {
          return message.reply(`「${city}」という都市は見つかりませんでした。都市名を確認してください。`);
        } else if (response.status === 401) {
          return message.reply("APIキーが無効です。BOT管理者に連絡してください。");
        } else {
          return message.reply(`天気情報の取得に失敗しました。エラーコード: ${response.status}`);
        }
      }
      
      const data = await response.json();
      
      // 天気情報を取得
      const weatherId = data.weather[0].id;
      const weatherDescription = data.weather[0].description;
      const temp = Math.round(data.main.temp);
      
      // 現在の月を取得（0-11の数値、0が1月）
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      
      // 月の名前（日本語）
      const monthNames = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
      const currentMonthName = monthNames[currentMonth];
      
      // 天気に応じたリアクションを決定
      let reaction = "";
      let emoji = "";
      
      // 雪の場合は月に関係なく同じリアクション
      if (weatherId >= 600 && weatherId < 700) {
        reaction = "わぁ！雪だ！きれいだね！一緒に雪だるま作ろうよ！";
        emoji = "❄️☃️";
      } else {
        // 雪以外の天気は月ごとに分ける
        switch (currentMonth) {
          case 0: // 1月
            if (weatherId === 800) { // 晴れ
              reaction = "1月の晴れた日は空気が澄んでるね！寒いけど、外の空気は気持ちいいよ！";
              emoji = "☀️❄️";
            } else if (weatherId >= 200 && weatherId < 600) { // 雨や雷
              reaction = "1月の雨は冷たいから風邪引かないように気をつけてね！お家でゆっくりしよ？";
              emoji = "🌧️🧣";
            } else { // 曇りなど
              reaction = "1月は寒いから、温かい服装で出かけようね！ホットドリンクも忘れずに！";
              emoji = "☁️🧥";
            }
            break;
            
          case 1: // 2月
            if (weatherId === 800) {
              reaction = "2月の晴れた日は春の訪れを少し感じるね！でもまだ寒いから気をつけて！";
              emoji = "☀️🌱";
            } else if (weatherId >= 200 && weatherId < 600) {
              reaction = "2月の雨は冷たいけど、この雨が春の準備をしているんだよ！";
              emoji = "🌧️🌱";
            } else {
              reaction = "2月はまだまだ冬だね。温かくして過ごそう！チョコレートでも食べる？";
              emoji = "☁️🍫";
            }
            break;
            
          case 2: // 3月
            if (weatherId === 800) {
              reaction = "3月の晴れは春の陽気！桜のつぼみも膨らんできたかな？";
              emoji = "☀️🌸";
            } else if (weatherId >= 200 && weatherId < 600) {
              reaction = "3月の雨は春雨！優しく大地を潤してるんだよ！";
              emoji = "🌧️🌱";
            } else {
              reaction = "3月の空は変わりやすいね。春はもうすぐそこだよ！";
              emoji = "☁️🌸";
            }
            break;
            
          case 3: // 4月
            if (weatherId === 800) {
              reaction = "4月の晴れた日は桜が一番きれいに見えるよ！お花見行こうよ！";
              emoji = "☀️🌸";
            } else if (weatherId >= 200 && weatherId < 600) {
              reaction = "4月の雨で桜が散っちゃうのは寂しいけど、次の季節も楽しもうね！";
              emoji = "🌧️🌸";
            } else {
              reaction = "4月は新しいことを始めるのにぴったりの季節だね！何か始めてみる？";
              emoji = "☁️✨";
            }
            break;
            
          case 4: // 5月
            if (weatherId === 800) {
              reaction = "5月の晴れた日は過ごしやすくて最高だね！外でピクニックしたいな！";
              emoji = "☀️🧺";
            } else if (weatherId >= 200 && weatherId < 600) {
              reaction = "5月の雨は恵みの雨！植物たちが喜んでるよ！";
              emoji = "🌧️🌿";
            } else {
              reaction = "5月は若葉の季節。自然の緑が鮮やかできれいだね！";
              emoji = "☁️🌿";
            }
            break;
            
          case 5: // 6月
            if (weatherId === 800) {
              reaction = "6月の晴れ間は貴重！梅雨の合間の晴れは特別気持ちいいね！";
              emoji = "☀️☂️";
            } else if (weatherId >= 200 && weatherId < 600) {
              reaction = "6月の雨は紫陽花を美しく咲かせるんだよ！雨の日も素敵だね！";
              emoji = "🌧️🌸";
            } else {
              reaction = "6月は梅雨の季節。じめじめするけど、それも日本の良さだね！";
              emoji = "☁️☔";
            }
            break;
            
          case 6: // 7月
            if (weatherId === 800) {
              reaction = "7月の晴れは太陽がまぶしい！熱中症に気をつけてね！水分補給忘れずに！";
              emoji = "☀️💧";
            } else if (weatherId >= 200 && weatherId < 600) {
              reaction = "7月の雨で少し涼しくなるね！でも蒸し暑くなることもあるから気をつけて！";
              emoji = "🌧️🌡️";
            } else {
              reaction = "7月は夏本番！海やプールに行きたいな～！";
              emoji = "☁️🏖️";
            }
            break;
            
          case 7: // 8月
            if (weatherId === 800) {
              reaction = "8月の太陽は強いから日焼け止めしっかり塗ってね！一緒に花火見に行こうよ！";
              emoji = "☀️🎆";
            } else if (weatherId >= 200 && weatherId < 600) {
              reaction = "8月のスコールはすごいね！でもすぐに晴れることが多いよ！";
              emoji = "🌧️☀️";
            } else {
              reaction = "8月は夏祭りの季節！浴衣着て出かけたいな～！";
              emoji = "☁️👘";
            }
            break;
            
          case 8: // 9月
            if (weatherId === 800) {
              reaction = "9月の晴れは少し秋の気配を感じるね！空が高くなってきたよ！";
              emoji = "☀️🍂";
            } else if (weatherId >= 200 && weatherId < 600) {
              reaction = "9月の雨は台風に気をつけなきゃ！安全第一だよ！";
              emoji = "🌧️🌀";
            } else {
              reaction = "9月は少しずつ涼しくなる季節。夏と秋の間で過ごしやすいね！";
              emoji = "☁️🍁";
            }
            break;
            
          case 9: // 10月
            if (weatherId === 800) {
              reaction = "10月の晴れた空は澄んでいて気持ちいいね！紅葉も始まる頃かな？";
              emoji = "☀️🍁";
            } else if (weatherId >= 200 && weatherId < 600) {
              reaction = "10月の雨は秋雨！少し肌寒くなってきたから、温かくしてね！";
              emoji = "🌧️🍂";
            } else {
              reaction = "10月は芸術の秋、食欲の秋！何を楽しもうかな～？";
              emoji = "☁️🎨";
            }
            break;
            
          case 10: // 11月
            if (weatherId === 800) {
              reaction = "11月の晴れた日は紅葉狩りにぴったり！きれいな景色を見に行こうよ！";
              emoji = "☀️🍁";
            } else if (weatherId >= 200 && weatherId < 600) {
              reaction = "11月の雨は冷たいから風邪に気をつけて！温かいお茶でも飲もうね！";
              emoji = "🌧️🍵";
            } else {
              reaction = "11月は秋も深まって、そろそろ冬の準備をする時期だね！";
              emoji = "☁️🧣";
            }
            break;
            
          case 11: // 12月
            if (weatherId === 800) {
              reaction = "12月の晴れた日は澄んだ冬の空気が気持ちいいね！でも寒いから気をつけて！";
              emoji = "☀️🎄";
            } else if (weatherId >= 200 && weatherId < 600) {
              reaction = "12月の雨は冷たいから風邪引かないようにね！ホットドリンクで温まろう！";
              emoji = "🌧️☕";
            } else {
              reaction = "12月はイルミネーションがきれいな季節！クリスマスも楽しみだね！";
              emoji = "☁️🎅";
            }
            break;
            
          default:
            reaction = "今日も一日頑張ろうね！";
            emoji = "✨😊";
        }
      }
      
      // ワンダショミクのリアクションを表示
      const replyText = `**${data.name}の天気**: ${weatherDescription} (${temp}°C) ${emoji}\n\n`;
      const characterReply = `**ワンダショミク**: 「${reaction}」 ${emoji}`;
      
      // 天気情報と合わせて最終的なメッセージを作成
      return message.reply(replyText + characterReply);
      
    } catch (error) {
      console.error("Error fetching weather data:", error);
      return message.reply(`天気情報の取得中にエラーが発生しました: ${error.message}`);
    }
  }