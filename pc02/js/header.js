function initHeader() {
  initTimer();
	setTimeout(function () {
  	initSlick();
	}, 1000);
}

function initTimer() {
  const timer = document.getElementById("timer");
  if (!timer) return;

  function updateTimer() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const date = now.getDate();
    let hour = now.getHours();
    const minute = now.getMinutes().toString().padStart(2, "0");
    const second = now.getSeconds().toString().padStart(2, "0");
    const ampm = hour < 12 ? "上午" : "下午";
    hour = hour % 12 || 12;
    const week = "日一二三四五六".charAt(now.getDay());
    timer.innerHTML = `${year}/${month}/${date} ${ampm}${hour}:${minute}:${second}&nbsp;&nbsp;星期${week}`;
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

function initSlick() {
	$(".down-slick").not(".slick-initialized").slick({
		infinite: true,
		slidesToShow: 7,
		slidesToScroll: 7,
		autoplay: true,
		centerMode: false,
		arrows: true,
		dots: false,
	});
}
