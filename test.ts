import sqlite3 from "sqlite3";

const db = new sqlite3.Database("./database/sqlite.db");

// 打開資料庫
console.log("資料庫已開啟");

async function runAsync(sql: string, params: any[] = []) {
  return new Promise<void>((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve();
    });
  });
}

async function allAsync(sql: string, params: any[] = []) {
  return new Promise<any[]>((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

async function main() {
  try {
    // 插入兩個 user
    await runAsync(
      `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`,
      ["natsuha_test", "natsuha_test@example.com", "123456"]
    );
    await runAsync(
      `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`,
      ["friend_test", "friend_test@example.com", "123456"]
    );

    const users = await allAsync("SELECT * FROM users");
    console.log("users 表內容：", users);

    // 插入 profiles
    for (const u of users) {
      await runAsync(
        `INSERT INTO profiles (id, avatar_path) VALUES (?, ?)`,
        [u.id, "default_pic.webp"]
      );
    }
    const profiles = await allAsync("SELECT * FROM profiles");
    console.log("profiles 表內容：", profiles);

    // 插入一場比賽（兩個不同玩家）
    await runAsync(
      `INSERT INTO matches (player1_id, player2_id, player1_score, player2_score) VALUES (?, ?, ?, ?)`,
      [users[0].id, users[1].id, 3, 1]
    );
    const matches = await allAsync("SELECT * FROM matches");
    console.log("matches 表內容：", matches);

    // 插入一個 tournament
    await runAsync(
      `INSERT INTO tournaments (name, host_id) VALUES (?, ?)`,
      ["Test Tournament", users[0].id]
    );
    const tournaments = await allAsync("SELECT * FROM tournaments");
    console.log("tournaments 表內容：", tournaments);

    // 插入 tournament_participants
    for (const u of users) {
      await runAsync(
        `INSERT INTO tournament_participants (tournament_id, user_id) VALUES (?, ?)`,
        [tournaments[0].id, u.id]
      );
    }
    const tParticipants = await allAsync("SELECT * FROM tournament_participants");
    console.log("tournament_participants 表內容：", tParticipants);

    // 插入 tournament_matches
    await runAsync(
      `INSERT INTO tournament_matches (tournament_id, match_id) VALUES (?, ?)`,
      [tournaments[0].id, matches[0].id]
    );
    const tMatches = await allAsync("SELECT * FROM tournament_matches");
    console.log("tournament_matches 表內容：", tMatches);

    // 插入好友關係（單向）
    await runAsync(
      `INSERT INTO friendships (user_id, friend_id) VALUES (?, ?)`,
      [users[0].id, users[1].id]
    );
    const friends = await allAsync("SELECT * FROM friendships");
    console.log("friendships 表內容：", friends);

  } catch (err) {
    console.error("錯誤：", err);
  } finally {
    db.close();
    console.log("資料庫已關閉");
  }
}

main();
