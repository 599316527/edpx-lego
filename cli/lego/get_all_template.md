get_all_template
---------

### Usage

edp lego get_all_template [--filter=<your.filter>] <saveto.json>



### Options

+ --filter - 可选，指定包含一个用于过滤样式的匿名函数的文件

filter example:

    function(item) {
        if (/无线品专/.test(item.templateName)) {
            return item;
        }
    }


### Description

获取所有样式数据

