const Parser = require("rss-parser");
const fs = require("fs");

async function fetchNews() {
  let parser = new Parser();
  let headlines = {
    ET: {},
    Hindu: {},
    HT: {},
    TOI: {},
    AI: {}
  };

  try {
    let etFeed = await parser.parseURL("https://economictimes.indiatimes.com/rssfeedsdefault.cms");
    etFeed.items.slice(0, 7).forEach((item, i) => headlines.ET[i] = item.title);
    headlines.ET["img"] = "https://img.etimg.com/photo/msid-67628067,quality-100/et-logo.jpg";
    console.log("✅ ET done");
  } catch (err) {
    console.log("⚠️ ET failed:", err.message);
  }

  try {
    let hinduFeed = await parser.parseURL("https://www.thehindu.com/feeder/default.rss");
    hinduFeed.items.slice(0, 7).forEach((item, i) => headlines.Hindu[i] = item.title);
    headlines.Hindu["img"] = "https://www.thehindu.com/theme/images/th-online/thehindu-logo-01.jpg";
    console.log("✅ Hindu done");
  } catch (err) {
    console.log("⚠️ Hindu failed:", err.message);
  }

  try {
    let htFeed = await parser.parseURL("https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml");
    htFeed.items.slice(0, 7).forEach((item, i) => headlines.HT[i] = item.title);
    headlines.HT["img"] = "https://www.hindustantimes.com/res/images/ht-logo.svg";
    console.log("✅ HT done");
  } catch (err) {
    console.log("⚠️ HT failed:", err.message);
  }

  try {
    let toiFeed = await parser.parseURL("https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms");
    toiFeed.items.slice(0, 7).forEach((item, i) => headlines.TOI[i] = item.title);
    headlines.TOI["img"] = "https://static.toiimg.com/photo/msid-58127550/58127550.jpg";
    console.log("✅ TOI done");
  } catch (err) {
    console.log("⚠️ TOI failed:", err.message);
  }

  try {
    let aiFeed = await parser.parseURL("https://artificialintelligence-news.com/feed/");
    aiFeed.items.slice(0, 7).forEach((item, i) => headlines.AI[i] = item.title);
    headlines.AI["img"] = "https://artificialintelligence-news.com/wp-content/themes/ai-news/assets/img/logo.png";
    console.log("✅ AI News done");
  } catch (err) {
    console.log("⚠️ AI News failed:", err.message);
  }

  // Save to JSON
  fs.writeFileSync("finalData.json", JSON.stringify(headlines, null, 2));
  console.log("🎉 Scraping finished, data saved to finalData.json");
}

// Run immediately
fetchNews();

// Schedule every 24 hours (24 * 60 * 60 * 1000 ms)
setInterval(fetchNews, 24 * 60 * 60 * 1000);
