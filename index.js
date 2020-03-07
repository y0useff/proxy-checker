const request = require('request-promise');
const fs = require('fs');
const { url } = require('./config.json')
let os = require('os')

fs.writeFileSync('success.txt', "")
fs.writeFileSync('failed.txt', "")

function readProxyFile(){
  return (fs.readFileSync('./proxies.txt', 'utf8').toString().split(os.EOL)).filter(line => line != '')
}

const proxies = readProxyFile()


function readProxyLine(proxy){
  const number_of_colon_occurences = proxy.replace(/[^:]/g, "").length
  const middle_colon = proxy.indexOf(":", proxy.indexOf(":") + 1)
  if (number_of_colon_occurences == 3) {
    let ip_port = "";
    for (let i = 0; i < middle_colon; i++) {
      ip_port += proxy[i]
    }
    let user_pass = "";
    for (let i = middle_colon + 1; i < proxy.length; i++) {
      user_pass += proxy[i]
    }
    return `http://${user_pass}@${ip_port}`
  }
  if (number_of_colon_occurences == 1 || number_of_colon_occurences == 0) return `http://${proxy}`
  fs.appendFileSync('failed.txt', `${proxy}\n`)
  return console.log(`${proxy}: Invalid Proxy Format, please use either ip:port or ip:port:user:pass.`)
}

const options = {
  uri: url,
  time: true,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.106 Safari/537.36',
  },
  resolveWithFullResponse: true,
  strictSSL: false
}

async function checkProxyStatusAndSpeed(proxy, options){
  try {
    await request(options, function (err, res, body){
      if (!res) return;
      if (res.statusCode == 200) {
        fs.appendFileSync('success.txt', `${proxy}\n`)
        return console.log(`${proxy}: ${Math.round(res.timingPhases.firstByte)}ms`);
      }
    })
  } catch {
    fs.appendFileSync('failed.txt', `${proxy}\n`)
    return console.log(`${proxy}: Proxy Failed!`)
  }
}

async function runChecker(proxylist){
  for (let proxy of proxylist){
    if (readProxyLine(proxy)){
      options.proxy = readProxyLine(proxy)
      checkProxyStatusAndSpeed(proxy, options)
    }
  }
}

runChecker(proxies)
