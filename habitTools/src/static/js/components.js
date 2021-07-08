Vue.component('loading', {
    data: function () {
        return {
            showImg: true
        }
    },
    created() {
        let state = false;
        if (this.timer) {
            clearInterval(this.timer);
        } else {
            this.timer = setInterval(() => {
                this.showImg = state;
                state = !state;
            }, 500);
        }
    },
    destroyed() {
        clearInterval(this.timer);
    },
    template: '<transition name="fade"><div id="start_image" v-show="showImg"><el-image src="./src/static/img/habitica.png" fit="contain"></el-image></div></transition>'
});

new Vue({
    el: '#app',
    data: {
        isLoading: true,
        dialog: false,
        userForm: {user: "", key: ""},
        userAvatarImg: "",
        name: "",
        username: "",
        level: 0,
        HP: 0,
        EXP: 0,
        maxEXP: 0,
        MP: 0,
        maxMP: 0,
        menuVal: 1,
        selectTag: 0,
        conservedTag: [0,4,7],
        dynamicTags: [{index: 1, name: "全 部"}, {index: 2, name: "偶 尔"}, {index: 3, name: "经 常"}],
        habitList: [],
        dailyList: [],
        todoList: [],
        undoneList: [],
        showTaskList: [],
        createInput: "",
        requestLock: false
    },
    methods: {
        onRegistered() {openBrowser("https://habitica.com/static/home");},
        onLogin() {this.dialog = false;},
        doNone() {return false;},
        showErrMsg(msg) {
            let that = this;
            setTimeout(function () {that.$message.error(msg);}, 200);
        },
        loginHabitica() {
            let user = this.userForm.user;
            let key = this.userForm.key;
            if (user.trim().length <= 0 || key.trim().length <= 0) {
                this.dialog = true;
                this.showErrMsg('请输入你的凭证');
                return;
            }
            headers["x-api-user"] = user;
            headers["x-api-key"] = key;
            getHBUserInfo((success, data) => {
                if (success) {
                    this.refreshData(data);
                    saveToDB(DB_KEY_USER_INFO, window.btoa(this.userForm.key + DB_KEY_SPLIT + this.userForm.user));
                    this.userForm.key = '';
                    this.userForm.user = '';
                    this.isLoading = false;
                } else {
                    this.dialog = true;
                    this.showErrMsg(data === 429 ? '登录频繁，休息一会' : '登录失败，' + data);
                }
            });
        },
        isNotLogin() {
            if (!headers["x-api-user"]) {
                const userInfo = getFromDB(DB_KEY_USER_INFO);
                if (!userInfo) {
                    return true;
                }
                let values = window.atob(userInfo).split(DB_KEY_SPLIT);
                headers["x-api-user"] = values[1];
                headers["x-api-key"] = values[0];
            }
            return false;
        },
        onSynchronousData() {
            if (this.isNotLogin()) {
                this.dialog = true;
                return;
            }
            getHBUserInfo((success, data) => {
                if (success) {
                    this.refreshData(data);
                } else {
                    if (data === 429) {
                        this.showErrMsg('操作频繁，休息一会');
                    } else {
                        this.dialog = true;
                        this.showErrMsg('失去同步，' + data);
                    }
                }
            });
        },
        refreshData(userInfo) {
            this.name = userInfo.profile.name;
            this.username = userInfo.auth.local.username;
            this.level = userInfo.stats.lvl;
            let hp = userInfo.stats.hp;
            if (hp <= 0) {
                this.HP = 0;
                this.openHabitica();
            } else {
                this.HP = hp;
            }
            this.EXP = userInfo.stats.exp;
            this.maxEXP = userInfo.stats.toNextLevel;
            this.MP = userInfo.stats.mp;
            this.maxMP = userInfo.stats.maxMP;
            this.userAvatarImg = "./src/static/svg/" + userInfo.stats.class + ".svg";
            this.isLoading = false;
            getHBHabit((tasks) =>{
                if (tasks == null) {
                    this.showErrMsg('失去同步');
                    return;
                }
                this.habitList = [];
                this.dailyList = [];
                this.todoList = [];
                this.undoneList = [];
                let now = new Date();
                for (let i = 0; i < tasks.length ; ++i) {
                    let task = tasks[i];
                    if (task.type === "habit") {
                        this.habitList.push({
                            id: task.id,
                            text: task.text,
                            notes: task.notes,
                            value: task.value,
                            color: getColorByValue(task.value),
                            up: task.up,
                            down: task.down,
                            counterUp: task.counterUp,
                            counterDown: task.counterDown
                        });
                    }else if (task.type === "daily") {
                        this.dailyList.push({
                            id: task.id,
                            text: task.text,
                            notes: task.notes,
                            color: getColorByValue(task.value),
                            completed: task.completed,
                            isDue: task.isDue,
                            repeat: task.repeat,
                            everyX: task.everyX,
                            collapseChecklist: task.collapseChecklist,
                            checklist: task.checklist,
                            yesterDaily: task.yesterDaily,
                        });
                    }else if (task.type === "todo") {
                        this.todoList.push({
                            id: task.id,
                            text: task.text,
                            notes: task.notes,
                            color: getColorByValue(task.value),
                            completed : task.completed,
                            collapseChecklist: task.collapseChecklist,
                            checklist: task.checklist,
                            date: getDateReminder(now, task.date)
                        });
                    }
                }
                this.setDefaultTag(0);
                let lastCron = new Date(userInfo.lastCron);
                let todayCron = new Date();
                todayCron.setHours(userInfo.preferences.dayStart);
                todayCron.setMinutes(0);
                todayCron.setSeconds(0);
                todayCron.setMilliseconds(0);
                let shouldCron = false;
                if (lastCron < todayCron) {
                    //上次结算时间 < 今天结算时间
                    if ((now.getTime() - lastCron.getTime()) / 1000 / 60 / 60 < 24) {
                        //当前时间 - 上次结算时间 < 24小时
                        if (todayCron <= now) {
                            // 当前时间大于等于今天结算时间
                            shouldCron = true;
                        }
                    } else {
                        //大于24小时
                        shouldCron = true;
                    }
                }
                if (shouldCron) {
                    const weekDay = ["su", "m", "t", "w", "th", "f", "s"];
                    let index = weekDay[now.getDay() - 1];
                    for (let i = 0; i < this.dailyList.length; ++i) {
                        let daily = this.dailyList[i];
                        if ((daily.everyX === 1 && daily.repeat[index] && !daily.completed) ||
                            (daily.everyX > 1 && daily.isDue && !daily.completed)) {
                            this.undoneList.push(daily);
                        }
                    }
                }
                this.$message({message: '同步成功', center: true, type: 'success', duration: 1000, offset: 70});
            });
        },
        onLogout() {
            this.isLoading = true;
            headers["x-api-user"] = '';
            headers["x-api-key"] = '';
            delInDB(DB_KEY_USER_INFO);
            delInDB(DB_KEY_TAG_SETTING);
            this.dialog = true;
        },
        openHabitica() {openBrowser("https://habitica.com");},
        formatHP(percentage) {return ~~this.HP;},
        formatEXP(percentage) {return ~~this.EXP;},
        formatMP(percentage) {return ~~this.MP;},
        changeCollapseIcon(id, collapseChecklist) {updateHBTask(id, {"collapseChecklist": collapseChecklist});},
        scoreTask(task, direction) {
            if (this.requestLock) {
                return;
            }
            this.requestLock = true;
            let menuVal = this.menuVal;
            if (menuVal === 1 && ((direction === 'up' && !task.up) || (direction === 'down' && !task.down))) {
                return;
            }
            scoreHBTask(task.id, direction, async (success, data) => {
                if (success) {
                    let selectTag = this.selectTag;
                    if (menuVal === 1) {
                        direction === 'up' ? task.counterUp++ : task.counterDown++;
                        task.value += data.delta;
                        task.color = getColorByValue(task.value);
                        if ((selectTag === 2 && task.value >= 1) || (selectTag === 3 && task.value < 1)) {
                            this.selectTag = 0;
                        }
                    } else {
                        task.completed = !task.completed;
                        task.color = getColorByValue(task.value);
                        this.selectTag = 0;
                    }

                    let hp = data.hp;
                    if (hp < this.HP) {
                        await this.$notify({message: '生命：-' + (this.HP - hp).toFixed(2), position: 'bottom-left', type: 'warning', duration: 2000, offset:70});
                    }
                    if (hp <= 0) {
                        this.HP = 0;
                        this.openHabitica();
                    } else {
                        this.HP = hp;
                    }
                    if (data.lvl > this.level) {
                        await this.$notify({message: '经验：+' + (this.maxEXP - this.EXP + data.exp).toFixed(2), position: 'bottom-left', type: 'success', duration: 2000, offset:70});
                        await this.$notify({message: '升级了！', position: 'bottom-left', type: 'success', duration: 2000, offset:70});
                    } else if (data.exp < this.EXP) {
                        await this.$notify({message: '经验：-' + (this.EXP - data.exp).toFixed(2), position: 'bottom-left', type: 'warning', duration: 2000, offset:70});
                    } else if (data.exp > this.EXP){
                        await this.$notify({message: '经验：+' + (data.exp - this.EXP).toFixed(2), position: 'bottom-left', type: 'success', duration: 2000, offset:70});
                    }
                    if (data.mp < this.MP) {
                        await this.$notify({message: '魔法：-' + (this.MP - data.mp).toFixed(2), position: 'bottom-left', type: 'warning', duration: 2000, offset:70});
                    } else if (data.mp > this.MP){
                        await this.$notify({message: '魔法：+' + (data.mp - this.MP).toFixed(2), position: 'bottom-left', type: 'success', duration: 2000, offset:70});
                    }
                    this.level = data.lvl;
                    this.EXP = data.exp;
                    this.MP = data.mp;
                } else {
                    this.showErrMsg(data === 429 ? '操作频繁，休息一会' : '失去同步，' + data);
                }
                this.requestLock = false;
            });
        },
        scoreCheckList(taskId, checkListId) {scoreHBCheckList(taskId, checkListId);},
        create() {
            let type = this.menuVal === 1 ? "habit" : this.menuVal === 2 ? "daily" : this.menuVal === 3 ? "todo" : "";
            createTask(this.createInput, type, (success) => {
                if (success) {
                    this.createInput = '';
                } else {
                    this.showErrMsg('失去同步');
                }
                this.onSynchronousData();
            });
        },
        completedYesterday() {
            let doneList = [];
            for (let i = 0; i < this.undoneList.length; ++i) {
                let task = this.undoneList[i];
                if (task.completed) {
                    doneList.push({id: task.id, direction: "up"});
                }
            }
            if (doneList.length > 0) {
                bulkUpScore(doneList, (success, data) => {
                    if (success) {
                        this.undoneList = [];
                        cronTask((cronSuccess) => {
                            cronSuccess ? this.onSynchronousData() : this.openHabitica();
                        });
                    } else {
                        this.showErrMsg('失去同步，' + data);
                    }
                });
            } else {
                cronTask((success) => {
                    success ? this.onSynchronousData() : this.openHabitica();
                });
            }
        },
        setDefaultTag(reset) {
            if (this.conservedTag[0] === 0) {
                let tags = getFromDB(DB_KEY_TAG_SETTING);
                if (!tags) {
                    this.selectTag = 1;
                    this.conservedTag[0] = 1;
                    return;
                }
                let stringArr = tags.split(DB_KEY_SPLIT);
                for (let i = 0; i < stringArr.length; ++i) {
                    this.conservedTag[i] = parseInt(stringArr[i]);
                }
            }else if (reset === 0) {
                this.selectTag = 0;
                return;
            }
            this.selectTag = this.conservedTag[this.menuVal - 1];
        }
    },
    mounted() {utools.onPluginEnter(() => this.onSynchronousData());},
    filters: {
        ellipsisName: function(value) {
            if (!value) return '';
            if (/^[A-Za-z0-9]+$/.test(value)) {
                return value.length < 15 ? value : value.slice(0, 13) + '...';
            } else {
                return value.length < 8 ? value : value.slice(0, 6) + '...';
            }
        },
        ellipsisUserName: function (value) {
            if (!value) return '';
            if (value.length < 8) return value;
            return value.slice(0, 7) + '...';
        }
    },
    watch: {
        menuVal: function (newVal, oldVal) {
            if (newVal === 1) {
                this.dynamicTags = [{index: 1, name: "全 部"}, {index: 2, name: "偶 尔"}, {index: 3, name: "经 常"}];
            }else if (newVal === 2) {
                this.dynamicTags = [{index: 4, name: "全 部"}, {index: 5, name: "待 办"}, {index: 6, name: "已 办"}];
            }else if (newVal === 3) {
                this.dynamicTags = [{index: 7, name: "进 行"}, {index: 8, name: "限 时"}, {index: 9, name: "已 办"}];
            }
            this.setDefaultTag();
        },
        selectTag: function (newVal, oldVal) {
            if (newVal === 0) {
                this.selectTag = newVal = this.conservedTag[this.menuVal - 1];
                return;
            }
            this.showTaskList = [];
            let oldArr = this.conservedTag.join(DB_KEY_SPLIT);
            if (newVal === 1) {
                this.showTaskList = this.habitList;
                this.conservedTag[0] = newVal;
            } else if (newVal === 2 || newVal === 3) {
                let list = this.habitList;
                for (let i = 0; i < list.length; ++i) {
                    if ((newVal === 2 && list[i].value < 1) || (newVal === 3 && list[i].value >= 1)) {
                        this.showTaskList.push(list[i]);
                    }
                }
                this.conservedTag[0] = newVal;
            } else if (newVal === 4) {
                this.showTaskList = this.dailyList;
                this.conservedTag[1] = newVal;
            } else if (newVal === 5 || newVal === 6) {
                let list = this.dailyList;
                for (let i = 0; i < list.length; ++i) {
                    let isUndo = list[i].completed || !list[i].isDue;
                    if ((newVal === 5 && !isUndo) || (newVal === 6 && isUndo)) {
                        this.showTaskList.push(list[i]);
                    }
                }
                this.conservedTag[1] = newVal;
            } else if (newVal === 7 || newVal === 8) {
                let list = this.todoList;
                for (let i = 0; i < list.length; ++i) {
                    if ((newVal === 7 && !list[i].completed) || (newVal === 8 && list[i].date)) {
                        this.showTaskList.push(list[i]);
                    }
                }
                this.conservedTag[2] = newVal;
            } else if (newVal === 9) {
                getHBCompletedTask((tasks) => {
                    if (tasks == null) {
                        this.showErrMsg('失去同步');
                        return;
                    }
                    let now = new Date();
                    for (let i = 0; i < tasks.length; ++i) {
                        let task = tasks[i];
                        this.showTaskList.push({
                            id: task.id,
                            text: task.text,
                            notes: task.notes,
                            color: getColorByValue(task.value),
                            completed: task.completed,
                            collapseChecklist: task.collapseChecklist,
                            checklist: task.checklist,
                            date: getDateReminder(now, task.date)
                        });
                    }
                    this.conservedTag[2] = newVal;
                });
            }
            setTimeout(() => {
                let saveArr = this.conservedTag.join(DB_KEY_SPLIT);
                if (saveArr !== oldArr) {
                    let rev = getRevFromDB(DB_KEY_TAG_SETTING);
                    saveToDB(DB_KEY_TAG_SETTING, saveArr, rev);
                }
            }, 1);
        }
    }
});