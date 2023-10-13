# `ohol_nodejs_stats`

该资源库包含与名为 `OneHourOneLife` 的游戏有关的不同脚本 https://github.com/jasonrohrer/OneLife 
这些脚本可用于处理来自以下网站的 ohol 数据： http://publicdata.onehouronelife.com/
此处对数据进行了说明： https://onehouronelife.com/forums/viewtopic.php?id=2529

您需要使用 `nodejs` 来执行脚本

步骤<b>教程</b>: https://onehouronelife.com/forums/viewtopic.php?pid=50164#p50164<br>
输出示例： https://onehouronelife.com/forums/viewtopic.php?pid=49707#p49707

### `oholdownloaddata.js`
此脚本下载/更新所有 ohol 数据，并将其保存到一个文件夹中。   
数据下载完成后，其他脚本就可以使用这些数据，而且速度会更快。
该脚本可能会卡住，如果出现这种情况，请用 `CTRL+C` 关闭它，然后重新启动。

### `oholplayersearch.js`
此脚本可用于查找玩家的加盐邮件哈希值。
`oholgetplayerstats.js` 可以使用此散列获取玩家的统计数据。
你可以在不带参数的情况下执行该脚本，也可以向其传递一个 `lineage` 链接，它就会从该链接中找到玩家信息。

### `oholgetplayerstats.js`
此脚本使用加盐的电子邮件哈希值查找玩家的统计数据。
使用 `oholplayersearch.js` 查找玩家的哈希值。

### `colorizestats.js`
让你可以将 `oholgetplayerstats.js` 中的统计信息着色，这样你就可以在论坛上发布着色的统计信息了。

### `oholcurseinfo.js`
使用玩家哈希值查找该玩家的诅咒历史。
诅咒日志可能存在错误，并不包含所有诅咒。
