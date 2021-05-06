const { ceklogin, autocheckout, countDownDays } = require("./src/helper/utils");

async function mulai(url, time) {
  try {
    await ceklogin();
    console.log("login berhasil");
    const hitungmundur = await countDownDays(time);
    if (hitungmundur) {
      autocheckout(url);
    }
  } catch (e) {
    console.log(e);
  }
}

mulai(
  "https://shopee.co.id/JBL-Tune-500BT-Wireless-On-Ear-Headphones-with-Mic-Garansi-Resmi-i.26968895.4442949847",
  "00:00:00"
);
// mulai(
//   "https://shopee.co.id/Yongki-Komaladi-ZELO550-19-BLACK-i.28336892.4607351303",
//   "00:00:00"
// );
