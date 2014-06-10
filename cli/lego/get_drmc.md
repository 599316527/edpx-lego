get_drmc
---------

### Usage

edp lego get_drmc [--by=(mcid|mid)] [--format=(json|file|js)] [--output_dir=<dir>] [<id_in_file>] [<ID>[,<ID>]]

### Options

+ --by - 可选，指定更新drmc内容时使用的ID的类型，mcid或者mid，默认是mcid
+ --format - 可选，指定输出的格式。默认是file。可配置的格式包括：

    `json` 是m*id到drmc内容的map；
    `file` 是将drmc存储到以m*id命名的文件里；
    `js` 是分析drmc内容，将其中的js通过正则匹配出来并以bucket和原文件名作为目录和文件名来存放

+ --output_dir - 可选，指定输出目录，默认是当前目录


### Description

根据mcid或者mid获取drmc内容

