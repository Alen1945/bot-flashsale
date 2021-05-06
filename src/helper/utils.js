const puppeteer = require("puppeteer-core");
const fs = require("fs");
const cheerio = require("cheerio");
const { resolve } = require("path");
const moment = require("moment");
module.exports.sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

module.exports.ceklogin = async () => {
  try {
    const cookiesFilePath = "./.shopeelog/cookies.json";
    const previousSession = fs.existsSync(cookiesFilePath);
    if (previousSession) {
      console.log("Sudah Login");
      return true;
    } else {
      console.log(`Login dulu`);
      let login_page = [
        "https://shopee.co.id/buyer/login?next=https%3A%2F%2Fshopee.co.id%2Flogin",
      ];

      const browser = await puppeteer.launch({
        headless: false,
        executablePath: "/usr/bin/google-chrome", // googlechrome file location
        defaultViewport: null,
      });

      const page = await browser.newPage();
      page.setDefaultNavigationTimeout(10000000);
      await page.goto(login_page[0], { waitUntil: "networkidle2" });
      console.log("Menunggu redirect");
      const selector = "form.shopee-searchbar-input";
      await page.waitForSelector(selector, {
        timeout: 10 * 60 * 1000,
      });
      console.log("Selesai redirect");
      const cookiesObject = await page.cookies();
      // Save Cookies
      fs.writeFile(
        cookiesFilePath,
        JSON.stringify(cookiesObject, null, 2),
        function (err) {
          if (err) {
            console.log("Tidak bisa save file.", err);
          }
          console.log("Berhasil login!");
          return true;
        }
      );
      await browser.close();
      resolve(true);
    }
  } catch (e) {
    console.log(e);
  }
};

module.exports.countDownDays = (jammer) => {
  var djam = jammer.split(":")[0],
    dmenit = jammer.split(":")[1],
    ddetik = jammer.split(":")[2];
  var datts = new Date();
  var process = datts.getTime();
  var countDownDate = moment(process)
    .add(Number(djam), "hours")
    .add(Number(dmenit), "minutes")
    .add(Number(ddetik), "seconds");
  return new Promise((resolve, reject) => {
    var x = setInterval(async function () {
      var now = new Date().getTime();
      var distance = countDownDate - now;
      var days = Math.floor(distance / (1000 * 60 * 60 * 24));
      var hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      var seconds = Math.floor((distance % (1000 * 60)) / 1000);
      const counter =
        days + "d " + hours + "h " + minutes + "m " + seconds + "s ";
      if (distance < 6) {
        clearInterval(x);
        resolve(true);
        console.log("chekout dimulai");
        return;
      }
      console.log("waiting ", counter);
    }, 1000);
  });
};
module.exports.autocheckout = (url) => {
  (async () => {
    try {
      let target_barang = [url];
      const browser = await puppeteer.launch({
        executablePath: "/usr/bin/google-chrome",
        headless: false,
        defaultViewport: null,
      });
      const page = await browser.newPage();
      const cookiesFilePath = "./.shopeelog/cookies.json";
      const cookiesString = fs.readFileSync(cookiesFilePath);
      const parsedCookies = JSON.parse(cookiesString);
      if (parsedCookies.length !== 0) {
        for (let cookie of parsedCookies) {
          await page.setCookie(cookie);
        }
        console.log("set cookie berhasil");
      } else {
        console.log("please login");
        return;
      }

      await page.goto(target_barang[0], { waitUntil: "domcontentloaded" });
      const bodyHandle = await page.$("body");
      const html = await page.evaluate((body) => body.innerHTML, bodyHandle);
      await bodyHandle.dispose();
      const $ = cheerio.load(html);
      const tersisa = $(
        "div._90fTvx > div.flex.items-center div:nth-child(2)"
      ).text();
      console.log(tersisa);
      const kirim = $("div.flex > div > div > div > span").text();
      console.log(kirim);
      const harga = $(
        "div > div > div > div > div.flex.items-center > div._3Dt65t"
      ).text();
      console.log(harga);
      const statusTersedia = $("button.btn.btn-solid-primary.btn--l._3Kiuzg");
      const ada = !!(
        statusTersedia && statusTersedia.attr("aria-disabled") == "false"
      );
      console.log("status", statusTersedia.html(), ada);
      if (ada) {
        console.log(`Berhasil dimasukan ke keranjang`);
      } else {
        console.log("[X] Barang Habis");
      }
      await page.waitForSelector(
        "div > div > button.btn.btn-solid-primary.btn--l._3Kiuzg"
      );
      await page.click("div._2oeDUI > button.product-variation:nth-child(1)");
      await page.click(
        "div._2oeDUI:nth-child(2) > button.product-variation:nth-child(1)"
      );
      await page.click(
        "div > div > button.btn.btn-solid-primary.btn--l._3Kiuzg",
        { waitUntil: "domcontentloaded" }
      );
      // await page.waitForNavigation()
      await page.waitForSelector("div.cart-page-footer__checkout > button");
      console.log($("div.cart-page-footer__checkout > button"));
      await this.sleep(1 * 1000);
      await page.click("div.cart-page-footer__checkout > button", {
        waitUntil: "domcontentloaded",
      });
      console.log(`Berhasil checkout`);

      //Metode Pembayaran Bank Mandiri
      const TransferBank =
        "div.checkout-payment-setting__payment-methods-tab > span:nth-child(2) > button";
      const bankT =
        "div.bank-transfer-category__body div.checkout-bank-transfer-item:nth-child(2)";
      const selbuy = "div._1OBq_Q > button.stardust-button";

      await page.waitForSelector(TransferBank);
      await page.click(TransferBank);
      await page.waitForSelector(bankT);
      await page.click(bankT);
      await this.sleep(1 * 1000);
      await page.waitForSelector(selbuy);
      await page.click(selbuy);
      console.log("Berhasil dipesan, barang akan dikirim!");
    } catch (e) {
      console.log(e);
    }
  })();
};
