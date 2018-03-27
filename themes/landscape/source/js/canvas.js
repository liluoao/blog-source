var browser = {
    versions: function () {
        var u = navigator.userAgent;
        return {
            trident: u.indexOf('Trident') > -1, //IE内核
            presto: u.indexOf('Presto') > -1, //opera内核
            webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
            gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') === -1, //火狐内核
            mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端
            ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
            android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或者uc浏览器
            iPhone: u.indexOf('iPhone') > -1 || u.indexOf('Mac') > -1, //是否为iPhone或者QQHD浏览器
            iPad: u.indexOf('iPad') > -1, //是否iPad
            webApp: u.indexOf('Safari') === -1 //是否web应该程序，没有头部与底部
        };
    }()
};

console.log(" 是否为移动终端: " + browser.versions.mobile);
console.log(" ios终端: " + browser.versions.ios);
console.log(" android终端: " + browser.versions.android);
console.log(" 是否为iPhone: " + browser.versions.iPhone);
console.log(" 是否iPad: " + browser.versions.iPad);
console.log(navigator.userAgent);

if (!browser.versions.mobile) {
    document.getElementById('banner').innerHTML += '<div id="canvas"><canvas width="100%"></canvas></div>';

    var c = document.getElementsByTagName('canvas')[0],
        x = c.getContext('2d'),
        w = window.innerWidth,
        h = window.innerHeight,
        pr = window.devicePixelRatio || 1,
        f = 90,
        q,
        m = Math,
        r = 0,
        u = m.PI * 2,
        v = m.cos,
        z = m.random;
    c.width = w * pr;
    c.height = h * pr;
    x.scale(pr, pr);
    x.globalAlpha = 0.6;

    function i() {
        x.clearRect(0, 0, w, h);
        q = [{x: 0, y: h * .7 + f}, {x: 0, y: h * .7 - f}];
        while (q[1].x < w + f) d(q[0], q[1])
    }

    function d(i, j) {
        x.beginPath();
        x.moveTo(i.x, i.y);
        x.lineTo(j.x, j.y);
        var k = j.x + (z() * 2 - 0.25) * f,
            n = y(j.y);
        x.lineTo(k, n);
        x.closePath();
        r -= u / -50;
        x.fillStyle = '#' + (v(r) * 127 + 128 << 16 | v(r + u / 3) * 127 + 128 << 8 | v(r + u / 3 * 2) * 127 + 128).toString(16);
        x.fill();
        q[0] = q[1];
        q[1] = {x: k, y: n}
    }

    function y(p) {
        var t = p + (z() * 2 - 1.1) * f;
        return (t > h || t < 0) ? y(p) : t
    }

    document.getElementById("canvas").onclick = i;
    document.getElementById("canvas").ontouchstart = i;
    i();
}
