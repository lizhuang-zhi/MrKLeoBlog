const CONFIG = {
    LOG_CONFIG: {
        appenders: {
            error: {
                category: "errorLogger", // logger 名称
                type: "dateFile",  // 日志类型
                filename: "logs/error/error",  // 日志输出位置
                alwaysIncludePattern: true,  // 是否总是有后缀名
                pattern: "yyyy-MM-dd-hh.log"  // 后缀,每小时创建新的文件
            },
            response: {
                category: "responseLogger", // logger 名称
                type: "dateFile",  // 日志类型
                filename: "logs/response/response",  // 日志输出位置
                alwaysIncludePattern: true,  // 是否总是有后缀名
                pattern: "yyyy-MM-dd-hh.log"  // 后缀,每小时创建新的文件
            }
        },
        categories: {
            default: {
                appenders: ["response"],
                level: "info"
            },
            error: {
                appenders: ["error"],
                level: "error"
            },
            response: {
                appenders: ["response"],
                level: "info"
            }
        } 
    }
}

module.exports = CONFIG;