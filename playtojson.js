const fs = require("fs");
const htmlparser = require("htmlparser2");
const moment = require("moment");

const configFile = "./config.json";
let config = {};
if (fs.existsSync(configFile)) {
  config = JSON.parse(fs.readFileSync(configFile, "utf-8"));
} else {
  console.log(`Exiting. Could not find configuration ${configFile} in this directory.`);
  return;
}
if (!fs.existsSync(`./${config.team}`)) {
  fs.mkdirSync(config.team);
}
const html = fs.readFileSync(config.source);
const handler = new htmlparser.DomHandler(function(error, dom) {
  const names = {};
  const messages = {};
  if (error) {
    //
    console.log(error);
  } else {
    // Parsing is done
    let team = config.team;
    let time = moment();
    let place = "default";
    let delay = config.delay;
    dom.filter(o => o.type === "tag" && o.name === "html").forEach((obj) => {
      obj.children.filter(o => o.type === "tag" && o.name === "body").forEach((c) => {
        c.children.filter(o => o.type === "tag").forEach((g) => {
          if (g.type === "tag" && g.name === "p") {
            const ptype = g.attribs.class;
            let name = "";
            g.children.forEach((gg) => {
              if (gg.type === "text") {
                if (ptype === "dialog") {
                  let offset = 0;
                  gg.data = gg.data.replace(/\s+/g, " ").trim();
                  const matches = gg.data.match(/^(A )?([A-Z][A-Z]+[-. ]+)+/);
                  if (matches) {
                    name = matches[0].trim().replace(/\.$/, "");
                    offset = matches[0].length;
                  }
                  if (!names[name]) {
                    if (!config.users[name]) {
                      names[name] = config
                        .users[name
                          .toLowerCase()
                          .replace(".", "")
                          .replace(" ", "")].id;
                    } else {
                      names[name] = generateId("U");
                    }
                  }
                  time = time.add(Math.random() * 1000 * delay, "ms");
                  const message = {
                    type: "message",
                    user: names[name],
                    text: gg.data.substr(offset).trim(),
                    ts: (time.valueOf() / 1000).toString(),
                  };
                  messages[place].unshift(message);
                } else if (ptype === "time") {
                  time = moment(gg.data.trim());
                } else if (ptype === "place") {
                  place = gg.data.trim();
                  if (!messages[place]) {
                    messages[place] = [];
                  }
                } else if (ptype === "delay") {
                  delay = Number(gg.data.trim());
                }
              }
            });
          }
        });
      });
    });
    Object.keys(messages).forEach(k => {
      const json = JSON.stringify(messages[k], null, 4);
      const filename = `${config.team}/${k}.json`;
      fs.writeFileSync(filename, json);
    });
    Object.keys(names).forEach(n => {
      const name = n.toLowerCase().replace(".", "").replace(" ", "");
      let userObj;
      if (Object.prototype.hasOwnProperty.call(config.users, name)) {
        userObj = fillUser(team, config.users[name]);
      } else {
        userObj = generateUser(team, n, names[n]);
      }
      const json = JSON.stringify(userObj, null, 4);
      const filename = `${config.team}/user-${userObj.name}.json`;
      fs.writeFileSync(filename, json);
    });
    fs.writeFileSync(
      `${config.team}/_localuser.json`,
      JSON.stringify({
        "ok": true,
        "url": config.url,
        "team": config.team,
        "user": config.user,
        "team_id": config.team_id,
        "user_id": config.users[config.user].id
      }, null, 4));
  }
}, {
  decodeEntities: true,
});
const parser = new htmlparser.Parser(handler);
parser.write(html);
parser.end();

function generateId(prefix) {
  const charset = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let uid = prefix;
  for (let i = 0; i < 8; i += 1) {
    const n = Math.trunc(Math.random() * charset.length);
    uid += charset[n];
  }
  return uid;
}

function generateUser(teamId, name, uid) {
  return {
    "id": uid,
    "team_id": teamId,
    "name": name.toLowerCase(),
    "deleted": false,
    "color": (0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6),
    "real_name": "",
    "tz": "Europe/London",
    "tz_label": "Greenwich Mean Time",
    "tz_offset": -14400,
    "is_admin": false,
    "is_owner": false,
    "is_primary_owner": false,
    "is_restricted": false,
    "is_ultra_restricted": false,
    "is_bot": false,
    "updated": -1943031080.524,
    "is_app_user": false,
    "shouldDownload": true
  };
}

function fillUser(teamId, user) {
  user["team_id"] = teamId;
  user["deleted"] = false;
  user["tz"] = "Europe/London",
  user["tz_label"] = "Greenwich Mean Time",
  user["tz_offset"] = -14400,
  user["is_admin"] = false,
  user["is_owner"] = false,
  user["is_primary_owner"] = false,
  user["is_restricted"] = false,
  user["is_ultra_restricted"] = false,
  user["is_bot"] = false,
  user["updated"] = -1943031080.524,
  user["is_app_user"] = false,
  user["shouldDownload"] = true
  return user;
}
