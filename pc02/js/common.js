$(function () {
  //电子游戏tabs//
  $(".game-list li").click(function () {
    var index = $(this).index();
    $(this).addClass("active").siblings().removeClass("active");
    $(".list-cont")
      .eq(index)
      .show()
      .addClass("block")
      .siblings()
      .removeClass("block")
      .hide();
  });

  //优惠活动
  $(".img_ul").click(function () {
    $(this)
      .next(".img_cont")
      .slideToggle(300)
      .siblings(".img_cont")
      .slideUp(300);
  });
  $(".linkList a").click(function () {
    var index = $(this).index();
    $(this).addClass("on").siblings().removeClass("on");
    $(".item_con").eq(index).show().siblings().hide();
    $(".cont-net").eq(index).show().siblings().hide();
  });
  //合作伙伴
  $(".agent-linkList a").click(function () {
    var index = $(this).index();
    $(this).addClass("on").siblings().removeClass("on");
    $(".item_con").eq(index).show().siblings().hide();
    $(".cont-net").eq(index).show().siblings().hide();
  });
});
jQuery(".website").slide({
  mainCell: "ul",
  effect: "topLoop",
  autoPlay: true,
  delayTime: 1000,
  interTime: 1000,
  easing: "easeInCubic",
});
//彩虹字效果 文字闪烁
function toggleColor(id, arr, s) {
  var self = this;
  self._i = 0;
  self._timer = null;

  self.run = function () {
    if (arr[self._i]) {
      $(id).css("color", arr[self._i]);
      self._i++;
    } else {
      self._i = 0;
    }
    self._timer = setTimeout(function () {
      self.run(id, arr, s);
    }, s);
  };
  self.run();
}

//使用方法//
$(function () {
  new toggleColor("#blinking0", ["#e70012", "#1af0ac"], 300);
  new toggleColor("#blinking1", ["#ff0", "#fff"], 300);
  new toggleColor("#blinking2", ["#00aaee", "#fff"], 300);
  new toggleColor("#blinking3", ["#f33f83", "#fff"], 300);
  new toggleColor("#blinking4", ["#00aaee", "#fff"], 300);
  new toggleColor("#blinking5", ["#0addd0", "#fff"], 300);
  new toggleColor("#blinking6", ["#5a75ff", "#fff"], 300);
  new toggleColor("#blinking7", ["#55d655", "#fff"], 300);
  new toggleColor("#blinking8", ["#ffae2f", "#fff"], 300);
  new toggleColor("#blinking9", ["#ff2508", "#fff"], 300);
  new toggleColor("#blinking10", ["#ce08ff", "#fff"], 300);
});

//奖池数字
setInterval(function () {
  jkcalc();
}, 600);
var jkcalc = function () {
  var jkt = new Date().getTime() + "";

  var jka = parseInt(jkt.substr(jkt.length - 10, 10) * 0.251) / 100;
  var jkb = parseInt(jkt.substr(jkt.length - 10, 10) * 0.423) / 100;
  var jkc = parseInt(jkt.substr(jkt.length - 10, 10) * 0.267) / 100;
  var jkd = parseInt(jkt.substr(jkt.length - 10, 10) * 0.275) / 100;
  var jke = parseInt(jkt.substr(jkt.length - 10, 10) * 0.212) / 100;
  var jkf = parseInt(jkt.substr(jkt.length - 10, 10) * 0.296) / 100;
  $("#s1").html("￥" + parseFloat(jka).toLocaleString());
  $("#s2").html("￥" + parseFloat(jkb).toLocaleString());
  $("#s3").html("￥" + parseFloat(jkc).toLocaleString());
  $("#s4").html("￥" + parseFloat(jkd).toLocaleString());
  $("#s5").html("￥" + parseFloat(jke).toLocaleString());
  $("#s6").html("￥" + parseFloat(jkf).toLocaleString());
  $("#s7").html("￥" + parseFloat(jkf).toLocaleString());
};
jkcalc();
