// 定义一个混入对象
var myMixin = {
    data() {
        return {
            postedOn: ""
        }
    },
    created: function () {},
    methods: {
        timeFormat: function (timeStampStr) {
            const time = new Date(Number(timeStampStr));
            const years = time.getFullYear();
            const month = time.getMonth() + 1;
            const date = time.getDate();
            this.postedOn = years + "." + month + "." + date;
        }
    }
}

export default myMixin;