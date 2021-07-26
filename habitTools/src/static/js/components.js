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
        loginDialog: false,
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
        requestLock: false,
        taskDetailDialog: false,
        taskDetails: {
            id: "",
            text: "",
            notes: "",
            up: true,
            down: false,
            priority: "",
            frequency: "",
            counterUp: 0,
            counterDown: 0,
            checklist: [],
            newInputCheckList: "",
            startDate: "",
            everyX: 0,
            repeat: {"m": true, "t": true, "w": true, "th": true, "f": true, "s": true, "su": true},
            streak: 0,
            date: ""
        },
        pickerOptions: {
            shortcuts: [{
                text: '昨天',
                onClick(picker) {
                    const date = new Date();
                    date.setTime(date.getTime() - 3600 * 1000 * 24);
                    picker.$emit('pick', date);
                }
            }, {
                text: '今天',
                onClick(picker) {
                    picker.$emit('pick', new Date());
                }
            }, {
                text: '明天',
                onClick(picker) {
                    const date = new Date();
                    date.setTime(date.getTime() + 3600 * 1000 * 24);
                    picker.$emit('pick', date);
                }
            }]
        }
    },
    methods: {
        onRegistered() {openBrowser("https://habitica.com/static/home");},
        onLogin() {this.loginDialog = false;},
        doNone() {return false;},
        showErrMsg(msg) {
            let showMsg = !msg ? '失去同步' : msg === 429 ? '操作频繁，休息一会' : msg === 400 ? '提交内容有误' : '失去同步，' + msg;
            let that = this;
            setTimeout(function () {that.$message.error(showMsg);}, 200);
        },
        loginHabitica() {
            let user = this.userForm.user;
            let key = this.userForm.key;
            if (user.trim().length <= 0 || key.trim().length <= 0) {
                this.loginDialog = true;
                this.showErrMsg("请输入你的凭证");
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
                    this.loginDialog = true;
                    this.showErrMsg(data + " 校验失败");
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
                this.loginDialog = true;
                return;
            }
            getHBUserInfo((success, data) => {
                if (success) {
                    this.refreshData(data);
                } else {
                    if (data !== 429) {
                        this.onLogout();
                    }
                    this.showErrMsg(data);
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
                    this.showErrMsg();
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
                            counterDown: task.counterDown,
                            priority: String(task.priority),
                            frequency: task.frequency
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
                            priority: String(task.priority),
                            frequency: task.frequency,
                            startDate: task.startDate,
                            streak: task.streak
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
                            date: task.date,
                            dateMsg: getDateReminder(now, task.date),
                            priority: String(task.priority),
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
                    if (this.undoneList.length <= 0) {
                        cronTask((success) => {
                            success ? this.onSynchronousData() : this.openHabitica();
                        });
                    }
                }
                this.$message({message: '同步完成', center: true, type: 'success', duration: 1000, offset: 70});
            });
        },
        onLogout() {
            this.isLoading = true;
            headers["x-api-user"] = '';
            headers["x-api-key"] = '';
            delInDB(DB_KEY_USER_INFO);
            delInDB(DB_KEY_TAG_SETTING);
            this.loginDialog = true;
        },
        openHabitica() {openBrowser("https://habitica.com");},
        formatHP(percentage) {return ~~this.HP;},
        formatEXP(percentage) {return ~~this.EXP;},
        formatMP(percentage) {return ~~this.MP;},
        changeCollapseIcon(id, collapseChecklist) {updateHBTask(id, {"collapseChecklist": collapseChecklist},()=>{});},
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
                        if (selectTag === 9) {
                            this.todoList.push(task);
                        }
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
                    this.showErrMsg(data);
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
                    this.showErrMsg();
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
                        this.showErrMsg(data);
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
        },
        handleOpenDetails(task){
            let list = task.checklist ? JSON.parse(JSON.stringify(task.checklist)) : [];
            this.taskDetails = {
                id: task.id,
                text: task.text,
                notes: task.notes,
                up: task.up,
                down: task.down,
                priority: task.priority,
                frequency: task.frequency,
                counterUp: task.counterUp,
                counterDown: task.counterDown,
                checklist: list,
                newInputCheckList: "",
                startDate: task.startDate,
                everyX: task.everyX,
                repeat: task.repeat,
                streak: task.streak,
                date: task.date
            };
            this.taskDetailDialog = true;
        },
        handleTaskDetailClose() {
            this.taskDetailDialog = false;
            this.taskDetails = {};
        },
        createSubTask() {
            let input = this.taskDetails.newInputCheckList;
            if (input == null || input.trim().length <= 0) {
                return;
            }
            let uuidUrl = URL.createObjectURL(new Blob()).toString();
            let uuid = uuidUrl.substr(uuidUrl.lastIndexOf("/") + 1);
            this.taskDetails.checklist.push({
                "completed": false,
                "text": input,
                "id": uuid
            });
            this.taskDetails.newInputCheckList = "";
        },
        deleteSubTask(id) {
            for (let i = 0; i < this.taskDetails.checklist.length; i++) {
                if (this.taskDetails.checklist[i].id === id) {
                    this.taskDetails.checklist.splice(i, 1);
                }
            }
        },
        deleteIfNull(item) {
            if (!item ||!item.text || item.text.length <= 0) {
                this.deleteSubTask(item.id);
            }
        },
        onUpdateTask() {
            updateHBTask(this.taskDetails.id, this.taskDetails, (success, data) => {
                if (success) {
                    this.onSynchronousData();
                    this.taskDetailDialog = false;
                    this.taskDetails = {};
                } else {
                    this.showErrMsg(data);
                }
            });
        },
        onDeleteTask(id) {
            this.$confirm('确定删除？', '提示', {
                confirmButtonText: '很确定',
                cancelButtonText: '手抖了',
                type: 'warning'
            }).then(() => {
                deleteHBTask(this.taskDetails.id, (success, data) => {
                    if (success) {
                        this.onSynchronousData();
                        this.taskDetailDialog = false;
                        this.taskDetails = {};
                    } else {
                        this.showErrMsg(data);
                    }
                });
            });
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
                    if ((newVal === 7 && !list[i].completed) || (newVal === 8 && list[i].date && !list[i].completed)) {
                        this.showTaskList.push(list[i]);
                    }
                }
                this.conservedTag[2] = newVal;
            } else if (newVal === 9) {
                getHBCompletedTask((tasks) => {
                    if (tasks == null) {
                        this.showErrMsg();
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
                            date: task.date,
                            dateMsg: getDateReminder(now, task.date)
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