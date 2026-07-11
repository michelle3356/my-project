$(function () {
  if (!placeholderSupport()) {
    // 判断浏览器是否支持 placeholder
    $("[placeholder]")
      .focus(function () {
        var input = $(this);
        if (input.val() == input.attr("placeholder")) {
          input.val("");
          input.removeClass("placeholder");
        }
      })
      .blur(function () {
        var input = $(this);
        if (input.val() == "" || input.val() == input.attr("placeholder")) {
          input.addClass("placeholder");
          input.val(input.attr("placeholder"));
        }
      })
      .blur();
  }
});
function placeholderSupport() {
  return "placeholder" in document.createElement("input");
}

$(".wt-list-a").click(function () {
  if ($(this).parents("li").find(".wt-list-down").is(":hidden")) {
    $(".down").removeClass("active");
    $(".nav-li").removeClass("active");
    $(this).parents("li").addClass("active");
    $(".wt-list-down").slideUp("slow");
    $(this).parents("li").find(".wt-list-down").slideDown("slow");
  } else {
    $(this).parents("li").find(".wt-list-down").slideUp("slow");
  }
});

$(".go-top").click(function () {
  $("html,body").animate({ scrollTop: 0 }, 500);
});
// $(document).ready(function () {
//   var menuYloc = $("#services").offset().top; //此ID为随着屏幕滚动div的ID
//   $(window).scroll(function () {
//     var offsetTop = menuYloc + $(window).scrollTop() + "px";
//     $("#services").animate({ top: offsetTop }, { duration: 600, queue: false }); //此ID为随着屏幕滚动div的ID
//   });
// });
