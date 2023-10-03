import sqlite3 from "sqlite3";
import ping from 'ping'

const db = new sqlite3.Database("tools.db");

db.serialize(() => {
    db.run(
        `CREATE TABLE IF NOT EXISTS ping_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        target_host TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        response_time INTEGER)`
    )
})

const main = (host: string) => {
    ping.sys.probe(host, (isAlive, responseTime) => {
        if (!isAlive) {
            console.log(`Host ${host} is down.`)
            return
        }
        console.log(`Host ${host} is alive. Response time: ${responseTime} ms`)
        db.run(`INSERT INTO ping_data (target_host, response_time) VALUES (?,?)`, [host, responseTime], (error) => {
            console.error("Erro ao inserir os dados no banco: " + error)
        })
    })
}


const view = () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM ping_data", (error, rows) => {
            if (error) {
                reject(error)
            } else {
                const response = rows.map((row) => row);
                resolve(response)
            }
        })
    })
}

setInterval(() => {
    // main("8.8.8.8");
    view().then((data) => console.log(data)).catch(console.log)
}, 5000)

